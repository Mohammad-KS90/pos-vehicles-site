// Smart Automotive POS - JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Automotive POS loaded successfully!');
    
    // Initialize all functionality
    initLogoHandling();
    initTabSystem();
    initButtonInteractions();
    initScrollAnimations();
    initHoverEffects();
    initFormHandling();
    
    console.log('All features initialized');
});

// Tab System Functionality
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    console.log('Initializing tab system:', tabButtons.length, 'tabs found');
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Switch to the selected tab
            switchTab(targetTab);
        });
    });
    
    // Initialize first tab as active
    if (tabButtons.length > 0) {
        const firstTab = tabButtons[0].getAttribute('data-tab');
        switchTab(firstTab);
    }
}

// Function to switch between tabs
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Remove active class from all buttons and panes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected button and pane
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePane = document.getElementById(tabName);
    
    if (activeButton && activePane) {
        activeButton.classList.add('active');
        activePane.classList.add('active');
        
        // Update URL hash without scrolling
        history.replaceState(null, null, `#${tabName}`);
        
        console.log('Switched to tab:', tabName);
    }
}

// Function to handle logo loading and fallback
function initLogoHandling() {
    const logo = document.querySelector('.logo');
    
    if (logo) {
        // Check if logo loads successfully
        logo.addEventListener('load', function() {
            console.log('Logo loaded successfully');
        });
        
        // Handle logo loading errors
        logo.addEventListener('error', function() {
            console.warn('Logo failed to load, using fallback');
            createLogoFallback();
        });
        
        // Add click event to logo
        logo.addEventListener('click', function() {
            console.log('Logo clicked - navigating to home');
            // Switch to first tab (About Us)
            switchTab('about');
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Function to create logo fallback if image doesn't load
function createLogoFallback() {
    const logoContainer = document.querySelector('.logo-container');
    const logo = document.querySelector('.logo');
    
    if (logo && logoContainer) {
        // Create fallback div
        const fallback = document.createElement('div');
        fallback.className = 'logo-fallback';
        fallback.textContent = 'Auto POS';
        fallback.title = 'Smart Automotive POS';
        
        // Replace broken image with fallback
        logo.style.display = 'none';
        logoContainer.insertBefore(fallback, logoContainer.firstChild);
        
        // Add click event to fallback
        fallback.addEventListener('click', function() {
            switchTab('about');
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Function to handle button interactions
function initButtonInteractions() {
    const buttons = document.querySelectorAll('.btn');
    console.log('Initializing buttons:', buttons.length);
    
    buttons.forEach(button => {
        // Add click event listener
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Button clicked:', this.textContent.trim());
            
            // Add ripple effect
            createRippleEffect(e);
            
            // Handle button actions
            handleButtonAction(this);
        });
    });
}

// Function to create ripple effect on button click
function createRippleEffect(event) {
    const button = event.currentTarget;
    
    // Create ripple element
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Style the ripple
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Remove existing ripples
    const existingRipples = button.querySelectorAll('.ripple');
    existingRipples.forEach(ripple => {
        ripple.remove();
    });
    
    // Add the new ripple
    button.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
        if (ripple.parentNode === button) {
            ripple.remove();
        }
    }, 600);
}

// Function to handle button actions
function initFormHandling() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted');
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

// Function to handle button actions
function handleButtonAction(button) {
    const buttonText = button.textContent.trim();
    
    switch(buttonText) {
        case 'Get Started':
            handleGetStarted();
            break;
        case 'Contact Us':
            // Switch to contact tab
            switchTab('contact');
            break;
        case 'View Pricing':
            handleViewPricing();
            break;
        case 'Schedule Demo':
            handleScheduleDemo();
            break;
        default:
            console.log('Unknown button:', buttonText);
    }
}

// Function to handle Get Started button
function handleGetStarted() {
    // Show loading state
    const button = document.querySelector('.btn-primary');
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    // Simulate API call or navigation
    setTimeout(() => {
        alert('Welcome to Smart Automotive POS! Redirecting to signup...');
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        console.log('Get Started action completed');
    }, 1000);
}

// Function to handle View Pricing
function handleViewPricing() {
    alert('Pricing information will be displayed here. This feature is coming soon!');
}

// Function to handle Schedule Demo
function handleScheduleDemo() {
    // Switch to contact tab for demo scheduling
    switchTab('contact');
    setTimeout(() => {
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            subjectField.value = 'Schedule Demo - Smart Automotive POS';
            subjectField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}

// Function to initialize scroll animations
function initScrollAnimations() {
    // Add fade-in class to sections
    const sections = document.querySelectorAll('.tab-pane section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
    
    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    console.log('Scroll animations initialized');
}

// Function to initialize hover effects
function initHoverEffects() {
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.app-item, .service-item, .value-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        });
    });
    
    console.log('Hover effects initialized');
}

// Handle URL hash on page load
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        switchTab(hash);
    }
});

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTabSystem,
        switchTab,
        initLogoHandling,
        initButtonInteractions,
        initFormHandling
    };
}