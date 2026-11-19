// Cache-busting version, taken from this script's own ?v= in index.html,
// so language files are refetched whenever the site version is bumped.
const ASSET_VERSION = (() => {
    try { return new URL(document.currentScript.src).searchParams.get("v") || ""; }
    catch { return ""; }
})();

document.addEventListener('DOMContentLoaded', function() {
    initLogoHandling();
    initTabSystem();
    initButtonInteractions();
    initScrollAnimations();
    initHoverEffects();
    initFormHandling();
    initLanguageSwitcher();
    initThemeToggle();
    initPricing();
});

/* ================= EMAILJS CONFIG ================= */
const EMAILJS_PUBLIC_KEY = "wWfS--QZbMkYohVEp";
const EMAILJS_SERVICE_ID = "service_b24pfpp";
const EMAILJS_TEMPLATE_ID = "template_p0tj4ls";
const recaptcha_key = "6LcNOmssAAAAABUy0Xzt9B5LGY8xFxnw1aJ-PfeY";

const SUPPORTED_LANGS = ["ar", "tr", "en", "fr", "zh", "ja", "ko", "id", "th", "vi", "hi"];

/* ================= RECAPTCHA ================= */
function executeRecaptcha() {
    return grecaptcha.execute(recaptcha_key, { action: 'submit' });
}

/* ================= TAB SYSTEM ================= */
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Open the tab named in the address (e.g. /#pricing), otherwise the first one
    const hashTab = window.location.hash.substring(1);
    const firstTab = tabButtons[0]?.getAttribute('data-tab');
    const startTab = hashTab && document.querySelector(`.tab-btn[data-tab="${CSS.escape(hashTab)}"]`) ? hashTab : firstTab;
    if (startTab) switchTab(startTab);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePane = document.getElementById(tabName);

    if (activeButton && activePane) {
        activeButton.classList.add('active');
        activePane.classList.add('active');
        history.replaceState(null, null, `#${tabName}`);
    }
}

/* ================= LOGO ================= */
function initLogoHandling() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    logo.addEventListener('error', createLogoFallback);
    logo.addEventListener('click', () => {
        switchTab('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function createLogoFallback() {
    const logo = document.querySelector('.logo');
    const container = document.querySelector('.logo-container');
    if (!logo || !container) return;

    logo.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'logo-fallback';
    fallback.textContent = 'Auto POS';
    container.insertBefore(fallback, container.firstChild);

    fallback.addEventListener('click', () => {
        switchTab('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ================= BUTTONS ================= */
function initButtonInteractions() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', e => {
            createRippleEffect(e);
            handleButtonAction(button, e);
        });
    });
}

function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    let x = event.clientX - rect.left - size / 2;
    let y = event.clientY - rect.top - size / 2;

    if (document.documentElement.getAttribute('dir') === 'rtl') {
        x = rect.width - x - size;
    }

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.querySelectorAll('.ripple').forEach(r => r.remove());
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Buttons declare where they go with data-action="<tab id>", so this works in every language
function handleButtonAction(button, event) {
    const target = button.dataset.action;
    if (!target || !document.getElementById(target)) return;
    event?.preventDefault();
    switchTab(target);
    document.querySelector('.tabs-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================= FORM (REAL EMAIL SEND) ================= */
function initFormHandling() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
        blockHeadless: true,
        limitRate: { id: 'contact-form', throttle: 30000 }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Bots fill the hidden honeypot field; pretend success and drop it
        if (form.querySelector('#website')?.value) {
            form.reset();
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
    
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    
        try {
            const token = await executeRecaptcha();
            document.getElementById('g-recaptcha-response').value = token;
    
            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                form
            );
    
            alert('Message sent successfully!');
            form.reset();
        } catch (err) {
            console.error('Send failed:', err);
            alert('Submission blocked or failed.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ================= SCROLL ================= */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.tab-pane section');
    sections.forEach(section => section.classList.add('fade-in'));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
}

/* ================= HOVER ================= */
function initHoverEffects() {
    const items = document.querySelectorAll('.app-item, .service-item, .value-card');
    items.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-5px)';
            el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        });
    });
}

/* ================= LANGUAGE ================= */
function initLanguageSwitcher() {
    const languageSwitcher = document.getElementById("language-switcher");
    if (!languageSwitcher) return;

    const storedLang = localStorage.getItem("app_lang");
    const savedLang = SUPPORTED_LANGS.includes(storedLang) ? storedLang : "en";
    languageSwitcher.value = savedLang;
    loadLanguage(savedLang);
    applyDirection(savedLang);

    languageSwitcher.addEventListener("change", () => {
        const lang = languageSwitcher.value;
        if (!SUPPORTED_LANGS.includes(lang)) return;
        localStorage.setItem("app_lang", lang);
        loadLanguage(lang);
        applyDirection(lang);
    });
}

// The translations currently on screen, used by parts of the page rendered from JS (pricing)
let currentTranslations = {};
let currentLang = "en";

function t(key, fallback = "") {
    const value = currentTranslations[key];
    return typeof value === "string" ? value : fallback;
}

async function loadLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
    try {
        const res = await fetch(`./languages/${lang}.json${ASSET_VERSION ? `?v=${ASSET_VERSION}` : ""}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const translations = await res.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (typeof translations[key] === "string") el.textContent = translations[key];
        });
        document.querySelectorAll("[data-i18n-aria]").forEach(el => {
            const key = el.getAttribute("data-i18n-aria");
            if (typeof translations[key] === "string") el.setAttribute("aria-label", translations[key]);
        });

        currentTranslations = translations;
        currentLang = lang;
        document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
    } catch (e) {
        console.error("Language load error", e);
    }
}

function applyDirection(lang) {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
}

// ================== DARK MODE TOGGLE ================== 
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    const toggle = document.querySelector('.theme-toggle');
    
    if (!toggle) {
        // Create the toggle button if it doesn't exist
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.className = `theme-toggle ${savedTheme}`;
        themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        document.body.appendChild(themeToggleBtn);
        
        themeToggleBtn.addEventListener('click', () => toggleTheme(themeToggleBtn));
    }
    
    applyTheme(savedTheme);
}

function toggleTheme(btn) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    btn.className = `theme-toggle ${newTheme}`;
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // The Carventory mark has a light and a dark variant
    const logo = document.querySelector('.logo');
    if (logo) logo.src = `./assets/logo-mark-${theme === 'dark' ? 'dark' : 'light'}.svg`;
}

/* ================= PRICING ================= */
// Plans and prices come from pricing.json; labels and feature lists from the language files.
const PRICING_TIERS = ["basic", "pro", "enterprise"];
const PRICING_FEATURED_TIER = "pro";

function readStored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode etc. */ }
}

async function initPricing() {
    const section = document.getElementById("pricing");
    const grid = section?.querySelector(".plan-grid");
    if (!grid) return;

    let pricing;
    try {
        const res = await fetch(`./pricing.json${ASSET_VERSION ? `?v=${ASSET_VERSION}` : ""}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        pricing = await res.json();
    } catch (e) {
        console.error("Pricing load error", e);
        return;
    }

    const roles = Object.keys(pricing.b2b);
    const storedCurrency = readStored("pricing_currency");
    const state = {
        segment: "b2b",
        role: roles[0],
        // Explicit choice wins; otherwise Arabic visitors see JOD, everyone else USD
        currency: pricing.currencies.includes(storedCurrency) ? storedCurrency : null,
    };

    const groups = {};
    section.querySelectorAll("[data-pricing]").forEach(group => {
        const name = group.dataset.pricing;
        groups[name] = group;
        group.addEventListener("click", e => {
            const chip = e.target.closest(".chip");
            if (!chip || !group.contains(chip)) return;
            state[name] = chip.dataset.value;
            if (name === "currency") writeStored("pricing_currency", state.currency);
            render();
        });
    });

    function currencyFor() {
        return state.currency || (currentLang === "ar" ? "JOD" : "USD");
    }

    function syncChips() {
        const values = { segment: state.segment, role: state.role, currency: currencyFor() };
        Object.entries(groups).forEach(([name, group]) => {
            group.querySelectorAll(".chip").forEach(chip => {
                const on = chip.dataset.value === values[name];
                chip.classList.toggle("active", on);
                chip.setAttribute("aria-checked", String(on));
            });
        });
        section.classList.toggle("is-b2c", state.segment === "b2c");
    }

    function formatPrice(amount, currency) {
        if (amount === null || amount === undefined) return "—";
        try {
            return new Intl.NumberFormat(currentLang, {
                style: "currency", currency, currencyDisplay: "code",
                // Whole prices without decimals ("JOD 25"); fractions keep up to 3 (JOD uses fils)
                minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
                maximumFractionDigits: Number.isInteger(amount) ? 0 : 3,
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    }

    function features(role, tier) {
        const all = currentTranslations.pricing_features || {};
        const list = tier ? all[role]?.[tier] : all[role];
        return Array.isArray(list) ? list : [];
    }

    function card({ role, tier, title, planLabel, priceText, perMonth, featured, badge }) {
        const el = document.createElement("article");
        el.className = "plan-card" + (featured ? " plan-card--featured" : "");

        if (badge) {
            const tag = document.createElement("span");
            tag.className = "plan-badge";
            tag.textContent = badge;
            el.appendChild(tag);
        }

        const name = document.createElement("h3");
        name.className = "plan-name";
        name.textContent = title;
        el.appendChild(name);

        const price = document.createElement("p");
        price.className = "plan-price";
        const amount = document.createElement("span");
        amount.className = "plan-amount";
        amount.textContent = priceText;
        price.appendChild(amount);
        if (perMonth) {
            const per = document.createElement("span");
            per.className = "plan-period";
            per.textContent = " " + t("pricing_per_month", "/ month");
            price.appendChild(per);
        }
        el.appendChild(price);

        const list = document.createElement("ul");
        list.className = "plan-features";
        features(role, tier).forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            list.appendChild(li);
        });
        el.appendChild(list);

        const cta = document.createElement("button");
        cta.type = "button";
        cta.className = "btn " + (featured ? "btn-primary" : "btn-outline");
        cta.textContent = t("pricing_cta", "Get started");
        cta.addEventListener("click", () => startContact(role, planLabel));
        el.appendChild(cta);

        return el;
    }

    // Open the contact form with the chosen plan in the subject
    function startContact(role, planLabel) {
        const subject = t("pricing_subject", "Pricing: {role} – {plan}")
            .replace("{role}", t(`pricing_role_${role}`, role))
            .replace("{plan}", planLabel);
        const input = document.getElementById("subject");
        if (input) input.value = subject.slice(0, Number(input.maxLength) > 0 ? input.maxLength : 150);
        switchTab("contact");
        document.querySelector(".tabs-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("name")?.focus({ preventScroll: true });
    }

    function render() {
        syncChips();
        grid.replaceChildren();
        if (state.segment === "b2c") {
            grid.classList.add("plan-grid--single");
            grid.appendChild(card({
                role: "owner",
                tier: null,
                title: t("pricing_role_owner", "Vehicle owner"),
                planLabel: t("pricing_plan_free", "Free"),
                priceText: t("pricing_plan_free", "Free"),
                perMonth: false,
                featured: true,
                badge: null,
            }));
            return;
        }
        grid.classList.remove("plan-grid--single");
        const currency = currencyFor();
        PRICING_TIERS.forEach(tier => {
            grid.appendChild(card({
                role: state.role,
                tier,
                title: t(`pricing_plan_${tier}`, tier),
                planLabel: t(`pricing_plan_${tier}`, tier),
                priceText: formatPrice(pricing.b2b[state.role]?.[tier]?.[currency], currency),
                perMonth: true,
                featured: tier === PRICING_FEATURED_TIER,
                badge: tier === PRICING_FEATURED_TIER ? t("pricing_popular", "Most popular") : null,
            }));
        });
    }

    document.addEventListener("languagechange", render);
    render();
}
