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

// ------------------ TAB SYSTEM ------------------
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Activate first tab if none selected
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

// ------------------ LOGO HANDLING ------------------
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
    fallback.title = 'Smart Automotive POS';
    container.insertBefore(fallback, container.firstChild);

    fallback.addEventListener('click', () => {
        switchTab('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ------------------ BUTTONS ------------------
function initButtonInteractions() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
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
    const x = event.clientX - rect.left - size/2;
    const y = event.clientY - rect.top - size/2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.querySelectorAll('.ripple').forEach(r => r.remove());
    button.appendChild(ripple);

    setTimeout(() => { ripple.remove(); }, 600);
}

function handleButtonAction(button) {
    const text = button.textContent.trim();
    switch(text) {
        case 'Get Started': alert('Get Started clicked'); break;
        case 'Contact Us': switchTab('contact'); break;
        default: console.log('Button clicked:', text);
    }
}

// ------------------ FORM HANDLING ------------------
function initFormHandling() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Message sent! We will contact you soon.');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// ------------------ SCROLL ANIMATIONS ------------------
function initScrollAnimations() {
    const sections = document.querySelectorAll('.tab-pane section');
    sections.forEach(section => section.classList.add('fade-in'));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => observer.observe(section));
}

// ------------------ HOVER EFFECTS ------------------
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

// ------------------ LANGUAGE SWITCHER ------------------
function initLanguageSwitcher() {
    const langSelect = document.getElementById("language-switcher");
    if (!langSelect) return;

    const savedLang = localStorage.getItem("app_lang") || "en";
    langSelect.value = savedLang;
    loadLanguage(savedLang);

    langSelect.addEventListener("change", () => {
        const selectedLang = langSelect.value;
        loadLanguage(selectedLang);
        localStorage.setItem("app_lang", selectedLang);
    });
}

async function loadLanguage(lang) {
    try {
        const res = await fetch(`./languages/${lang}.json`);
        if (!res.ok) throw new Error("Language file not found");
        const translations = await res.json();
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[key]) el.textContent = translations[key];
        });
    } catch(err) {
        console.error("Language load error:", err);
    }
}
