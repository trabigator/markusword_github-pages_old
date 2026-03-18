const SiteComponents = {

    getActivePage() {
        const path = window.location.pathname;
        if (path.includes('/posts/') || path.endsWith('/posts')) return 'posts';
        if (path.includes('/about/') || path.endsWith('/about')) return 'about';
        if (path.includes('/search/') || path.endsWith('/search')) return 'search';
        if (path.includes('/tags/') || path.endsWith('/tags')) return 'tags';
        if (path.includes('/imprint/') || path.endsWith('/imprint')) return 'imprint';
        if (path.includes('/post/') || path.match(/\/post\.html/)) return 'post';
        return 'home';
    },

    buildHeader() {
        const active = this.getActivePage();
        const postsClass = active === 'posts' ? ' class="active"' : '';
        const aboutClass = active === 'about' ? ' class="active"' : '';
        const searchClass = active === 'search' ? ' class="icon-btn active"' : ' class="icon-btn"';

        return `
        <a id="skip-to-content" href="#main-content">Skip to content</a>
        <div id="nav-container">
            <div id="top-nav-wrap">
                <a href="/" class="site-title">Markus Dröws</a>
                <nav id="nav-menu">
                    <button id="menu-btn" aria-label="Open Menu" aria-expanded="false" aria-controls="menu-items">
                        <svg class="icon" id="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 6h16"></path>
                            <path d="M7 12h13"></path>
                            <path d="M10 18h10"></path>
                        </svg>
                        <svg class="icon hidden" id="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                        </svg>
                    </button>
                    <ul id="menu-items" class="hidden">
                        <li><a href="/posts/"${postsClass}>Posts</a></li>
                        <li><a href="/about/"${aboutClass}>About</a></li>
                        <li>
                            <a href="/search/"${searchClass} aria-label="search" title="Search">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="7"></circle>
                                    <path d="M16.65 16.65L21 21"></path>
                                </svg>
                            </a>
                        </li>
                        <li>
                            <button id="theme-btn" class="icon-btn" title="Toggles light &amp; dark" aria-label="auto" aria-live="polite">
                                <svg class="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 3a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                                </svg>
                                <svg class="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <path d="M12 1v2"></path>
                                    <path d="M12 21v2"></path>
                                    <path d="M4.22 4.22l1.42 1.42"></path>
                                    <path d="M18.36 18.36l1.42 1.42"></path>
                                    <path d="M1 12h2"></path>
                                    <path d="M21 12h2"></path>
                                    <path d="M4.22 19.78l1.42-1.42"></path>
                                    <path d="M18.36 5.64l1.42-1.42"></path>
                                </svg>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
        <div class="divider"></div>`;
    },

    buildFooter() {
        return `
        <div class="divider"></div>
        <div class="footer-content">
            <div class="social-links">
                <a href="https://github.com/trabigator" class="social-link" title="GitHub">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 19c-4 1.5-4-2-6-3"/>
                        <path d="M15 21v-3.5c0-1 .1-1.5-.5-2 3-.35 5.5-1.5 5.5-6 0-1.2-.4-2.3-1.2-3.2.1-.3.5-1.6-.1-3.3 0 0-1.1-.3-3.5 1.3a11.8 11.8 0 0 0-6.4 0 C6.4 2.4 5.3 2.7 5.3 2.7c-.6 1.7-.2 3 .1 3.3 A4.6 4.6 0 0 0 4 9.5c0 4.5 2.5 5.6 5.5 6 -.6.5-.6 1.2-.5 2V21"/>
                    </svg>
                </a>
                <a href="https://www.linkedin.com/in/markus-d140821" class="social-link" title="LinkedIn">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="4"/>
                        <path d="M8 11v5"/>
                        <path d="M8 8v.01"/>
                        <path d="M12 16v-5"/>
                        <path d="M16 16v-3a2 2 0 0 0-4 0"/>
                    </svg>
                </a>
                <a href="mailto:markusword.de@proton.me" class="social-link" title="Email">
                    <svg width="28" height="18" viewBox="0 0 30 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="24" height="18" rx="2"></rect>
                        <path d="M3 8l12 8 12-8"></path>
                    </svg>
                </a>
            </div>
            <div class="footer-credit">
                <a href="/imprint/">Imprint</a>
            </div>
        </div>`;
    },

    init() {
        const header = document.querySelector('header');
        if (header) {
            header.innerHTML = this.buildHeader();
        }
        const footer = document.querySelector('footer');
        if (footer) {
            footer.innerHTML = this.buildFooter();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => SiteComponents.init());
