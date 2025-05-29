const fs = require('fs');
const path = require('path');

function parseMarkdownToJSON(markdownContent) {
  const sections = markdownContent.split(/^## /m).slice(1);
  const faqs = [];

  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const question = lines[0].trim();
    const answerLines = lines.slice(1);

    while (answerLines.length > 0 && answerLines[0].trim() === '') {
      answerLines.shift();
    }

    const answer = answerLines.join('\n').trim();

    if (question && answer) {
      faqs.push({ question, answer });
    }
  });

  return { faqs };
}

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(file =>
  file.startsWith('faqs-') && file.endsWith('.md')
);

let totalProcessed = 0;
const results = [];

files.forEach(file => {
  const markdownPath = path.join(dataDir, file);
  const jsonPath = path.join(dataDir, file.replace('.md', '.json'));

  try {
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    const jsonData = parseMarkdownToJSON(markdownContent);

    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`✅ ${file} -> ${path.basename(jsonPath)} (${jsonData.faqs.length} items)`);
    results.push(`- ${file}: ${jsonData.faqs.length} FAQ items`);
    totalProcessed += jsonData.faqs.length;
  } catch (error) {
    console.error(`❌ Conversion failed: ${file}`, error.message);
    process.exit(1);
  }
});

console.log(`\n🎉 Successfully processed ${files.length} files, ${totalProcessed} FAQ items total`);

// Output results for subsequent steps
fs.writeFileSync('conversion-results.txt', results.join('\n'));
