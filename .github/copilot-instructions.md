# Repository Instructions

## Project
- This is a static Neocities website. The deploy workflow publishes `public/` directly, with no site-wide application framework or build step; the blog has its own optional Zoner2000 build script.
- Site pages and deployable assets belong in `public/`. `template.html` at the repository root is a starter template, not a build input.
- Deployment runs on pushes to `main` through `.github/workflows/neocities.yml` and requires the `NEOCITIES_API_TOKEN` secret. Do not change deployment behavior unless requested.
- Zoner2000 Markdown sources live in root-level `blog-zone/`; run `build-blog.cmd` to generate and sync the blog into `public/blog/`. Never build the blog into `public/` root or overwrite `public/index.html`.

## Editing
- Preserve the existing page-specific designs. Some pages use inline CSS and bespoke layouts; `public/style.css` is used by pages that link it. Do not consolidate styles or make pages visually uniform unless requested.
- Keep links, asset references, and navigation consistent with the existing static URL structure. Use paths that work when `public/` is the published root.
- Make focused edits and retain the site's retro/DIY visual character and responsive behavior.
- Avoid adding dependencies, build tooling, or generated files for simple HTML, CSS, and JavaScript changes.
- Whenever site content, styling, behavior, or assets change, add a newest-first entry to the Recent Updates changelog in `public/home.html`, dated `MM/DD/YYYY`. Consolidate changes made in quick succession or affecting the same page or feature into one entry instead of logging each small step. Preserve earlier history; the changelog pagination controls its page count.

## Validation
- No automated test or build command is configured. For static page changes, inspect the edited markup and CSS, check local asset paths and links, and preview the affected page in a browser when available.