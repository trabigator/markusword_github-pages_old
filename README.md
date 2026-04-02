# [markusword.de](https://www.markusword.de) - OLD VERSION

---

**See new GitHub project - [markusword.de - GitHub](https://github.com/trabigator/markusword.de)**

---

Personal blog and portfolio — cyberanalyst, OSINT specialist, software developer.

Built as a pure static site with no build tools. Hosted on GitHub Pages.

## Tech Stack

- **HTML/CSS/JavaScript** — no framework, no bundler
- **marked.js** — Markdown rendering for blog posts
- **DOMPurify** — XSS sanitization
- **GitHub Pages** — hosting + custom domain (www.markusword.de)

## Project Structure

```
.
├── index.html              # Homepage
├── post.html               # Single post viewer
├── about/index.html         # About page
├── imprint/index.html       # Legal imprint
├── posts/
│   ├── index.html          # Full post archive
│   ├── manifest.json       # Auto-generated post index
│   └── 2026/              # Blog posts (Markdown + frontmatter)
├── search/index.html       # Client-side search
├── tags/index.html         # Tag-filtered post list
├── scripts/
│   ├── generate-manifest.js  # Scans posts/, writes manifest.json
│   └── generate-rss.js      # Generates RSS feed
└── js/
    ├── posts.js            # Post loading & rendering
    ├── components.js       # Shared header/footer
    ├── marked.min.js       # Markdown renderer (self-hosted)
    └── purify.min.js       # XSS sanitizer (self-hosted)
```

## Writing Posts

1. Create a new `.md` file inside `posts/YYYY/` (create the year directory if it doesn't exist).
2. Copy `posts/post-template.md` for the frontmatter format.

**Required frontmatter:**
```yaml
---
headline: "Your Post Title"
date: "2026-03-18"
datetime: "2026-03-18T12:00:00Z"
readTime: "5 min read"
teaser: "A short description shown in post lists."
tags: ["tag1", "tag2"]
---
```

3. Save the file. The next `git commit` will auto-regenerate `posts/manifest.json` via the pre-commit hook.

## Build Scripts

Two Node.js scripts automate manifest and RSS generation:

```bash
node scripts/generate-manifest.js   # Regenerates posts/manifest.json
node scripts/generate-rss.js         # Regenerates rss.xml
```

They run automatically via **git hooks**:
- `pre-commit` → `generate-manifest.js` (runs before every commit)
- `pre-push` → `generate-rss.js` (runs before every push)

## Running Locally

Since this is a purely static site, any local server works:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000`.

## Deploying

Push to `main` — GitHub Pages serves from the root of the `main` branch. The `.nojekyll` file disables Jekyll processing so GitHub won't override the `_posts/` convention.

## License

MIT — see [LICENSE](LICENSE).
