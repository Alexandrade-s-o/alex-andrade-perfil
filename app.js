// ==============================================
// 1. SCROLL SETUP (native + GSAP ScrollTrigger)
// ==============================================
gsap.registerPlugin(ScrollTrigger);

let scrollLocked = true;

function lockScroll() {
    scrollLocked = true;
    document.body.style.overflow = 'hidden';
}

function unlockScroll() {
    scrollLocked = false;
    document.body.style.overflow = '';
}

lockScroll();

// ==============================================
// 3. CUSTOM CURSOR — ADVANCED
// ==============================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const cursorLabel = document.querySelector('.cursor-label');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;
let isMouseOnScreen = false;

// Trail particles pool
const TRAIL_COUNT = 12;
const trailDots = [];
const trailPositions = [];

function createTrail() {
    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        document.body.appendChild(dot);
        trailDots.push(dot);
        trailPositions.push({ x: 0, y: 0 });
    }
}

if (cursor && follower) {
    createTrail();

    document.addEventListener('mouseenter', () => {
        isMouseOnScreen = true;
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        gsap.to(follower, { opacity: 1, duration: 0.3 });
    });

    document.addEventListener('mouseleave', () => {
        isMouseOnScreen = false;
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
        gsap.to(follower, { opacity: 0, duration: 0.3 });
        trailDots.forEach(d => gsap.to(d, { opacity: 0, duration: 0.2 }));
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: "power2.out" });
    });

    // Smooth follower + trail
    gsap.ticker.add(() => {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        gsap.set(follower, { x: followerX, y: followerY });

        // Update trail positions with decreasing speed
        for (let i = 0; i < TRAIL_COUNT; i++) {
            const prev = i === 0 ? { x: mouseX, y: mouseY } : trailPositions[i - 1];
            const speed = 0.25 - (i * 0.015);
            trailPositions[i].x += (prev.x - trailPositions[i].x) * speed;
            trailPositions[i].y += (prev.y - trailPositions[i].y) * speed;
            const dot = trailDots[i];
            const scale = 1 - (i / TRAIL_COUNT) * 0.8;
            const alpha = (0.3 - (i / TRAIL_COUNT) * 0.28);
            dot.style.transform = `translate(${trailPositions[i].x}px, ${trailPositions[i].y}px) translate(-50%, -50%) scale(${scale})`;
            dot.style.opacity = isMouseOnScreen ? alpha : 0;
        }
    });

    // Click pulse
    document.addEventListener('mousedown', () => {
        gsap.to(cursor, { scale: 0.5, duration: 0.15 });
        gsap.to(follower, { scale: 0.85, duration: 0.15 });
    });
    document.addEventListener('mouseup', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
        gsap.to(follower, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
    });

    // --- State management ---
    function setCursorState(state, label) {
        follower.className = 'cursor-follower';
        if (state) follower.classList.add('state-' + state);
        cursorLabel.textContent = label || '';
        if (state === 'image' || state === 'video') {
            cursor.classList.add('is-hidden');
        } else {
            cursor.classList.remove('is-hidden');
        }
    }

    function resetCursor() {
        setCursorState(null, '');
    }

    // --- Links & buttons ---
    document.querySelectorAll('a:not(.portfolio-item):not(.contact-card), button:not(.hamburger):not(.back-to-top), .nav-links a, .skill-chip').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('link', ''));
        el.addEventListener('mouseleave', resetCursor);
    });

    // --- Gallery images ---
    document.querySelectorAll('#grafico .portfolio-item').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('image', 'Ver'));
        el.addEventListener('mouseleave', resetCursor);
    });

    // --- Video triggers ---
    document.querySelectorAll('.video-trigger').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('video', 'Play'));
        el.addEventListener('mouseleave', resetCursor);
    });

    // --- Contact cards ---
    document.querySelectorAll('.contact-card').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('link', ''));
        el.addEventListener('mouseleave', resetCursor);
    });

    // --- Section titles (text beam) ---
    document.querySelectorAll('.neon-text').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('text', ''));
        el.addEventListener('mouseleave', resetCursor);
    });

    // --- Magnetic buttons ---
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.35;
            const dy = (e.clientY - cy) * 0.35;
            gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: "power3.out" });
            setCursorState('magnetic', '');
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
            resetCursor();
        });
    });
}

// ==============================================
// 4. PRELOADER — video intro (assets/intro.mp4 desde Remotion)
// ==============================================
let introFinished = false;

function playHeroEntrance() {
    const tl = gsap.timeline();
    tl.from('.hero-tag', { y: 30, opacity: 0, duration: 1.5, ease: "power3.out" })
        .from('.hero h1', {
            scale: 0.7, opacity: 0, duration: 2, ease: "elastic.out(1, 0.4)"
        }, "-=1")
        .from('.hero .subtitle', {
            y: 30, opacity: 0, duration: 1.5, ease: "power3.out"
        }, "-=1.2")
        .from('.scroll-indicator', {
            y: 20, opacity: 0, duration: 1, ease: "power3.out"
        }, "-=1");
    return tl;
}

function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    const preloader = document.getElementById('preloader');
    const video = document.getElementById('intro-video');
    if (video) {
        video.pause();
    }
    unlockScroll();
    if (preloader) {
        preloader.removeAttribute('aria-busy');
        gsap.to(preloader, {
            autoAlpha: 0,
            duration: 0.95,
            ease: "power2.out",
            onComplete: () => {
                preloader.style.display = 'none';
                initParticles();
            }
        });
    } else {
        initParticles();
    }
    playHeroEntrance();
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const introVideo = document.getElementById('intro-video');
const skipBtn = document.getElementById('preloader-skip');

if (prefersReducedMotion) {
    finishIntro();
} else if (introVideo) {
    introVideo.setAttribute('playsinline', '');
    introVideo.muted = true;

    const tryPlay = () => introVideo.play().catch(() => {});

    introVideo.addEventListener('ended', finishIntro);
    introVideo.addEventListener('error', () => finishIntro());

    if (skipBtn) {
        skipBtn.addEventListener('click', finishIntro);
    }

    if (introVideo.readyState >= 2) {
        tryPlay();
    } else {
        introVideo.addEventListener('canplay', tryPlay, { once: true });
        introVideo.addEventListener('loadeddata', tryPlay, { once: true });
    }
} else {
    finishIntro();
}

// ==============================================
// 5. PARTICLE CANVAS (HERO)
// ==============================================
function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let heroMX = w / 2, heroMY = h / 2;
    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        heroMX = e.clientX - rect.left;
        heroMY = e.clientY - rect.top;
    });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.baseVx = (Math.random() - 0.5) * 0.3;
            this.baseVy = (Math.random() - 0.5) * 0.3;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
            this.r = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.3 + 0.05;
        }
        update() {
            const dx = this.x - heroMX;
            const dy = this.y - heroMY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const repelRadius = 150;

            if (dist < repelRadius && dist > 0) {
                const force = (repelRadius - dist) / repelRadius * 0.8;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }

            this.vx += (this.baseVx - this.vx) * 0.05;
            this.vy += (this.baseVy - this.vy) * 0.05;

            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,255,255,${this.alpha})`;
            ctx.fill();
        }
    }

    const count = Math.min(80, Math.floor(w * h / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,255,255,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();
}

// ==============================================
// 6. TEXT SPLIT ANIMATION PREP
// ==============================================
document.querySelectorAll('.neon-text').forEach(title => {
    const textNodes = Array.from(title.childNodes).filter(node => node.nodeType === 3);
    if (textNodes.length) {
        const text = textNodes.map(n => n.nodeValue).join('').trim();
        textNodes.forEach(n => n.remove());

        const wrapper = document.createElement('span');
        wrapper.className = 'wow-chars';
        wrapper.style.display = 'inline-block';

        [...text].forEach(char => {
            if (char === ' ') {
                wrapper.innerHTML += '&nbsp;';
            } else {
                wrapper.innerHTML += `<span class="char" style="display:inline-block">${char}</span>`;
            }
        });

        title.insertBefore(wrapper, title.firstChild);
    }
});

// ==============================================
// 7. HUD FLOATING SYMBOLS
// ==============================================
document.querySelectorAll('#hud-floats .hf').forEach(el => {
    const posIn  = parseFloat(el.dataset.in) || 0;
    const posOut = parseFloat(el.dataset.out) || 100;

    gsap.to(el, {
        opacity: 0.28, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
            trigger: document.body,
            start: `${posIn}% top`, end: `${posIn + 4}% top`, scrub: 0.8
        }
    });

    gsap.to(el, {
        opacity: 0, y: -8, duration: 0.5, ease: 'power2.in',
        scrollTrigger: {
            trigger: document.body,
            start: `${posOut - 3}% top`, end: `${posOut + 2}% top`, scrub: 0.8
        }
    });

    gsap.set(el, { y: 10 });
});

// ==============================================
// 8. SCROLL PROGRESS RAIL
// ==============================================
gsap.to('.scroll-progress-fill', {
    height: '100%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});

// ==============================================
// 9. SCROLL ANIMATIONS (WOW FACTOR)
// ==============================================
const panels = gsap.utils.toArray('.panel');

panels.forEach((panel, i) => {
    if (i === 0) {
        const paths = panel.querySelectorAll('.draw-path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: { trigger: panel, start: "top top", end: "bottom top", scrub: 1.5 }
            });
        });

        gsap.to(".hero-drawing-svg", {
            yPercent: 30,
            ease: "none",
            scrollTrigger: { trigger: panel, start: "top top", end: "bottom top", scrub: true }
        });
        return;
    }

    const title = panel.querySelector('.neon-text');
    const content = panel.querySelector('.portfolio-grid, .about-grid, .ethnic-feature, .certs-feature, .contact-grid');
    const paragraphs = panel.querySelectorAll('.section-content > p, .hint-text');
    const chars = title ? panel.querySelectorAll('.char') : [];
    const skillChips = panel.querySelectorAll('.skill-chip');

    const elements = [title, ...paragraphs, content].filter(Boolean);
    gsap.set(elements, { y: 100, opacity: 0 });
    if (chars.length) gsap.set(chars, { opacity: 0, rotationX: -90, y: 50, transformOrigin: '50% 50% -50px' });
    if (skillChips.length) gsap.set(skillChips, { opacity: 0, scale: 0.8, y: 20 });

    ScrollTrigger.create({
        trigger: panel,
        start: "top 80%",
        onEnter: () => {
            gsap.to(elements, {
                y: 0, opacity: 1, duration: 1.4, stagger: 0.15, ease: "power3.out"
            });
            if (chars.length) {
                gsap.to(chars, {
                    opacity: 1, rotationX: 0, y: 0,
                    duration: 0.8, stagger: 0.04, ease: "back.out(2)", delay: 0.2
                });
            }
            if (skillChips.length) {
                gsap.to(skillChips, {
                    opacity: 1, scale: 1, y: 0,
                    duration: 0.6, stagger: 0.08, ease: "back.out(1.5)", delay: 0.5
                });
            }
        },
        onLeaveBack: () => {
            gsap.to(elements, {
                y: 50, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.in"
            });
            if (chars.length) {
                gsap.to(chars, {
                    opacity: 0, rotationX: 90, y: 30,
                    duration: 0.3, stagger: 0.02, ease: "power2.in"
                });
            }
            if (skillChips.length) {
                gsap.to(skillChips, {
                    opacity: 0, scale: 0.8, y: 20,
                    duration: 0.3, stagger: 0.03, ease: "power2.in"
                });
            }
        }
    });

    gsap.to(panel, {
        backgroundPosition: "50% 100%",
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true }
    });
});

// Parallax for web mockups
gsap.utils.toArray('.web-mockup-item').forEach((item, i) => {
    gsap.from(item, {
        y: 60 + (i % 2) * 40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// Stagger gallery items
gsap.utils.toArray('.gallery-grid .portfolio-item').forEach((item, i) => {
    gsap.from(item, {
        y: 80,
        opacity: 0,
        scale: 0.95,
        rotationY: i % 2 === 0 ? -5 : 5,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });
});

// Contact cards
gsap.utils.toArray('.contact-card').forEach((card, i) => {
    gsap.from(card, {
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: i * 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });
});

// Footer
gsap.from('.site-footer', {
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: '.site-footer',
        start: "top 95%",
        toggleActions: "play none none none"
    }
});

// ==============================================
// 10. HAMBURGER MENU
// ==============================================
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is-active');
        mobileMenu.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
        if (isOpen) lockScroll(); else unlockScroll();
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('is-active');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            unlockScroll();
        });
    });
}

// ==============================================
// 11. SMOOTH NAV SCROLL + ACTIVE SECTION
// ==============================================
document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            const y = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

const navLinksAll = document.querySelectorAll('.nav-links a[data-section]');
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    let current = '';
    const scrollY = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            current = section.getAttribute('id');
        }
    });

    navLinksAll.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
});

// ==============================================
// 12. BACK TO TOP
// ==============================================
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > window.innerHeight);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==============================================
// 13. IMAGE MODAL
// ==============================================
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const galleryItems = document.querySelectorAll('#grafico .portfolio-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            modalImg.src = img.src;
            modal.classList.add('active');
            lockScroll();
        }
    });
});

function closeImageModal() {
    modal.classList.remove('active');
    unlockScroll();
}

modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-close')) closeImageModal();
});
modal.querySelector('.modal-close')?.addEventListener('click', closeImageModal);

// ==============================================
// 14. VIDEO MODAL
// ==============================================
const vidModal = document.getElementById('videoModal');
const modalVideoIframe = document.getElementById('modalVideoIframe');
const videoTriggers = document.querySelectorAll('.video-trigger');

videoTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
        const vidId = btn.getAttribute('data-video-id');
        if (vidId) {
            modalVideoIframe.src = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0&showinfo=0`;
            vidModal.classList.add('active');
            lockScroll();
        }
    });
});

function closeVideoModal() {
    vidModal.classList.remove('active');
    modalVideoIframe.src = '';
    unlockScroll();
}

vidModal.addEventListener('click', (e) => {
    if (e.target === vidModal || e.target.classList.contains('modal-close')) closeVideoModal();
});
vidModal.querySelector('.modal-close')?.addEventListener('click', closeVideoModal);

// ==============================================
// 15. ESCAPE KEY CLOSES MODALS
// ==============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('active')) closeImageModal();
        if (vidModal.classList.contains('active')) closeVideoModal();
        if (mobileMenu?.classList.contains('is-open')) {
            hamburger.classList.remove('is-active');
            mobileMenu.classList.remove('is-open');
            unlockScroll();
        }
    }
});

// ==============================================
// 16. LAZY LOAD IFRAMES (IntersectionObserver)
// ==============================================
const iframePlaceholders = document.querySelectorAll('.iframe-placeholder');

const iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const placeholder = entry.target;
            const src = placeholder.dataset.src;
            if (src) {
                const iframe = document.createElement('iframe');
                iframe.src = src;
                iframe.title = src;
                iframe.setAttribute('scrolling', 'no');
                iframe.setAttribute('tabindex', '-1');
                iframe.setAttribute('loading', 'lazy');
                placeholder.parentNode.replaceChild(iframe, placeholder);
            }
            iframeObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '200px' });

iframePlaceholders.forEach(p => iframeObserver.observe(p));

// ==============================================
// 17. PDF TRIGGERS (open PDF in new tab)
// ==============================================
document.querySelectorAll('.pdf-trigger').forEach(item => {
    item.addEventListener('click', () => {
        const pdf = item.dataset.pdf;
        if (pdf) window.open(pdf, '_blank');
    });
});

// ==============================================
// 18. 3D TILT EFFECT ON CARDS
// ==============================================
function initTilt() {
    const items = document.querySelectorAll('.portfolio-item, .contact-card, .browser-mockup');

    items.forEach(card => {
        card.classList.add('tilt-card');

        const shine = document.createElement('div');
        shine.className = 'tilt-shine';
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            const shineX = (x / rect.width) * 100;
            const shineY = (y / rect.height) * 100;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: "power2.out",
                transformPerspective: 800,
            });

            shine.style.setProperty('--shine-x', shineX + '%');
            shine.style.setProperty('--shine-y', shineY + '%');
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)",
            });
        });
    });
}

initTilt();

// ==============================================
// 18. MOUSE-REACTIVE HERO PARTICLES
// ==============================================
(function upgradeParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    let heroMouseX = 0, heroMouseY = 0;

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        heroMouseX = e.clientX - rect.left;
        heroMouseY = e.clientY - rect.top;
    });

    const originalInit = window._particleUpdate;
    window._heroMouse = { get x() { return heroMouseX; }, get y() { return heroMouseY; } };
})();

// ==============================================
// 19. MARQUEE SPEED ON SCROLL
// ==============================================
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const velocity = Math.abs(window.scrollY - lastScroll);
        const speed = Math.max(25, 25 - velocity * 0.3);
        marqueeTrack.style.animationDuration = speed + 's';
        lastScroll = window.scrollY;
    });
}

// ==============================================
// 20. PARALLAX DEPTH ON ABOUT IMAGE
// ==============================================
const aboutImage = document.querySelector('.about-image');
if (aboutImage) {
    const aboutSection = document.querySelector('.section-sobre');
    aboutSection?.addEventListener('mousemove', (e) => {
        const rect = aboutSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(aboutImage, {
            x: x * 20,
            y: y * 20,
            rotateX: y * -8,
            rotateY: x * 8,
            duration: 0.6,
            ease: "power2.out",
        });
    });

    aboutSection?.addEventListener('mouseleave', () => {
        gsap.to(aboutImage, {
            x: 0, y: 0, rotateX: 0, rotateY: 0,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
        });
    });
}

// ==============================================
// 21. NUMBER COUNTER ANIMATION
// ==============================================
document.querySelectorAll('.neon-text .number').forEach(num => {
    const target = parseInt(num.textContent, 10);
    const original = num.textContent;

    ScrollTrigger.create({
        trigger: num.closest('.panel'),
        start: "top 80%",
        onEnter: () => {
            gsap.fromTo(num, { innerText: 0 }, {
                innerText: target,
                duration: 1.5,
                ease: "power2.out",
                snap: { innerText: 1 },
                onUpdate: function() {
                    num.textContent = String(Math.round(this.targets()[0].innerText)).padStart(2, '0');
                }
            });
        },
        once: true
    });
});
