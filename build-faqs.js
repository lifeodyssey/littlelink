#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Convert Markdown FAQ files to JSON format
 * Usage: node build-faqs.js
 */

function parseMarkdownToJSON(markdownContent) {
  // Split sections by ##
  const sections = markdownContent.split(/^## /m).slice(1); // Skip title

  const faqs = [];

  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const question = lines[0].trim();

    // Get answer content (remove leading empty lines)
    const answerLines = lines.slice(1);
    while (answerLines.length > 0 && answerLines[0].trim() === '') {
      answerLines.shift();
    }

    const answer = answerLines.join('\n').trim();

    if (question && answer) {
      faqs.push({
        question: question,
        answer: answer
      });
    }
  });

  return { faqs };
}

function main() {
  try {
    // Read Markdown file
    const markdownPath = path.join(__dirname, 'data', 'faqs-jp.md');
    const jsonPath = path.join(__dirname, 'data', 'faqs-jp.json');

    if (!fs.existsSync(markdownPath)) {
      console.error(`Error: File not found ${markdownPath}`);
      process.exit(1);
    }

    const markdownContent = fs.readFileSync(markdownPath, 'utf8');

    // Convert to JSON
    const jsonData = parseMarkdownToJSON(markdownContent);

    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`✅ Successfully converted ${markdownPath} to ${jsonPath}`);
    console.log(`📊 Processed ${jsonData.faqs.length} FAQ items`);

  } catch (error) {
    console.error('❌ Error during conversion:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseMarkdownToJSON };
