# Personal Link Page

A customized version of LittleLink for personal use with automated FAQ management.

## 🚀 Features

- **Static Site**: Optimized for Cloudflare Pages deployment
- **Automated FAQ Management**: Markdown-to-JSON conversion via GitHub Actions
- **Multi-language Support**: Japanese and English versions
- **Responsive Design**: Works on all devices
- **Fast Loading**: Minimal dependencies and optimized performance

## 📁 Project Structure

```
├── index.html              # Main landing page
├── booking-jp.html         # Japanese booking page
├── booking-en.html         # English booking page
├── js/
│   └── faq-loader.js       # Shared FAQ loading module
├── data/
│   ├── faqs-jp.md          # Japanese FAQ (manually maintained)
│   ├── faqs-en.md          # English FAQ (manually maintained)
│   ├── faqs-jp.json        # Japanese FAQ JSON (auto-generated)
│   └── faqs-en.json        # English FAQ JSON (auto-generated)
├── css/                    # Stylesheets
├── images/                 # Images and icons
└── .github/workflows/      # GitHub Actions
```

## 🔄 FAQ Management Workflow

### 1. Edit FAQ Content

Only edit the Markdown files:
- Japanese: `data/faqs-jp.md`
- English: `data/faqs-en.md`

### 2. Markdown Format

```markdown
# FAQ Title

## Question 1 Title

Answer content for question 1...

Supports:
- List items
- **Bold text**
- [Links](https://example.com)

## Question 2 Title

Answer content for question 2...
```

### 3. Automated Process

When you push changes to Markdown files to the `main` branch:

1. GitHub Actions detects changes to `data/faqs-*.md`
2. Automatically converts Markdown to JSON format
3. Deploys all files (including generated JSON) to `deploy` branch
4. Cloudflare Pages deploys from `deploy` branch (single deployment)

**Branch Structure:**
- `main`: Source code with Markdown files (your working branch)
- `deploy`: Production-ready files with generated JSON (Cloudflare Pages deployment source)

---
---
