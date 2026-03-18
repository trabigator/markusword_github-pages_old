const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'manifest.json');

// Guard against path traversal: ensure resolvedPath is inside basePath
function assertSafePath(basePath, resolvedPath) {
  const relative = path.relative(basePath, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal detected: ${resolvedPath}`);
  }
}

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

function generateSlug(headline, filename) {
  if (headline) {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  return filename.replace('.md', '');
}

function getMonthFromDate(dateStr) {
  if (!dateStr) return '01';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? match[2] : '01';
}

function makeSlugsUnique(posts) {
  const slugCount = {};
  for (const post of posts) {
    if (slugCount[post.slug]) {
      slugCount[post.slug]++;
      post.slug = `${post.slug}-${slugCount[post.slug]}`;
    } else {
      slugCount[post.slug] = 1;
    }
  }
  return posts;
}

function generateManifest() {
  const years = fs.readdirSync(POSTS_DIR).filter(item => {
    return fs.statSync(path.join(POSTS_DIR, item)).isDirectory();
  });

  const posts = [];

  for (const year of years) {
    const yearDir = path.join(POSTS_DIR, year);
    assertSafePath(POSTS_DIR, yearDir);
    const files = fs.readdirSync(yearDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(yearDir, file);
      assertSafePath(POSTS_DIR, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      
      const slug = fm.slug || generateSlug(fm.headline, file);
      const month = getMonthFromDate(fm.date);
      
      posts.push({
        slug,
        year,
        month,
        path: `${year}/${file}`
      });
    }
  }

  makeSlugsUnique(posts);
  posts.sort((a, b) => b.slug.localeCompare(a.slug));

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(posts, null, 2) + '\n');
  console.log(`Generated manifest.json with ${posts.length} posts`);
}

generateManifest();
