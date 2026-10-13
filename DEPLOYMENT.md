# Deployment

The site uses two branches:

- `main`: source files
- `deploy`: production files managed by GitHub Actions

Cloudflare Pages should use `deploy` as its production branch, no build command,
and the repository root as its output directory.

## Update the Site

1. Edit and validate the source files on `main`.
2. Commit and push to `main`.
3. The **Deploy static site** workflow synchronizes tracked files to `deploy`.
4. Cloudflare Pages deploys the updated branch.

The workflow rebuilds the deployment tree from `main` so deleted files do not
remain on the public site. Do not edit `deploy` manually.

The workflow retains its existing filename, `.github/workflows/build-faqs.yml`,
but no longer generates FAQ data.

## Verify Deployment

Check the GitHub Actions run, the `deploy` branch commit, and the live site.
The workflow can also be started with **Run workflow** when needed.
