// Wrap all DOM manipulation in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

    // Track if user has interacted with the page
    let userHasInteracted = false;

    // Haptic Feedback Function
    function triggerHapticFeedback(duration = 50) {
        if (!userHasInteracted) return;
        if ('vibrate' in navigator) {
            try { navigator.vibrate(duration); } catch (error) {}
        }
    }

    // Mark user interaction
    function markUserInteraction() {
        if (!userHasInteracted) {
            userHasInteracted = true;
            // console.log removed per request
        }
    }

    // Add haptic feedback to all buttons and clickable elements
    function addHapticFeedbackToElements() {
        const clickableElements = document.querySelectorAll('a.btn, button, .btn, .home-sci a, .footer-iconTop a');
        clickableElements.forEach(element => {
            element.addEventListener('click', function(e) {
                markUserInteraction();
                this.classList.add('clicked');
                setTimeout(() => { this.classList.remove('clicked'); }, 150);
                setTimeout(() => { triggerHapticFeedback(30); }, 10);
            });
            element.addEventListener('touchend', function(e) {
                setTimeout(() => { this.blur(); this.style.transform = ''; this.style.boxShadow = ''; this.style.filter = ''; }, 100);
            });
            element.addEventListener('touchcancel', function(e) { this.blur(); this.style.transform = ''; this.style.boxShadow = ''; this.style.filter = ''; });
        });
    }

    // Initialize haptic feedback
    addHapticFeedbackToElements();

    // Also mark user interaction on any mouse/touch/keyboard event
    document.addEventListener('mousedown', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction, { passive: true });
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

    // Sticky header
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }
    });

    // Intersection Observer for Active Nav Links
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

    // Contact Form
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
                    headers: { 'Accept': 'application/json' }
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
                        setTimeout(() => { thankYouMessage.style.display = 'none'; }, 500);
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

    // Ensures Home section elements animate immediately on load
    const homeElementsToAnimate = document.querySelectorAll(
        '.logo, .home-content, .home-content h1, .home-content h1 span, .home-content p, .btn-box, .home-sci a, .btn-box .btn, .btn-box.btns .btn, .about-img img'
    );
    homeElementsToAnimate.forEach(el => { el.classList.add('show-animate'); });

    const textAnimateH3 = document.querySelector('.text-animate h3');
    if (textAnimateH3 && textAnimateH3.innerHTML === '') {
        const text = textAnimateH3.textContent;
        for (let i = 0; i < text.length; i++) {
            textAnimateH3.innerHTML += `<span style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
        }
    }

    // --- Torch Toggle Feature (enhanced) ---
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

    // Smooth torch follow variables
    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let smoothX = targetX, smoothY = targetY;
    let rafId = null;

    // Helpers for dynamic radius and brightness
    function getDistanceFromCenter(x, y) {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        return Math.hypot(x - cx, y - cy);
    }
    function getRadiusForDistance(dist) {
        const max = Math.max(window.innerWidth, window.innerHeight);
        const norm = Math.min(1, dist / (Math.sqrt(2) * max / 2));
        const large = max * 0.8;
        const small = max * 0.35;
        const value = small + (large - small) * (1 - norm);
        return Math.round(value) + 'px';
    }
    function getBrightnessForDistance(dist) {
        const max = Math.max(window.innerWidth, window.innerHeight);
        const norm = Math.min(1, dist / (Math.sqrt(2) * max / 2));
        const base = 0.9;
        const range = 0.9;
        return (base + norm * range).toFixed(3);
    }

    function setOverlayVars(x, y, radius, brightness) {
        if (!torchOverlay) return;
        torchOverlay.style.setProperty('--torch-x', `${Math.round(x)}px`);
        torchOverlay.style.setProperty('--torch-y', `${Math.round(y)}px`);
        torchOverlay.style.setProperty('--torch-radius', radius);
        torchOverlay.style.setProperty('--torch-brightness', brightness);
    }

    // Pointer move handler (mouse & touch)
    function updateTorchPosition(e) {
        // if torch not active, still update target coords so when turned on it won't jump
        let clientX, clientY;
        if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
            e.preventDefault();
        } else if (e.type === 'mousemove') {
            clientX = e.clientX; clientY = e.clientY;
        } else {
            return;
        }
        targetX = clientX; targetY = clientY;
    }

    // Smooth follow loop
    function startSmoothLoop() {
        if (!torchOverlay) return;
        if (rafId) return;
        const ease = 0.18;
        function loop() {
            smoothX += (targetX - smoothX) * ease;
            smoothY += (targetY - smoothY) * ease;
            const dist = getDistanceFromCenter(smoothX, smoothY);
            const radius = getRadiusForDistance(dist);
            const brightness = getBrightnessForDistance(dist);
            setOverlayVars(smoothX, smoothY, radius, brightness);
            rafId = requestAnimationFrame(loop);
        }
        rafId = requestAnimationFrame(loop);
    }
    function stopSmoothLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    // Soft fade-out when turning off
    function fadeOutOverlayAndStop() {
        if (!torchOverlay) return;
        let fadeStart = performance.now();
        const fadeDuration = 450;
        (function fade(ts) {
            const p = Math.min(1, (ts - fadeStart) / fadeDuration);
            const b = 1 - p;
            setOverlayVars(smoothX, smoothY, getRadiusForDistance(getDistanceFromCenter(smoothX, smoothY)), b.toFixed(3));
            if (p < 1) requestAnimationFrame(fade);
            else { torchOverlay.style.opacity = '0'; document.body.classList.remove('torch-active'); }
        })(fadeStart);
    }

    // Toggle torch effect
    function toggleTorchEffect(activate) {
        if (!torchOverlay) return;
        if (activate) {
            document.body.classList.add('torch-active');
            if (torchToggleBtn) torchToggleBtn.classList.add('active-torch-icon');
            torchOverlay.style.opacity = '1';
            document.addEventListener('mousemove', updateTorchPosition);
            document.addEventListener('touchmove', updateTorchPosition, { passive: false });
            startSmoothLoop();
            // hide message when turned on
            if (torchMessageBox) torchMessageBox.classList.remove('show');
        } else {
            // graceful fade
            stopSmoothLoop();
            document.removeEventListener('mousemove', updateTorchPosition);
            document.removeEventListener('touchmove', updateTorchPosition);
            if (torchToggleBtn) torchToggleBtn.classList.remove('active-torch-icon');
            fadeOutOverlayAndStop();
        }
        localStorage.setItem('torchActive', activate);
    }

    // Initial overlay vars
    if (torchOverlay) {
        setOverlayVars(smoothX, smoothY, getRadiusForDistance(getDistanceFromCenter(smoothX, smoothY)), getBrightnessForDistance(getDistanceFromCenter(smoothX, smoothY)));
        torchOverlay.style.transition = 'opacity 0.25s linear';
        torchOverlay.style.opacity = isTorchActive ? '1' : '0';
    }

    // Hook up toggle button
    if (torchToggleBtn) {
        torchToggleBtn.addEventListener('click', () => {
            markUserInteraction();
            triggerHapticFeedback(50);
            isTorchActive = !isTorchActive;
            toggleTorchEffect(isTorchActive);
        });

        torchToggleBtn.addEventListener('mouseenter', () => {
            if (!isTorchActive && torchMessageBox && torchMessage) {
                const randomIndex = Math.floor(Math.random() * messages.length);
                torchMessage.textContent = messages[randomIndex];
                torchMessageBox.classList.add('show');
            }
        });
        torchToggleBtn.addEventListener('mouseleave', () => {
            if (torchMessageBox) torchMessageBox.classList.remove('show');
        });

        torchToggleBtn.addEventListener('touchstart', () => {
            if (!isTorchActive && torchMessageBox && torchMessage) {
                const randomIndex = Math.floor(Math.random() * messages.length);
                torchMessage.textContent = messages[randomIndex];
                torchMessageBox.classList.add('show');
            }
        }, { passive: true });
    }

    // Show random message on load only if torch is OFF
    if (torchMessageBox && torchMessage && !isTorchActive) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        torchMessage.textContent = messages[randomIndex];
        torchMessageBox.classList.add('show');
        setTimeout(() => { if (torchMessageBox) torchMessageBox.classList.remove('show'); }, 10000);
    } else {
        if (torchMessageBox) torchMessageBox.classList.remove('show');
    }

    // Remove :hover styles on touch devices
    function hasTouch() { return 'ontouchstart' in window || navigator.maxTouchPoints > 0; }
    if (hasTouch()) {
      try {
        for (let si = 0; si < document.styleSheets.length; si++) {
          const styleSheet = document.styleSheets[si];
          if (!styleSheet.rules) continue;
          for (let ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
            const rule = styleSheet.rules[ri];
            if (rule.selectorText && rule.selectorText.includes(':hover')) {
              styleSheet.deleteRule(ri);
            }
          }
        }
      } catch (ex) {}
    }

    // Progress Bar Animation
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.skills-content .progress .bar span');
        progressBars.forEach(bar => { bar.classList.add('animate'); });
    }

    // Intersection Observer for Skills Section
    function setupSkillsAnimation() {
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateProgressBars();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3, rootMargin: '0px 0px -100px 0px' });
            observer.observe(skillsSection);
        }
    }
    setupSkillsAnimation();

    // Update center on resize to avoid jump
    window.addEventListener('resize', () => {
        targetX = window.innerWidth / 2; targetY = window.innerHeight / 2;
        smoothX = targetX; smoothY = targetY;
        if (torchOverlay) setOverlayVars(smoothX, smoothY, getRadiusForDistance(0), getBrightnessForDistance(0));
    });

});
