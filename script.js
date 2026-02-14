document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Automotive POS loaded successfully!');

    initLogoHandling();
    initTabSystem();
    initButtonInteractions();
    initScrollAnimations();
    initHoverEffects();
    initFormHandling();
    initLanguageSwitcher();

    console.log('All features initialized');
});

/* ================= EMAILJS CONFIG ================= */
const EMAILJS_PUBLIC_KEY = "wWfS--QZbMkYohVEp";
const EMAILJS_SERVICE_ID = "service_b24pfpp";
const EMAILJS_TEMPLATE_ID = "template_p0tj4ls";
const recaptcha_key = "6LcNOmssAAAAABUy0Xzt9B5LGY8xFxnw1aJ-PfeY";

/* ================= TAB SYSTEM ================= */
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    const firstTab = tabButtons[0]?.getAttribute('data-tab');
    if (firstTab) switchTab(firstTab);
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

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) switchTab(hash);
});

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
            handleButtonAction(button);
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

function handleButtonAction(button) {
    const text = button.textContent.trim();
    if (text === 'Contact Us') switchTab('contact');
}

/* ================= FORM (REAL EMAIL SEND) ================= */
function initFormHandling() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    emailjs.init(EMAILJS_PUBLIC_KEY);

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
    
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

    const savedLang = localStorage.getItem("app_lang") || "en";
    languageSwitcher.value = savedLang;
    loadLanguage(savedLang);
    applyDirection(savedLang);

    languageSwitcher.addEventListener("change", () => {
        const lang = languageSwitcher.value;
        localStorage.setItem("app_lang", lang);
        loadLanguage(lang);
        applyDirection(lang);
    });
}

async function loadLanguage(lang) {
    try {
        const res = await fetch(`./languages/${lang}.json`);
        const translations = await res.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[key]) el.textContent = translations[key];
        });
    } catch (e) {
        console.error("Language load error", e);
    }
}

function applyDirection(lang) {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

function executeRecaptcha() {
    return grecaptcha.execute(recaptcha_key, { action: 'submit' });
}
