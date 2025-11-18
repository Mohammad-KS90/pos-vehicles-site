// Smart Automotive POS - JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
  console.log('Smart Automotive POS loaded successfully!');
  
  // Initialize all functionality
  initButtonInteractions();
  initScrollAnimations();
  initHoverEffects();
  
  console.log('All features initialized');
});

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
      
      // Add hover sound effect (optional)
      button.addEventListener('mouseenter', function() {
          console.log('Button hover:', this.textContent.trim());
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
function handleButtonAction(button) {
  const buttonText = button.textContent.trim();
  
  switch(buttonText) {
      case 'Get Started':
          handleGetStarted();
          break;
      case 'Contact Us':
          handleContactUs();
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
      
      // In a real application, you would redirect:
      // window.location.href = '/signup';
      
      console.log('Get Started action completed');
  }, 1000);
}

// Function to handle Contact Us button
function handleContactUs() {
  // Create and show contact modal
  showContactModal();
}

// Function to show contact modal
function showContactModal() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      text-align: center;
  `;
  
  modal.innerHTML = `
      <h3 style="margin-bottom: 15px; color: #1a1a1a;">Contact Us</h3>
      <p style="margin-bottom: 20px; color: #4a5568;">Get in touch with our team for more information.</p>
      <div style="text-align: left; margin-bottom: 25px;">
          <p><strong>Email:</strong> info@smartautopos.com</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Address:</strong> 123 Automotive Way, Suite 100</p>
      </div>
      <button id="closeModal" class="btn btn-primary" style="margin-top: 10px;">Close</button>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Add close functionality
  const closeModal = () => {
      document.body.removeChild(overlay);
  };
  
  document.getElementById('closeModal').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
          closeModal();
      }
  });
  
  // Add escape key listener
  const escapeHandler = (e) => {
      if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
      }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Function to initialize scroll animations
function initScrollAnimations() {
  // Add fade-in class to sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
      section.classList.add('fade-in');
  });
  
  // Create intersection observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              console.log('Section entered viewport:', entry.target.querySelector('h2, h3')?.textContent);
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
  // Add hover effects to app items
  const appItems = document.querySelectorAll('.app-item');
  appItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-5px)';
          this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      });
      
      item.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      });
  });
  
  console.log('Hover effects initialized');
}

// Utility function for future form handling
function handleFormSubmission(formId) {
  const form = document.getElementById(formId);
  if (form) {
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          console.log('Form submitted:', formId);
          
          // Add form validation and submission logic here
          alert('Form submitted successfully!');
      });
  }
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
      initButtonInteractions,
      initScrollAnimations,
      handleGetStarted,
      handleContactUs
  };
}