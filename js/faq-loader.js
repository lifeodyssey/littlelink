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
   * Convert simple Markdown syntax to HTML
   * @param {string} text - Text containing Markdown syntax
   * @returns {string} - Converted HTML
   */
  parseMarkdown(text) {
    // Convert list items
    text = text.replace(/^-\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul tags
    text = text.replace(/(<li>.*<\/li>)/gs, function(match) {
      return '<ul>' + match + '</ul>';
    });

    // Convert bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Handle line breaks: double newlines become paragraph separators, single newlines become <br>
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');

    // Wrap in paragraph tags if not starting with ul or p
    if (!text.startsWith('<ul>') && !text.startsWith('<p>')) {
      text = '<p>' + text + '</p>';
    }

    return text;
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
