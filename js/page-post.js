document.addEventListener('DOMContentLoaded', async () => {
    const post = await PostLoader.loadPostPage();
    if (post) {
        document.getElementById('post-headline').textContent = post.headline;
        document.getElementById('post-date').textContent = PostLoader.formatDate(post.date);
        document.getElementById('post-read-time').textContent = '- ' + post.readTime;
        document.getElementById('post-body').innerHTML = post.content;

        // Update SEO meta tags
        const baseUrl = PostLoader.getBaseUrl();
        const postUrl = `${baseUrl}/post/${post.year}/${post.month}/${post.slug}`;

        document.getElementById('seo-title').textContent = post.headline;
        document.getElementById('seo-description').content = post.teaser || '';
        document.getElementById('og-title').content = post.headline;
        document.getElementById('og-description').content = post.teaser || '';
        document.getElementById('og-url').content = postUrl;
        document.getElementById('twitter-title').content = post.headline;
        document.getElementById('twitter-description').content = post.teaser || '';
        document.getElementById('canonical-url').href = postUrl;

        // Inject JSON-LD Article schema
        const jsonld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.headline,
            "datePublished": post.datetime,
            "author": {
                "@type": "Person",
                "name": "Markus Dröws",
                "url": "https://www.markusword.de/about/"
            },
            "publisher": {
                "@type": "Person",
                "name": "Markus Dröws"
            },
            "description": post.teaser || ''
        };
        document.getElementById('jsonld').textContent = JSON.stringify(jsonld);

        if (post.tags && post.tags.length > 0) {
            const tagsContainer = document.getElementById('post-tags');
            tagsContainer.innerHTML = post.tags.map(tag =>
                `<a href="../tags/${encodeURIComponent(tag)}" class="tag">#${escapeHtml(tag)}</a>`
            ).join('');
        }

        setupShareButtons(post);
        setupPostNavigation(post);
    } else {
        document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
    }
});

function setupShareButtons(post) {
    const baseUrl = PostLoader.getBaseUrl();
    const postUrl = `${baseUrl}/post/${post.year}/${post.month}/${post.slug}`;
    const shareText = `${post.headline}`;

    const platformUrls = {
        x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`,
        bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + '\n' + postUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + postUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&description=${encodeURIComponent(shareText)}`,
        email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(postUrl)}`
    };

    document.querySelectorAll('.share-btn').forEach(btn => {
        const platform = btn.dataset.platform;
        if (platformUrls[platform]) {
            btn.href = platformUrls[platform];
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
        }
    });
}

function wrapText(text, maxLen) {
    const words = text.split(' ');
    let line = '';
    let result = '';
    for (const word of words) {
        if (line.length + word.length + 1 > maxLen && line.length > 0) {
            result += line + '<wbr>';
            line = word;
        } else {
            line += (line ? ' ' : '') + word;
        }
    }
    return result + line;
}

function setupPostNavigation(post) {
    const navContainer = document.querySelector('.post-nav-links');
    let navHtml = '';

    if (post.nextPost) {
        const nextTitle = wrapText(escapeHtml(post.nextPost.headline), 30);
        const nextTeaser = escapeHtml(post.nextPost.teaser || '');
        const nextHeadline = escapeHtml(post.nextPost.headline);
        navHtml += `<a href="/post/${escapeHtml(post.nextPost.year)}/${escapeHtml(post.nextPost.month)}/${escapeHtml(post.nextPost.slug)}" class="post-nav-link" title="${nextHeadline}" aria-label="${nextTeaser}">
            <div>
            <span class="post-nav-label">Next Post</span>
            <span class="post-nav-title">${nextTitle}</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </a>`;
    }

    if (navHtml) {
        navContainer.innerHTML = navHtml;
    }
}
