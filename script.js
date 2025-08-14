// Wrap all DOM manipulation in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

    // Track if user has interacted with the page
    let userHasInteracted = false;

    // Haptic Feedback Function with proper user interaction check
    function triggerHapticFeedback() {
        // Only vibrate if user has interacted with the page
        if (!userHasInteracted) {
            return; // Exit early if no user interaction yet
        }

        // Check if the device supports vibration and user has interacted
        if ('vibrate' in navigator && userHasInteracted) {
            try {
                // Trigger a short vibration (50ms) for button press feedback
                navigator.vibrate(50);
            } catch (error) {
                // Silently handle vibration errors
            }
        }
    }

    // Mark user interaction when they first interact with the page
    function markUserInteraction() {
        if (!userHasInteracted) {
            userHasInteracted = true;
            console.log('User interaction detected - haptic feedback enabled');
        }
    }

    // Add haptic feedback to all buttons and clickable elements
    function addHapticFeedbackToElements() {
        const clickableElements = document.querySelectorAll('a.btn, button, .btn, .home-sci a, .footer-iconTop a');
        
        clickableElements.forEach(element => {
            element.addEventListener('click', function(e) {
                // Mark user interaction on first click
                markUserInteraction();
                
                // Add a visual feedback class for extra effect
                this.classList.add('clicked');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 150);
                
                // Trigger haptic feedback after user interaction is marked
                setTimeout(() => {
                    triggerHapticFeedback();
                }, 10);
            });
            
            // Fix for mobile hover effects getting stuck
            element.addEventListener('touchend', function(e) {
                // Force remove any hover states after touch ends
                setTimeout(() => {
                    this.blur();
                    this.style.transform = '';
                    this.style.boxShadow = '';
                    this.style.filter = '';
                }, 100);
            });
            
            // Additional fix for touch devices
            element.addEventListener('touchcancel', function(e) {
                this.blur();
                this.style.transform = '';
                this.style.boxShadow = '';
                this.style.filter = '';
            });
        });
    }

    // Initialize haptic feedback
    addHapticFeedbackToElements();

    // Also mark user interaction on any mouse/touch event
    document.addEventListener('mousedown', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction);
    document.addEventListener('keydown', markUserInteraction);

    // toggle icon navbar
    let menuIcon = document.querySelector('#menu-icon');
    let navbar = document.querySelector('.navbar');
    let hamburgerRipple = document.querySelector('.hamburger-ripple');
    let header = document.querySelector('header');

    if (menuIcon && navbar && hamburgerRipple && header) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('fa-bars');
            menuIcon.classList.toggle('fa-xmark');

            navbar.classList.toggle('active');
            hamburgerRipple.classList.toggle('active');
        };
    }

    let sections = document.querySelectorAll('section');
    let navLinks = document.querySelectorAll('header nav a');

    // --- LENIS Scroll Initialization ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.5,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- Sticky Header (moved from lenis.on('scroll')) ---
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }
    });

    // --- Intersection Observer for Active Nav Links ---
    const options = {
        rootMargin: `-${header ? header.offsetHeight : 90}px 0px 0px 0px`,
        threshold: 0.3
    };

    const navObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const targetLink = document.querySelector(`header nav a[href="#${id}"]`);

            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            }
        });
    }, options);

    sections.forEach(section => {
        navObserver.observe(section);
    });


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            let targetElement = document.querySelector(targetId);
            let scrollOffset = 0; 

            
            if (targetId === '#top' || targetId === '#home') {
                targetElement = document.documentElement; 
                scrollOffset = 0; 
            } else if (header) {
                
                scrollOffset = -(header.offsetHeight + 10);
            } else {
                
                scrollOffset = -70;
            }

            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: scrollOffset,
                    duration: 1.2
                });
            }

            // Close mobile menu if open after clicking a link
            if (navbar.classList.contains('active')) {
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
                navbar.classList.remove('active');
                hamburgerRipple.classList.remove('active');
            }
        });
    });

    // Add animation delay to navbar links (for mobile menu transition)
    document.querySelectorAll('.mobile-menu-content a').forEach((link, index) => {
        link.style.setProperty('--i', index + 1);
    });

    // Add animation delay to social media icons
    document.querySelectorAll('.home-sci a').forEach((icon, index) => {
        icon.style.setProperty('--i', index + 1);
    });

    // Add typing animation to text-animate
    const textAnimate = document.querySelector('.text-animate h3');
    if (textAnimate) {
        const text = textAnimate.textContent;
        if (textAnimate.innerHTML === '') {
            for (let i = 0; i < text.length; i++) {
                textAnimate.innerHTML += `<span style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
            }
        }
    }

    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-animate');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.heading, .about-content, .education-column .education-box .education-content, .skills-column .skills-box .skills-content, .contact form').forEach(el => {
        observer.observe(el);
    });

    // --- New functionality for Contact Form ---
    const contactForm = document.querySelector('.contact form');
    if (contactForm) {
        const thankYouMessage = document.createElement('div');
        thankYouMessage.classList.add('thank-you-message');
        thankYouMessage.innerHTML = '<h3>Thank You for your feedback!</h3><p>I\'ll get back to you soon.</p>';
        contactForm.parentNode.insertBefore(thankYouMessage, contactForm.nextSibling);

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.target;
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {

                 emailjs.send("service_46acsfl", "template_x0tcmrn", {
                 user_name: formData.get("user_name"),
                 user_email: formData.get("user_email"),
                 message: formData.get("message")
                });



                    form.reset();

                    thankYouMessage.style.display = 'block';
                    thankYouMessage.style.opacity = '1';
                    thankYouMessage.style.transform = 'translate(-50%, -50%)';

                    setTimeout(() => {
                        thankYouMessage.style.opacity = '0';
                        thankYouMessage.style.transform = 'translate(-50%, -50%) translateY(-20px)';
                        setTimeout(() => {
                            thankYouMessage.style.display = 'none';
                        }, 500);
                    }, 3000);

                } else {
                    const data = await response.json();
                    if (data.errors) {
                        console.error('Formspree errors:', data.errors);
                        alert('Oops! There was a problem with your submission: ' + data.errors.map(err => err.field + ' ' + err.message).join(', '));
                    } else {
                        console.error('Form submission failed:', response.statusText);
                        alert('Oops! Something went wrong. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Network error during form submission:', error);
                alert('Oops! Could not connect to the server. Please check your internet connection and try again.');
            }
        });
    }

    // --- Ensures Home section elements animate immediately on load ---
    const homeElementsToAnimate = document.querySelectorAll(
        '.logo, .home-content, .home-content h1, .home-content h1 span, .home-content p, .btn-box, .home-sci a, .btn-box .btn, .btn-box.btns .btn, .about-img img'
    );
    homeElementsToAnimate.forEach(el => {
        el.classList.add('show-animate');
    });

    const textAnimateH3 = document.querySelector('.text-animate h3');
    if (textAnimateH3 && textAnimateH3.innerHTML === '') {
        const text = textAnimateH3.textContent;
        for (let i = 0; i < text.length; i++) {
            textAnimateH3.innerHTML += `<span style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
        }
    }

    // --- Torch Toggle Feature ---
    const torchToggleBtn = document.getElementById('torchToggleBtn');
    const torchOverlay = document.getElementById('torchOverlay');
    const torchMessageBox = document.getElementById('torchMessageBox');
    const torchMessage = document.getElementById('torchMessage');

    const messages = [
              "Darkness in your life? Well, I can't change that, but you can light up this page by clicking here!",
              "Feeling lost in the dark? Click here to reveal the light!",
              "Need a little illumination? Tap this button to brighten things up!",
              "Unveil the hidden details! Activate the torch mode here.",
              "Experiencing a power outage? Not on this page! Click for light.",
              "Out of power? Nah, we've got built-in brightness.",
              "This isn’t a horror movie—turn the light on, brave soul!",
              "Sometimes, you’ve got to make your own light. Click here.",
              "This site’s got secrets. Torch mode might reveal a few.",
              "Dim vibes? Let there be light—literally.",
              "Behind every dark page is a bright click. Try it."
    ];

    
    let isTorchActive = localStorage.getItem('torchActive') === 'true'; 

    // Function to apply/remove torch effect
    function toggleTorchEffect(activate) {
        if (activate) {
            document.body.classList.add('torch-active');
            torchToggleBtn.classList.add('active-torch-icon'); 
            torchOverlay.style.opacity = '1'; 
            
            document.addEventListener('mousemove', updateTorchPosition);
            document.addEventListener('touchmove', updateTorchPosition, { passive: false }); 
        } else {
            document.body.classList.remove('torch-active');
            torchToggleBtn.classList.remove('active-torch-icon'); 
            torchOverlay.style.opacity = '0'; 
            
            document.removeEventListener('mousemove', updateTorchPosition);
            document.removeEventListener('touchmove', updateTorchPosition);
        }
        localStorage.setItem('torchActive', activate); 
    }

    
    function updateTorchPosition(e) {
        if (!isTorchActive) return; 

        let clientX, clientY;
        if (e.type === 'touchmove' && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault(); 
        } else if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }

        
        torchOverlay.style.setProperty('--torch-x', `${clientX}px`);
        torchOverlay.style.setProperty('--torch-y', `${clientY}px`);
    }

    
    toggleTorchEffect(isTorchActive);

    
    if (torchToggleBtn) {
        torchToggleBtn.addEventListener('click', () => {
            isTorchActive = !isTorchActive;
            toggleTorchEffect(isTorchActive);
        });


        // Show random message on hover
torchToggleBtn.addEventListener('mouseenter', () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    torchMessage.textContent = messages[randomIndex];
    torchMessageBox.classList.add('show');
});

// Hide message when mouse leaves
torchToggleBtn.addEventListener('mouseleave', () => {
    torchMessageBox.classList.remove('show');
});

    }

    // Show random message on load
if (torchMessageBox && torchMessage) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        torchMessage.textContent = messages[randomIndex];
        torchMessageBox.classList.add('show');

        setTimeout(() => {
            torchMessageBox.classList.remove('show');
        }, 10000); // Disappear after 10 seconds (10000 milliseconds)
    }

    // Remove :hover styles on touch devices to prevent sticky hover
    function hasTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    if (hasTouch()) {
      try {
        // Loop through all stylesheets
        for (let si = 0; si < document.styleSheets.length; si++) {
          const styleSheet = document.styleSheets[si];
          if (!styleSheet.rules) continue;

          // Loop through all rules
          for (let ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
            const rule = styleSheet.rules[ri];
            if (rule.selectorText && rule.selectorText.includes(':hover')) {
              styleSheet.deleteRule(ri);
            }
          }
        }
      } catch (ex) {
        
      }
    }

    // Progress Bar Animation
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.skills-content .progress .bar span');
        
        progressBars.forEach(bar => {
            // Add the animate class to trigger the CSS animation
            bar.classList.add('animate');
        });
    }

    // Intersection Observer for Skills Section
    function setupSkillsAnimation() {
        const skillsSection = document.querySelector('.skills');
        
        if (skillsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Start the progress bar animation when skills section is visible
                        animateProgressBars();
                        // Unobserve after animation is triggered
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3, // Trigger when 30% of the section is visible
                rootMargin: '0px 0px -100px 0px'
            });
            
            observer.observe(skillsSection);
        }
    }

    // Initialize skills animation when DOM is loaded
    setupSkillsAnimation();
});
