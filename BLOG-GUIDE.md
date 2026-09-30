# Blog Guide

The blog uses Zoner2000 to turn Markdown source files into a static site under `public/blog/`. The main VIGIL landing page remains `public/index.html`; do not run the generator against `public/` or copy the blog output to the site root.

## Add a Post

1. Create a Markdown file in `blog-zone/posts/` with a date-first filename:

   `YYYY-MM-DD-short-title.md`

   Example: `2026-09-30-a-small-update.md`.

2. Write the post in Markdown. Zoner2000 gets the post title and date from the filename, so do not add a duplicate top-level `#` heading or a `Title:` frontmatter field.

   ```markdown
   Today I wanted to write about...

   ## The main thing

   More text here. Markdown links, lists, images, and fenced code blocks are supported.
   ```

3. Save the file. The archive and RSS feed are generated automatically during the build.

## Build and Preview

From the Site folder, run `build-blog.cmd` (double-click it, or run `& .\build-blog.cmd` in PowerShell). The script runs the bundled Zoner2000 executable, then replaces and regenerates `public/blog/`.

Open `public/blog/index.html` locally to preview the blog index. Open a generated post in `public/blog/posts/` to check its formatting and navigation. The deployed URL is `https://lonkofhyrool.neocities.org/blog/`.

The script replaces `blog-zone-built/` and `public/blog/` on each run. Treat both as generated output: edit Markdown and theme files in `blog-zone/`, not the generated HTML. Removing a source post and rebuilding also removes its old generated page.

## Customize the Blog

- `blog-zone/index_My Notebook.md` controls the blog landing page and recent-post list.
- `blog-zone/archive.md` controls the full archive page.
- `blog-zone/header.md` controls the blog navigation and RSS metadata.
- `blog-zone/footer.md` controls the footer shared by generated pages.
- `blog-zone/style/style.css` controls blog presentation. It imports the site's shared visual overrides and window controls.

Change the header, footer, or stylesheet, then rebuild with `build-blog.cmd` to refresh the generated pages. Keep the header links pointed at the main site's pages, such as `/home.html`, `/guestbook.html`, `/credit.html`, and `/data.html`.

## Publish

Commit the updated Markdown source and generated `public/blog/` output. The existing deployment workflow publishes `public/` to Neocities when changes are pushed to `main`. `public/index.html` remains the main landing page; `public/blog.html` redirects old links to the generated blog.
