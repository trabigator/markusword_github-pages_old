// Escape HTML special characters to prevent XSS in innerHTML contexts
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PostLoader = {
  getPathInfo() {
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    
    const isRoot = pathParts.length === 0;
    const isPostsPage = pathParts.includes('posts') && (lastPart === 'index.html' || lastPart === 'posts' || lastPart === '');
    const isSearchPage = pathParts.includes('search') && (lastPart === 'index.html' || lastPart === 'search' || lastPart === '');
    const isAboutPage = pathParts.includes('about') && (lastPart === 'index.html' || lastPart === 'about' || lastPart === '');
    const isTagsPage = pathParts.includes('tags') && (lastPart === 'index.html' || lastPart === 'tags' || lastPart === '');
    
    return { isRoot, isPostsPage, isSearchPage, isAboutPage, isTagsPage, pathParts };
  },

  async fetchPosts() {
    try {
      const { isRoot, isPostsPage, isSearchPage, isAboutPage, isTagsPage } = this.getPathInfo();
      const isSubDir = isSearchPage || isAboutPage || isTagsPage;
      
      let manifestPath;
      if (isPostsPage) {
        manifestPath = 'manifest.json';
      } else if (isSubDir) {
        manifestPath = '../posts/manifest.json';
      } else {
        manifestPath = 'posts/manifest.json';
      }
      
      const response = await fetch(manifestPath);
      if (!response.ok) {
        console.error('Failed to load manifest.json');
        return [];
      }
      const manifest = await response.json();
      const posts = [];

      for (const item of manifest) {
        const post = await this.fetchPost(item.path);
        if (post) {
          post.year = item.year;
          post.month = item.month;
          post.slug = item.slug;
          posts.push(post);
        }
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    } catch (e) {
      console.error('Failed to fetch posts:', e);
      return [];
    }
  },

  async fetchPost(path, slugFromManifest) {
    try {
      const { isRoot, isPostsPage, isSearchPage, isAboutPage, isTagsPage } = this.getPathInfo();
      const isSubDir = isSearchPage || isAboutPage || isTagsPage;
      
      let fullPath;
      if (isPostsPage) {
        fullPath = path;
      } else if (isSubDir) {
        fullPath = `../posts/${path}`;
      } else {
        fullPath = `posts/${path}`;
      }
      
      const response = await fetch(fullPath);
      if (!response.ok) return null;

      const content = await response.text();
      return this.parsePost(content, path, slugFromManifest);
    } catch (e) {
      console.error(`Failed to load post: ${path}`, e);
      return null;
    }
  },

  parsePost(content, path, slugFromManifest) {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const frontmatter = this.parseFrontmatter(fmMatch[1]);
    const markdown = fmMatch[2];
    const slug = slugFromManifest || path.split('/').pop().replace('.md', '');

    // Render markdown then sanitize with DOMPurify to prevent XSS
    const rawHtml = marked.parse(markdown);
    const safeHtml = (typeof DOMPurify !== 'undefined')
      ? DOMPurify.sanitize(rawHtml)
      : rawHtml;

    return {
      slug,
      headline: frontmatter.headline || 'Untitled',
      date: frontmatter.date || '',
      datetime: frontmatter.datetime || '',
      readTime: frontmatter.readTime || '5 min read',
      teaser: frontmatter.teaser || '',
      tags: frontmatter.tags || [],
      content: safeHtml,
      path
    };
  },

  parseFrontmatter(text) {
    const fm = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].replace(/^["']|["']$/g, '');
        
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        }
        
        fm[key] = value;
      }
    }
    return fm;
  },

  getPostUrl(post, isSubDir) {
    const base = isSubDir ? '..' : '.';
    return `${base}/post/${post.year}/${post.month}/${post.slug}`;
  },

  getBaseUrl() {
    const pathname = window.location.pathname;
    const basePath = pathname.replace(/\/[^/]*$/, '');
    return window.location.origin + (basePath || '');
  },

  async getAdjacentPosts(year, slug) {
    const posts = await this.fetchPosts();
    const currentIndex = posts.findIndex(p => p.year === year && p.slug === slug);
    
    const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
    const next = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
    
    return { prev, next };
  },

  renderPostList(posts, container) {
    if (!posts.length) {
      container.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    const { isRoot, isPostsPage, isSearchPage, isAboutPage, isTagsPage } = this.getPathInfo();
    const isSubDir = isPostsPage || isSearchPage || isAboutPage || isTagsPage;

    container.innerHTML = posts.map(post => `
      <li>
        <div class="post-item">
          <a href="${escapeHtml(this.getPostUrl(post, isSubDir))}" class="post-link">
            <h3>${escapeHtml(post.headline)}</h3>
          </a>
          <div class="post-meta">
            <span class="date">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="7" width="16" height="14" rx="2"></rect>
                <path d="M16 3v4"></path>
                <path d="M8 3v4"></path>
                <path d="M4 11h16"></path>
              </svg>
              <time datetime="${escapeHtml(post.datetime)}">${this.formatDate(post.date)}</time>
            </span>
            <span class="read-time">- ${escapeHtml(post.readTime)}</span>
          </div>
          <p>${escapeHtml(post.teaser)}</p>
        </div>
      </li>
    `).join('');
  },

  renderGroupedPosts(posts, container) {
    if (!posts.length) {
      container.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    const { isRoot, isPostsPage, isSearchPage, isAboutPage, isTagsPage } = this.getPathInfo();
    const isSubDir = isPostsPage || isSearchPage || isAboutPage || isTagsPage;

    const grouped = this.groupPostsByYearMonth(posts);
    const sortedYears = Object.entries(grouped).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    
    let html = '';
    for (const [year, months] of sortedYears) {
      const yearCount = months.reduce((sum, m) => sum + m.posts.length, 0);
      html += `<div class="year-group">
        <h2 class="year-header">${escapeHtml(year)} <span class="year-count">${escapeHtml(String(yearCount))}</span></h2>`;
      
      for (const monthData of months) {
        html += `<div class="month-group">
          <h3 class="month-header">${escapeHtml(monthData.monthName)} <span class="month-count">${escapeHtml(String(monthData.posts.length))}</span></h3>
          <ul class="month-posts">`;
        
        for (const post of monthData.posts) {
          html += `<li>
            <a href="${escapeHtml(this.getPostUrl(post, isSubDir))}" class="post-link">
              <h3>${escapeHtml(post.headline)}</h3>
            </a>
            <div class="post-meta">
              <span class="date">${this.formatDate(post.date)}</span>
              <span class="read-time">- ${escapeHtml(post.readTime)}</span>
            </div>
            ${post.teaser ? `<p>${escapeHtml(post.teaser)}</p>` : ''}
          </li>`;
        }
        
        html += `</ul>
        </div>`;
      }
      
      html += `</div>`;
    }

    container.innerHTML = html;
  },

  groupPostsByYearMonth(posts) {
    const groups = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    for (const post of posts) {
      const date = new Date(post.date);
      const year = date.getFullYear().toString();
      const monthIndex = date.getMonth();
      
      if (!groups[year]) {
        groups[year] = [];
      }
      
      let monthGroup = groups[year].find(m => m.monthIndex === monthIndex);
      if (!monthGroup) {
        monthGroup = { monthIndex, monthName: monthNames[monthIndex], posts: [] };
        groups[year].push(monthGroup);
      }
      
      monthGroup.posts.push(post);
    }

    for (const year of Object.keys(groups)) {
      groups[year].sort((a, b) => b.monthIndex - a.monthIndex);
    }

    return groups;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  },

  async loadPostPage() {
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);
    
    let year, month, slug;
    
    const postIndex = pathParts.indexOf('post');
    if (postIndex !== -1 && pathParts.length >= postIndex + 3) {
      year = pathParts[postIndex + 1];
      month = pathParts[postIndex + 2];
      slug = pathParts[postIndex + 3];
    }
    
    if (!year || !slug) {
      const params = new URLSearchParams(window.location.search);
      year = params.get('year');
      slug = params.get('slug');
    }
    
    if (!year || !slug) return null;

    const { isPostsPage, isSearchPage, isAboutPage, isTagsPage } = this.getPathInfo();
    const isSubDir = isSearchPage || isAboutPage || isTagsPage;
    
    let manifestPath;
    if (isPostsPage) {
      manifestPath = 'manifest.json';
    } else if (isSubDir) {
      manifestPath = '../posts/manifest.json';
    } else {
      manifestPath = 'posts/manifest.json';
    }

    const response = await fetch(manifestPath);
    if (!response.ok) return null;
    
    const manifest = await response.json();
    const item = manifest.find(m => m.year === year && m.slug === slug);
    
    if (!item) return null;

    const post = await this.fetchPost(item.path, item.slug);
    if (!post) return null;

    const adjacent = await this.getAdjacentPosts(year, slug);
    post.prevPost = adjacent.prev;
    post.nextPost = adjacent.next;

    document.title = post.headline;
    return post;
  }
};

if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
}
