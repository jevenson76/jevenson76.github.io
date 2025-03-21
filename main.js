// Zoo Legends Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
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
            }
        });
    });

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.feature-card, .about-image, .gallery-item');

    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight * 0.8) {
                element.classList.add('animate');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check on load

    // Gallery slider pause on hover
    const galleryTrack = document.querySelector('.gallery-track');

    if (galleryTrack) {
        galleryTrack.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });

        galleryTrack.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }

    // Create clones for infinite gallery slider
    function setupGallerySlider() {
        const galleryTrack = document.querySelector('.gallery-track');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (galleryTrack && galleryItems.length > 0) {
            // Clone items for seamless loop
            galleryItems.forEach(item => {
                const clone = item.cloneNode(true);
                galleryTrack.appendChild(clone);
            });
        }
    }

    setupGallerySlider();

    // Form submission with AJAX and fallback
    const waitlistForm = document.getElementById('waitlistForm');
    const formResponse = document.getElementById('formResponse');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitButton = this.querySelector('button[type="submit"]');

            if (email) {
                // Disable form while submitting
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
});