// Vehicle type pages (vehicles/<type>/): the type's icon and description only.
// Theme and language follow what the visitor chose on the main site (saved in localStorage);
// ?lang=<code> in the address wins. Text comes from the same languages/*.json files.
(function () {
    var LANGS = ['ar', 'en', 'fr', 'hi', 'id', 'ja', 'ko', 'th', 'tr', 'vi', 'zh'];

    function readStored(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    }

    var root = document.documentElement;

    // Theme
    var theme = readStored('theme') === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    var logo = document.querySelector('.legal-logo');
    if (logo) logo.src = '/assets/logo-mark-' + theme + '.svg';

    var year = document.querySelector('.copyright-year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Language
    var asked = new URLSearchParams(window.location.search).get('lang');
    var saved = readStored('app_lang');
    var lang = LANGS.indexOf(asked) >= 0 ? asked : (LANGS.indexOf(saved) >= 0 ? saved : 'en');
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'en') return; // the page already holds the English text

    var script = document.querySelector('script[src*="vehicle.js"]');
    var version = script ? new URL(script.src).searchParams.get('v') : null;
    fetch('/languages/' + lang + '.json' + (version ? '?v=' + encodeURIComponent(version) : ''))
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (t) {
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                var value = t[el.getAttribute('data-i18n')];
                if (typeof value === 'string') el.textContent = value;
            });
            var name = document.querySelector('.vehicle-page-title');
            if (name) document.title = 'Carventory - ' + name.textContent;
            var icon = document.querySelector('.vehicle-page-icon');
            if (icon && name) icon.alt = name.textContent;
        })
        .catch(function () { /* keep the English text */ });
})();
