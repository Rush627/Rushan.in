// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    let userHasInteracted = false;

    // Haptic feedback logic
    function triggerHapticFeedback() {
        if (!userHasInteracted) return;

        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(50);
            } catch (error) {
                // Ignore errors
            }
        }
    }

    // Track first interaction
    function markUserInteraction() {
        if (!userHasInteracted) {
            userHasInteracted = true;
            console.log('Interaction detected, haptics on');
        }
    }

    // Add haptics to buttons
    function addHapticFeedbackToElements() {
        const clickableElements = document.querySelectorAll('a.btn, button, .btn, .home-sci a, .footer-iconTop a, #menu-icon, .logo, .navbar a, .mobile-menu-content a, .torch-toggle-btn');

        clickableElements.forEach(element => {
            element.addEventListener('click', function (e) {
                markUserInteraction();

                // Visual pop effect
                this.classList.add('clicked');
                setTimeout(() => this.classList.remove('clicked'), 150);

                // Vibrate
                setTimeout(() => triggerHapticFeedback(), 10);
            });

            // Mobile touch fixes
            element.addEventListener('touchend', function (e) {
                setTimeout(() => {
                    this.blur();
                    this.style.transform = '';
                    this.style.boxShadow = '';
                    this.style.filter = '';
                }, 100);
            });

            element.addEventListener('touchcancel', function (e) {
                this.blur();
                this.style.transform = '';
                this.style.boxShadow = '';
                this.style.filter = '';
            });
        });
    }

    addHapticFeedbackToElements();

    // Global interaction listeners
    document.addEventListener('mousedown', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction);
    document.addEventListener('keydown', markUserInteraction);

    // Navbar toggle
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

    // Lenis Smooth Scroll
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

    // Active link highlighter
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
                if (targetLink) targetLink.classList.add('active');
            }
        });
    }, options);

    sections.forEach(section => navObserver.observe(section));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

            // Close mobile menu on click
            if (navbar.classList.contains('active')) {
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
                navbar.classList.remove('active');
                hamburgerRipple.classList.remove('active');
            }
        });
    });

    // Staggered animations
    document.querySelectorAll('.mobile-menu-content a').forEach((link, index) => {
        link.style.setProperty('--i', index + 1);
    });

    document.querySelectorAll('.home-sci a').forEach((icon, index) => {
        icon.style.setProperty('--i', index + 1);
    });

    // Typing effect
    const textAnimate = document.querySelector('.text-animate h3');
    if (textAnimate) {
        const text = textAnimate.textContent;
        if (textAnimate.innerHTML === '') {
            for (let i = 0; i < text.length; i++) {
                textAnimate.innerHTML += `<span style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
            }
        }
    }

    // Scroll animations
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

    // Contact form handling
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
                        setTimeout(() => thankYouMessage.style.display = 'none', 500);
                    }, 3000);

                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert('Submission problem: ' + data.errors.map(err => err.field + ' ' + err.message).join(', '));
                    } else {
                        alert('Something went wrong. Try again.');
                    }
                }
            } catch (error) {
                alert('Network error. Check connection.');
            }
        });
    }

    // Animate home elements on load
    const homeElementsToAnimate = document.querySelectorAll(
        '.logo, .home-content, .home-content h1, .home-content h1 span, .home-content p, .btn-box, .home-sci a, .btn-box .btn, .btn-box.btns .btn, .about-img img'
    );
    homeElementsToAnimate.forEach(el => el.classList.add('show-animate'));

    const textAnimateH3 = document.querySelector('.text-animate h3');
    if (textAnimateH3 && textAnimateH3.innerHTML === '') {
        const text = textAnimateH3.textContent;
        for (let i = 0; i < text.length; i++) {
            textAnimateH3.innerHTML += `<span style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
        }
    }

    // Torch feature
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

        // Random msg on hover
        torchToggleBtn.addEventListener('mouseenter', () => {
            const randomIndex = Math.floor(Math.random() * messages.length);
            torchMessage.textContent = messages[randomIndex];
            torchMessageBox.classList.add('show');
        });

        torchToggleBtn.addEventListener('mouseleave', () => {
            torchMessageBox.classList.remove('show');
        });
    }

    // Show random msg on load
    if (torchMessageBox && torchMessage) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        torchMessage.textContent = messages[randomIndex];
        torchMessageBox.classList.add('show');

        setTimeout(() => {
            torchMessageBox.classList.remove('show');
        }, 10000);
    }

    // Fix sticky hover on touch
    function hasTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

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
        } catch (ex) {
            // ignore
        }
    }

    // Skill bars animation
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.skills-content .progress .bar span');
        progressBars.forEach(bar => bar.classList.add('animate'));
    }

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
            }, {
                threshold: 0.3,
                rootMargin: '0px 0px -100px 0px'
            });

            observer.observe(skillsSection);
        }
    }

    setupSkillsAnimation();

    // --- Scroll Progress Bar ---
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = `${scrolled}%`;
    });

    // --- Custom Cursor ---
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Grow cursor on hoverable elements
    const hoverElements = document.querySelectorAll('a, button, .btn, .project-card, .tech-stack i, .home-sci a');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
});
