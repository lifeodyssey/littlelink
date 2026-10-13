# Personal Link Page

A customized version of LittleLink for Zhenjia Zhou's personal links.

## Features

- Static site hosted on Cloudflare Pages
- Links to the blog, GitHub, LinkedIn, and other social profiles
- Responsive layout and automatic light/dark themes
- Search-engine and AI-readable site discovery

## Project Structure

- `index.html`: main landing page
- `privacy.html`: privacy policy
- `css/`, `fonts/`, `images/`: site assets
- `functions/_middleware.js`: Markdown content negotiation and retired-route responses
- `llms.txt`, `sitemap.xml`, `.well-known/`: site discovery
- `.github/workflows/build-faqs.yml`: static deployment workflow (legacy filename)

## Deployment

Edit source files on `main`. GitHub Actions synchronizes all tracked files to
`deploy`, removing files that no longer exist on `main`. Cloudflare Pages deploys
from `deploy`. See [DEPLOYMENT.md](DEPLOYMENT.md).
