/**
 * FAQ Loader - Shared Module
 * For loading and displaying FAQ content from JSON files
 */

class FAQLoader {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
  }

  /**
   * Convert enhanced Markdown syntax to HTML
   * @param {string} text - Text containing Markdown syntax
   * @returns {string} - Converted HTML
   */
  parseMarkdown(text) {
    // Escape HTML entities first
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Convert horizontal rules
    text = text.replace(/^---+$/gm, '<hr>');
    text = text.replace(/^\*\*\*+$/gm, '<hr>');

    // Convert code blocks (triple backticks)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(_, lang, code) {
      const language = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${language}>${code.trim()}</code></pre>`;
    });

    // Convert inline code (single backticks)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert headers (all levels)
    text = text.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    text = text.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    text = text.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert strikethrough text
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Convert bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Convert links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Convert blockquotes
    text = text.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

    // Convert list items (handle nested lists and ordered lists)
    const lines = text.split('\n');
    let listStack = []; // Stack to track nested lists: [{type: 'ul', level: 0}, ...]
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const unorderedMatch = line.match(/^(\s*)-\s+(.+)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);

      const listMatch = unorderedMatch || orderedMatch;
      const currentListType = unorderedMatch ? 'ul' : 'ol';

      if (listMatch) {
        const indent = listMatch[1].length;
        const content = listMatch[2];
        // Calculate level: every 4 spaces = 1 level (standard markdown)
        const currentLevel = Math.floor(indent / 4);

        // Close lists that are at the same level or deeper
        while (listStack.length > 0 && listStack[listStack.length - 1].level >= currentLevel) {
          const closingList = listStack.pop();
          processedLines.push(`</${closingList.type}>`);
        }

        // Open new list if needed
        if (listStack.length === 0 || listStack[listStack.length - 1].level < currentLevel) {
          processedLines.push(`<${currentListType}>`);
          listStack.push({ type: currentListType, level: currentLevel });
        } else if (listStack[listStack.length - 1].type !== currentListType) {
          // Same level but different type - close and open new
          const closingList = listStack.pop();
          processedLines.push(`</${closingList.type}>`);
          processedLines.push(`<${currentListType}>`);
          listStack.push({ type: currentListType, level: currentLevel });
        }

        processedLines.push(`<li>${content}</li>`);

      } else {
        // Not a list item - but don't close lists for empty lines or paragraphs within list contexts
        const isEmpty = line.trim() === '';
        const isBoldText = line.match(/^\*\*.*\*\*$/);
        
        // Only close lists if we encounter a significant structural element
        // Keep lists open for empty lines, bold text headers, etc.
        if (!isEmpty && !isBoldText) {
          while (listStack.length > 0) {
            const closingList = listStack.pop();
            processedLines.push(`</${closingList.type}>`);
          }
        }
        processedLines.push(line);
      }
    }

    // Close any remaining lists
    while (listStack.length > 0) {
      const closingList = listStack.pop();
      processedLines.push(`</${closingList.type}>`);
    }

    text = processedLines.join('\n');

    // Convert tables
    text = this.convertTables(text);

    // Handle paragraphs: split by double newlines, but preserve existing HTML tags
    const paragraphs = text.split(/\n\s*\n/);
    const processedParagraphs = paragraphs.map(para => {
      para = para.trim();
      if (!para) return '';

      // Don't wrap if it's already an HTML block element
      if (para.match(/^<(h[1-6]|ul|ol|li|pre|code|div|blockquote|table|hr)/i)) {
        return para;
      }

      // Don't wrap if it's just a closing tag
      if (para.match(/^<\/(ul|ol|li|pre|code|div|blockquote|table)/i)) {
        return para;
      }

      // Don't wrap if it's a self-closing tag
      if (para.match(/^<(hr|br)\s*\/?>$/i)) {
        return para;
      }

      // Convert single line breaks to <br> within paragraphs
      para = para.replace(/\n/g, '<br>');

      return `<p>${para}</p>`;
    });

    text = processedParagraphs.filter(p => p).join('\n');

    // Clean up extra whitespace and empty paragraphs
    text = text.replace(/<p>\s*<\/p>/g, '');
    text = text.replace(/\n+/g, '\n');

    return text.trim();
  }

  /**
   * Convert markdown tables to HTML
   * @param {string} text - Text containing potential tables
   * @returns {string} - Text with tables converted to HTML
   */
  convertTables(text) {
    const lines = text.split('\n');
    const processedLines = [];
    let inTable = false;
    let tableHeaders = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line looks like a table row (contains |)
      if (line.includes('|') && line.length > 1) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        // Check if next line is a separator (contains --- or similar)
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const isSeparator = nextLine.match(/^\|?[\s\-\|:]+\|?$/);

        if (!inTable) {
          // Start new table
          processedLines.push('<table>');
          inTable = true;

          if (isSeparator) {
            // This is a header row
            processedLines.push('<thead>');
            processedLines.push('<tr>');
            cells.forEach(cell => {
              processedLines.push(`<th>${cell}</th>`);
            });
            processedLines.push('</tr>');
            processedLines.push('</thead>');
            processedLines.push('<tbody>');
            tableHeaders = cells;
            i++; // Skip the separator line
          } else {
            // Regular row
            processedLines.push('<tbody>');
            processedLines.push('<tr>');
            cells.forEach(cell => {
              processedLines.push(`<td>${cell}</td>`);
            });
            processedLines.push('</tr>');
          }
        } else {
          // Continue table
          processedLines.push('<tr>');
          cells.forEach(cell => {
            processedLines.push(`<td>${cell}</td>`);
          });
          processedLines.push('</tr>');
        }
      } else {
        // Not a table row
        if (inTable) {
          // End current table
          processedLines.push('</tbody>');
          processedLines.push('</table>');
          inTable = false;
          tableHeaders = [];
        }
        processedLines.push(line);
      }
    }

    // Close table if still open
    if (inTable) {
      processedLines.push('</tbody>');
      processedLines.push('</table>');
    }

    return processedLines.join('\n');
  }

  /**
   * Create DOM element for a single FAQ item
   * @param {Object} faq - FAQ object containing question and answer
   * @returns {HTMLElement} - DOM element for the FAQ item
   */
  createFAQItem(faq) {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';

    const questionElement = document.createElement('div');
    questionElement.className = 'faq-question';
    questionElement.textContent = faq.question;

    const answerElement = document.createElement('div');
    answerElement.className = 'faq-answer';
    answerElement.innerHTML = this.parseMarkdown(faq.answer);

    faqItem.appendChild(questionElement);
    faqItem.appendChild(answerElement);

    return faqItem;
  }

  /**
   * Load FAQ data from specified JSON file
   * @param {string} jsonPath - Path to the JSON file
   * @param {Object} options - Options object
   * @param {string} options.loadingText - Text to display while loading
   * @param {string} options.errorText - Text to display on error
   * @param {string} options.emptyText - Text to display when no data
   */
  async loadFAQs(jsonPath, options = {}) {
    const {
      loadingText = 'Loading FAQs...',
      errorText = 'Sorry, there was an error loading the FAQs. Please try again later.',
      emptyText = 'No FAQs available at the moment.'
    } = options;

    // Show loading state
    this.container.innerHTML = `<p>${loadingText}</p>`;

    try {
      const response = await fetch(jsonPath);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Clear container
      this.container.innerHTML = '';

      // Validate data format
      if (!data.faqs || !Array.isArray(data.faqs)) {
        throw new Error('Invalid data format: expected { faqs: Array }');
      }

      // If no FAQ data
      if (data.faqs.length === 0) {
        this.container.innerHTML = `<p>${emptyText}</p>`;
        return;
      }

      // Create and add FAQ items
      data.faqs.forEach(faq => {
        if (faq.question && faq.answer) {
          const faqElement = this.createFAQItem(faq);
          this.container.appendChild(faqElement);
        }
      });

      console.log(`✅ Successfully loaded ${data.faqs.length} FAQ items from ${jsonPath}`);

    } catch (error) {
      console.error('Error loading FAQs:', error);
      this.container.innerHTML = `<p>${errorText}</p>`;

      // Optional: Send error report to analytics service
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
          description: `FAQ loading error: ${error.message}`,
          fatal: false
        });
      }
    }
  }
}

// Export as global variable (for environments that don't support modules)
if (typeof window !== 'undefined') {
  window.FAQLoader = FAQLoader;
}

// Export as module (for environments that support modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAQLoader;
}