// Zoo Legends Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles
    initParticles();
    
    // Header scroll effect
    initHeaderScroll();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize animations
    initScrollAnimations();
    
    // Initialize gallery
    initGallery();
    
    // Initialize form handling
    initFormHandler();
});

// Create background particles
function initParticles() {
    const particleContainer = document.querySelector('.particle-container');
    const particleCount = 25; // Reduced for better performance
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
    
    // Add click effect
    document.addEventListener('click', function(e) {
        createMiniExplosion(e.clientX, e.clientY);
    });
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 15 + 5;
    
    particle.className = 'particle';
    particle.classList.add(Math.random() > 0.3 ? 'dust' : (Math.random() > 0.5 ? 'sparkle' : 'explosion'));
    
    // Random position
    const posX = Math.random() * window.innerWidth;
    const posY = Math.random() * window.innerHeight;
    
    // Random animation duration and delay
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 10;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    container.appendChild(particle);
    
    // Remove and recreate particles occasionally for better performance
    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, (duration + delay) * 1000);
}

function createMiniExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'mini-explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    
    document.body.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 1000);
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('header');
    
    function checkScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check on load
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Animate elements on scroll
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.feature-card, .about-image, .gallery-item, .hero-content-image, .hero-header-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Gallery slider pause on hover and infinite loop
function initGallery() {
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryTrack && galleryItems.length > 0) {
        // Clone items for seamless loop
        galleryItems.forEach(item => {
            const clone = item.cloneNode(true);
            galleryTrack.appendChild(clone);
        });
        
        // Pause animation on hover
        galleryTrack.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        galleryTrack.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
        
        // Add click effect to gallery items
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 500);
            });
        });
    }
}

// Form submission with AJAX and fallback
function initFormHandler() {
    const waitlistForm = document.getElementById('waitlistForm');
    const formResponse = document.getElementById('formResponse');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (email) {
                // Visual feedback
                emailInput.disabled = true;
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
                
                // Prepare form data
                const formData = new FormData();
                formData.append('email', email);
                
                // Set a timeout for the fetch operation
                const fetchTimeout = function(url, options, timeout = 5000) {
                    return Promise.race([
                        fetch(url, options),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Request timed out')), timeout)
                        )
                    ]);
                };
                
                // Send AJAX request with timeout
                fetchTimeout('form-handler.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle response
                    if (data.success) {
                        // Success
                        formResponse.textContent = data.message;
                        formResponse.className = 'form-response success';
                        emailInput.value = '';
                        
                        // Show success animation
                        showSuccessAnimation();
                    } else {
                        // Error from server
                        formResponse.textContent = data.message;
                        formResponse.className = 'form-response error';
                    }
                })
                .catch(error => {
                    // Network errors or timeout - offer fallback
                    console.error('Form submission error:', error);
                    formResponse.innerHTML = 'There was a problem submitting the form. <a href="form-fallback.html" class="fallback-link">Click here</a> for an alternative signup method.';
                    formResponse.className = 'form-response error';
                })
                .finally(() => {
                    // Re-enable form regardless of outcome
                    emailInput.disabled = false;
                    submitButton.disabled = false;
                    submitButton.textContent = 'Join Waitlist';
                });
            }
        });
    }
}

// Success animation for form submission
function showSuccessAnimation() {
    const popup = document.createElement('div');
    popup.className = 'email-popup';
    popup.innerHTML = `
        <span class="emoji">🎉</span>
        <h3>Thank you!</h3>
        <p>You've been added to our waitlist. We'll notify you when Zoo Legends launches!</p>
        <div class="close-btn">&times;</div>
    `;
    
    document.body.appendChild(popup);
    
    // Show popup with delay
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
    
    // Add close functionality
    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
    }, 5000);
}