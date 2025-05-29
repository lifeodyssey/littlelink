# Deployment Setup Guide

This guide explains how to set up the automated deployment workflow using the `deploy` branch strategy.

## 🎯 Overview

This project uses a two-branch deployment strategy to avoid double deployments:

- **`main` branch**: Source code with Markdown files (development)
- **`deploy` branch**: Production-ready files with generated JSON (deployment)

## 🔧 Cloudflare Pages Setup

### 1. Configure Deployment Branch

In your Cloudflare Pages project settings:

1. Go to **Settings** → **Builds & deployments**
2. Set **Production branch** to `deploy` (not `main`)
3. Set **Build command** to: (leave empty or use `echo "No build needed"`)
4. Set **Build output directory** to: `/` (root directory)

### 2. Environment Variables (Optional)

No special environment variables are needed for this setup.

## 🚀 How It Works

### Workflow Steps

1. **Developer Action**: Push Markdown changes to `main` branch
2. **GitHub Actions**: 
   - Detects changes in `data/faqs-*.md`
   - Converts Markdown to JSON
   - Copies all files to `deploy` branch
   - Pushes to `deploy` branch
3. **Cloudflare Pages**: Detects `deploy` branch update and deploys

### File Flow

```
main branch (source)          deploy branch (production)
├── data/faqs-jp.md    →     ├── data/faqs-jp.md
├── data/faqs-en.md    →     ├── data/faqs-en.md
├── booking-jp.html    →     ├── booking-jp.html
├── booking-en.html    →     ├── booking-en.html
├── js/faq-loader.js   →     ├── js/faq-loader.js
└── ...                →     ├── data/faqs-jp.json  (generated)
                             ├── data/faqs-en.json  (generated)
                             └── ...
```

## 🛠️ Initial Setup

### 1. Create Deploy Branch (First Time)

The GitHub Actions workflow will automatically create the `deploy` branch on the first run. However, if you want to create it manually:

```bash
# Create and switch to deploy branch
git checkout -b deploy

# Push to create remote branch
git push -u origin deploy

# Switch back to main
git checkout main
```

### 2. Update Cloudflare Pages

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** → **Builds & deployments**
4. Change **Production branch** from `main` to `deploy`
5. Save settings

## 🔄 Daily Workflow

### For Content Updates

1. Edit FAQ files in `main` branch:
   ```bash
   # Edit the Markdown files
   vim data/faqs-jp.md
   vim data/faqs-en.md
   
   # Commit and push
   git add data/faqs-*.md
   git commit -m "Update FAQ content"
   git push origin main
   ```

2. GitHub Actions automatically:
   - Generates JSON files
   - Deploys to `deploy` branch

3. Cloudflare Pages automatically deploys from `deploy` branch

### For Code Updates

1. Edit HTML, CSS, or JS files in `main` branch:
   ```bash
   # Edit files
   vim booking-jp.html
   vim js/faq-loader.js
   
   # Commit and push
   git add .
   git commit -m "Update website code"
   git push origin main
   ```

2. If FAQ Markdown files were also changed, the workflow runs automatically
3. If only code was changed, manually trigger the workflow or wait for next FAQ update

## 🚨 Troubleshooting

### Deploy Branch Out of Sync

If the `deploy` branch gets out of sync:

```bash
# Delete and recreate deploy branch
git push origin --delete deploy
git branch -D deploy

# Next push to main will recreate it
git push origin main
```

### Manual Deployment

To manually trigger deployment:

1. Go to GitHub → Actions
2. Select "🤖 Build FAQs and Deploy" workflow
3. Click "Run workflow" → "Run workflow"

### Cloudflare Pages Not Updating

1. Check that Cloudflare Pages is set to deploy from `deploy` branch
2. Check GitHub Actions logs for errors
3. Verify `deploy` branch has the latest changes

## 📊 Monitoring

### GitHub Actions

- View workflow runs: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- Check deployment status in the workflow summary

### Cloudflare Pages

- View deployments: Cloudflare Pages dashboard → Your project → Deployments
- Check build logs for any issues

## 🔒 Security Notes

- The workflow uses `GITHUB_TOKEN` which has appropriate permissions
- No additional secrets or tokens are required
- The `deploy` branch is automatically managed by GitHub Actions

## 📝 Best Practices

1. **Never manually edit the `deploy` branch** - it's automatically managed
2. **Always work in the `main` branch** for all changes
3. **Test locally** before pushing to main
4. **Use descriptive commit messages** for better tracking
5. **Monitor GitHub Actions** to ensure deployments succeed
