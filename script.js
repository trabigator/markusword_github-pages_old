function initMenu() {
    const menuBtn = document.querySelector('#menu-btn');
    const menuItems = document.querySelector('#menu-items');
    const menuIcon = document.querySelector('#menu-icon');
    const closeIcon = document.querySelector('#close-icon');

    if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;

    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        menuBtn.setAttribute('aria-label', isExpanded ? 'Open Menu' : 'Close Menu');
        menuItems.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });
}

function initTheme() {
    const themeBtn = document.querySelector('#theme-btn');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.setAttribute('data-theme', 'dark');
    }

    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        if (newTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', newTheme);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initTheme();
});
