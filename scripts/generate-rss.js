const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'manifest.json');
const RSS_PATH = path.join(__dirname, '..', 'rss.xml');

// Guard against path traversal: ensure resolvedPath is inside basePath
function assertSafePath(basePath, resolvedPath) {
  const relative = path.relative(basePath, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal detected: ${resolvedPath}`);
  }
}

const SITE_URL = 'https://www.markusword.de';
const SITE_TITLE = 'Markus Dröws';
const SITE_DESCRIPTION = 'Cyberanalyst, OSINT Specialist, Software Developer - Blog posts about technology, law enforcement, and innovation.';

function parseFrontmatter(content) {
  const fm = {};
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;

  const lines = match[1].split('\n');
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      fm[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRss() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const posts = [];

  for (const item of manifest) {
    const postPath = path.join(POSTS_DIR, item.path);
    assertSafePath(POSTS_DIR, postPath);
    const content = fs.readFileSync(postPath, 'utf8');
    const fm = parseFrontmatter(content);

    posts.push({
      title: fm.headline || 'Untitled',
      date: fm.date || item.slug,
      datetime: fm.datetime || `${item.slug}T00:00:00Z`,
      link: `${SITE_URL}/post/${item.year}/${item.month}/${item.slug}`,
      description: fm.teaser || ''
    });
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const now = new Date().toUTCString();
  const items = posts.map(post => {
    const link = escapeXml(post.link);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.description.replace(/]]>/g, ']]]]><![CDATA[>')}]]></description>
      <pubDate>${new Date(post.datetime).toUTCString()}</pubDate>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  fs.writeFileSync(RSS_PATH, rss);
  console.log(`Generated rss.xml with ${posts.length} posts`);
}

generateRss();
