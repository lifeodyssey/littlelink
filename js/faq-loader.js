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

    // Convert code blocks (triple backticks)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(_, lang, code) {
      const language = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${language}>${code.trim()}</code></pre>`;
    });

    // Convert inline code (single backticks)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert headers (## and ###)
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Convert bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Convert links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Convert list items (handle nested lists)
    const lines = text.split('\n');
    let inList = false;
    let listLevel = 0;
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^(\s*)-\s+(.+)$/);

      if (listMatch) {
        const indent = listMatch[1].length;
        const content = listMatch[2];
        const currentLevel = Math.floor(indent / 4);

        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
          listLevel = currentLevel;
        } else if (currentLevel > listLevel) {
          processedLines.push('<ul>');
          listLevel = currentLevel;
        } else if (currentLevel < listLevel) {
          for (let j = listLevel; j > currentLevel; j--) {
            processedLines.push('</ul>');
          }
          listLevel = currentLevel;
        }

        processedLines.push(`<li>${content}</li>`);
      } else {
        if (inList) {
          for (let j = 0; j <= listLevel; j++) {
            processedLines.push('</ul>');
          }
          inList = false;
          listLevel = 0;
        }
        processedLines.push(line);
      }
    }

    // Close any remaining lists
    if (inList) {
      for (let j = 0; j <= listLevel; j++) {
        processedLines.push('</ul>');
      }
    }

    text = processedLines.join('\n');

    // Handle paragraphs: split by double newlines, but preserve existing HTML tags
    const paragraphs = text.split(/\n\s*\n/);
    const processedParagraphs = paragraphs.map(para => {
      para = para.trim();
      if (!para) return '';

      // Don't wrap if it's already an HTML block element
      if (para.match(/^<(h[1-6]|ul|ol|li|pre|code|div|blockquote)/i)) {
        return para;
      }

      // Don't wrap if it's just a closing tag
      if (para.match(/^<\/(ul|ol|li|pre|code|div|blockquote)/i)) {
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