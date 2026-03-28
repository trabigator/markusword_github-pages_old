const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'manifest.json');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

// Guard against path traversal: ensure resolvedPath is inside basePath
function assertSafePath(basePath, resolvedPath) {
  const relative = path.relative(basePath, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal detected: ${resolvedPath}`);
  }
}

const SITE_URL = 'https://www.markusword.de';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/posts/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/search/', priority: '0.5', changefreq: 'monthly' },
  { loc: '/tags/', priority: '0.6', changefreq: 'weekly' },
  { loc: '/imprint/', priority: '0.3', changefreq: 'yearly' }
];

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemap() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const postUrls = [];

  for (const item of manifest) {
    const postPath = path.join(POSTS_DIR, item.path);
    assertSafePath(POSTS_DIR, postPath);
    // Verify file exists
    if (!fs.existsSync(postPath)) {
      console.warn(`Warning: Post file not found: ${postPath}`);
      continue;
    }

    postUrls.push({
      loc: `/post/${item.year}/${item.month}/${item.slug}`,
      priority: '0.7',
      changefreq: 'monthly'
    });
  }

  const now = new Date().toISOString();

  const staticUrlEntries = STATIC_PAGES.map(page => {
    return `  <url>
    <loc>${escapeXml(SITE_URL + page.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  const postUrlEntries = postUrls.map(page => {
    return `  <url>
    <loc>${escapeXml(SITE_URL + page.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlEntries}
${postUrlEntries}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log(`Generated sitemap.xml with ${STATIC_PAGES.length} static pages and ${postUrls.length} posts`);
}

generateSitemap();
