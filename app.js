// ==============================================
// 1. SCROLL SETUP (native + GSAP ScrollTrigger)
// ==============================================
gsap.registerPlugin(ScrollTrigger);

// Performance optimization
gsap.config({
    force3D: true,
    nullTargetWarn: false
});

ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: 50
});

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
const experienceGate = document.getElementById('experience-gate');
const experienceStart = document.getElementById('experience-start');
const experienceSkip = document.getElementById('experience-skip');

if (prefersReducedMotion) {
    finishIntro();
} else if (introVideo) {
    introVideo.setAttribute('playsinline', '');
    introVideo.muted = false;
    introVideo.volume = 1;

    introVideo.addEventListener('ended', finishIntro);
    introVideo.addEventListener('error', () => finishIntro());

    const startExperience = () => {
        introVideo.muted = false;
        introVideo.volume = 1;
        introVideo.currentTime = 0;
        if (experienceGate) {
            experienceGate.classList.add('is-hidden');
        }
        if (skipBtn) {
            skipBtn.classList.add('is-visible');
        }
        introVideo.play().catch(() => {});
    };

    if (experienceStart) {
        experienceStart.addEventListener('click', startExperience);
    }
    if (experienceSkip) {
        experienceSkip.addEventListener('click', finishIntro);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', finishIntro);
    }
} else {
    finishIntro();
}

// ==============================================
// 5. PARTICLE CANVAS (HERO) - ULTRA OPTIMIZADO
// ==============================================
function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    
    // Detectar si el dispositivo puede manejar animaciones complejas
    const isMobile = window.innerWidth < 768;
    const isLowPerf = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Desactivar partículas en móviles de bajo rendimiento
    if (isLowPerf && isMobile) {
        canvas.style.display = 'none';
        return;
    }
    
    const ctx = canvas.getContext('2d', { 
        alpha: true, 
        desynchronized: true,
        willReadFrequently: false 
    });
    let w, h, particles = [];
    let animationId;
    let isCanvasVisible = true;
    let lastTime = 0;
    const fps = isMobile ? 30 : 60; // Reducir FPS en móvil
    const interval = 1000 / fps;

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let heroMX = w / 2, heroMY = h / 2;
    let mouseUpdateThrottle = 0;
    
    canvas.parentElement.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - mouseUpdateThrottle < 50) return; // Throttle mouse movement
        mouseUpdateThrottle = now;
        
        const rect = canvas.getBoundingClientRect();
        heroMX = e.clientX - rect.left;
        heroMY = e.clientY - rect.top;
    }, { passive: true });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.baseVx = (Math.random() - 0.5) * 0.2;
            this.baseVy = (Math.random() - 0.5) * 0.2;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
            this.r = Math.random() * 1.2 + 0.4;
            this.alpha = Math.random() * 0.25 + 0.05;
        }
        update() {
            const dx = this.x - heroMX;
            const dy = this.y - heroMY;
            const distSq = dx * dx + dy * dy; // Evitar sqrt
            const repelRadiusSq = 22500; // 150^2

            if (distSq < repelRadiusSq && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const force = (150 - dist) / 150 * 0.6;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }

            this.vx += (this.baseVx - this.vx) * 0.03;
            this.vy += (this.baseVy - this.vy) * 0.03;

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

    // Muy pocas partículas
    const count = isMobile ? 15 : 35;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function animate(currentTime) {
        if (!isCanvasVisible || document.hidden) {
            animationId = null;
            return;
        }
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > interval) {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            lastTime = currentTime - (deltaTime % interval);
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Delay para no interferir con carga inicial
    setTimeout(() => {
        if (isCanvasVisible) animationId = requestAnimationFrame(animate);
    }, 1000);

    const canvasVisibilityObserver = new IntersectionObserver(entries => {
        isCanvasVisible = entries[0].isIntersecting;
        if (isCanvasVisible && !animationId && !document.hidden) {
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
        } else if (!isCanvasVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }, { threshold: 0.01 });
    canvasVisibilityObserver.observe(canvas);
    
    return () => {
        if (animationId) cancelAnimationFrame(animationId);
    };
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
// 9. SCROLL ANIMATIONS (WOW FACTOR) - SIMPLIFICADO
// ==============================================
const panels = gsap.utils.toArray('.panel');

panels.forEach((panel, i) => {
    if (i === 0) {
        // Hero - solo SVG paths, sin parallax pesado
        const paths = panel.querySelectorAll('.draw-path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: { 
                    trigger: panel, 
                    start: "top top", 
                    end: "bottom top", 
                    scrub: 2 // Más lento = menos cálculos
                }
            });
        });
        return;
    }

    const title = panel.querySelector('.neon-text');
    const content = panel.querySelector('.portfolio-grid, .about-grid, .ethnic-feature, .certs-feature, .contact-grid, .web-wheel');
    const paragraphs = panel.querySelectorAll('.section-content > p, .hint-text');

    const elements = [title, ...paragraphs, content].filter(Boolean);
    gsap.set(elements, { y: 60, opacity: 0 }); // Menos movimiento

    ScrollTrigger.create({
        trigger: panel,
        start: "top 75%", // Menos agresivo
        once: true, // Solo animar una vez
        onEnter: () => {
            gsap.to(elements, {
                y: 0, 
                opacity: 1, 
                duration: 0.8, // Más rápido
                stagger: 0.1, // Menos stagger
                ease: "power2.out"
            });
        }
    });
});

// Entrada de la rueda 3D de proyectos
const webWheelElement = document.querySelector('.web-wheel');
if (webWheelElement) {
    gsap.from(webWheelElement, {
        y: 40,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
            trigger: webWheelElement,
            start: "top 85%",
            once: true
        }
    });
}

// ==============================================
// 3D PROJECT WHEEL
// ==============================================
const webWheel = document.querySelector('.web-wheel');

if (webWheel) {
    const wheelTrack = webWheel.querySelector('.web-projects-grid');
    const wheelCards = Array.from(webWheel.querySelectorAll('.web-project-card'));
    const prevButton = webWheel.querySelector('.web-wheel-prev');
    const nextButton = webWheel.querySelector('.web-wheel-next');
    const currentLabel = webWheel.querySelector('.web-wheel-current');
    const totalLabel = webWheel.querySelector('.web-wheel-total');
    const dotsContainer = webWheel.querySelector('.web-wheel-dots');
    const angleStep = 360 / wheelCards.length;
    let activeIndex = 0;
    let rotation = 0;
    let radius = 620;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let isDragging = false;
    let wheelLocked = false;
    let wheelIsVisible = false;
    let dragFrame = 0;
    let pendingRotation = 0;
    let resizeFrame = 0;

    const normalizeIndex = index => (index % wheelCards.length + wheelCards.length) % wheelCards.length;

    wheelCards.forEach((card, index) => {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', `Proyecto ${index + 1} de ${wheelCards.length}`);
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'web-wheel-dot';
        dot.setAttribute('aria-label', `Ver proyecto ${index + 1}`);
        dot.addEventListener('click', () => goTo(index));
        dotsContainer.appendChild(dot);
    });

    const updateRadius = () => {
        radius = window.innerWidth <= 768
            ? Math.max(300, Math.min(390, window.innerWidth * 0.92))
            : Math.max(520, Math.min(720, window.innerWidth * 0.48));

        wheelCards.forEach((card, index) => {
            const cardTransform = `rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
            card.style.setProperty('--wheel-transform', cardTransform);
            card.style.transform = cardTransform;
        });
        updateWheelSelection();
    };

    const renderWheelTransform = () => {
        wheelTrack.style.transform = `translate3d(0, 0, ${-radius}px) rotateY(${rotation}deg)`;
    };

    const updateWheelSelection = () => {
        renderWheelTransform();
        activeIndex = normalizeIndex(Math.round(-rotation / angleStep));
        wheelCards.forEach((card, index) => {
            const isActive = index === activeIndex;
            card.classList.toggle('is-active', isActive);
            card.setAttribute('aria-hidden', String(!isActive));
            card.querySelectorAll('a, button').forEach(control => {
                control.tabIndex = isActive ? 0 : -1;
            });
            if (isActive && wheelIsVisible) loadProjectIframe(card.querySelector('.iframe-placeholder'));
        });
        Array.from(dotsContainer.children).forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeIndex);
            dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
        });
        currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
        totalLabel.textContent = String(wheelCards.length).padStart(2, '0');
    };

    function goTo(index) {
        activeIndex = normalizeIndex(index);
        rotation = -activeIndex * angleStep;
        updateWheelSelection();
    }

    prevButton.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton.addEventListener('click', () => goTo(activeIndex + 1));

    webWheel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
        if (event.key === 'ArrowRight') goTo(activeIndex + 1);
    });

    webWheel.addEventListener('wheel', event => {
        if (Math.abs(event.deltaY) < 8 || wheelLocked) return;
        event.preventDefault();
        wheelLocked = true;
        goTo(activeIndex + (event.deltaY > 0 ? 1 : -1));
        window.setTimeout(() => { wheelLocked = false; }, 650);
    }, { passive: false });

    webWheel.addEventListener('pointerdown', event => {
        if (event.target.closest('a, button, iframe')) return;
        isDragging = true;
        dragStartX = event.clientX;
        dragStartRotation = rotation;
        webWheel.classList.add('is-dragging');
        webWheel.setPointerCapture(event.pointerId);
    });

    webWheel.addEventListener('pointermove', event => {
        if (!isDragging) return;
        const latestEvent = event.getCoalescedEvents?.().at(-1) || event;
        pendingRotation = dragStartRotation + (latestEvent.clientX - dragStartX) * 0.28;
        if (dragFrame) return;
        dragFrame = requestAnimationFrame(() => {
            rotation = pendingRotation;
            renderWheelTransform();
            dragFrame = 0;
        });
    });

    const finishWheelDrag = event => {
        if (!isDragging) return;
        isDragging = false;
        if (dragFrame) {
            cancelAnimationFrame(dragFrame);
            dragFrame = 0;
            rotation = pendingRotation;
        }
        webWheel.classList.remove('is-dragging');
        if (webWheel.hasPointerCapture(event.pointerId)) webWheel.releasePointerCapture(event.pointerId);
        goTo(Math.round(-rotation / angleStep));
    };

    webWheel.addEventListener('pointerup', finishWheelDrag);
    webWheel.addEventListener('pointercancel', finishWheelDrag);
    const wheelVisibilityObserver = new IntersectionObserver(entries => {
        wheelIsVisible = entries[0].isIntersecting;
        if (wheelIsVisible) {
            loadProjectIframe(wheelCards[activeIndex].querySelector('.iframe-placeholder'));
        }
    }, { rootMargin: '180px', threshold: 0.01 });
    wheelVisibilityObserver.observe(webWheel);
    window.addEventListener('resize', () => {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => {
            updateRadius();
            resizeFrame = 0;
        });
    }, { passive: true });
    updateRadius();
}

// Simplificar gallery items
gsap.utils.toArray('.gallery-grid .portfolio-item').forEach((item, i) => {
    gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: item,
            start: "top 90%",
            once: true
        }
    });
});

// Contact cards - simplificado
gsap.utils.toArray('.contact-card').forEach((card, i) => {
    gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.05,
        ease: "power2.out",
        scrollTrigger: {
            trigger: card,
            start: "top 90%",
            once: true
        }
    });
});

// Footer - simplificado
gsap.from('.site-footer', {
    opacity: 0,
    duration: 0.6,
    scrollTrigger: {
        trigger: '.site-footer',
        start: "top 95%",
        once: true
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

let ticking = false;
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

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateActiveNav();
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick, { passive: true });
updateActiveNav();

// Navbar scroll effect - optimizado
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

function handleNavbarScroll() {
    const currentScroll = window.scrollY;
    if (Math.abs(currentScroll - lastScroll) > 5) { // Throttle
        navbar.classList.toggle('scrolled', currentScroll > 100);
        lastScroll = currentScroll;
    }
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            handleNavbarScroll();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// ==============================================
// 12. BACK TO TOP - OPTIMIZADO
// ==============================================
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    let backTicking = false;
    window.addEventListener('scroll', () => {
        if (!backTicking) {
            requestAnimationFrame(() => {
                backToTop.classList.toggle('visible', window.scrollY > window.innerHeight);
                backTicking = false;
            });
            backTicking = true;
        }
    }, { passive: true });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==============================================
// 13. IMAGE MODAL
// ==============================================
const graphicFilters = document.querySelectorAll('.graphic-filter');
const graphicProjects = document.querySelectorAll('#grafico .behance-project');

graphicFilters.forEach(filterButton => {
    filterButton.addEventListener('click', () => {
        const selectedCategory = filterButton.dataset.filter;
        graphicFilters.forEach(button => button.classList.toggle('is-active', button === filterButton));

        graphicProjects.forEach((project, index) => {
            const shouldShow = selectedCategory === 'all' || project.dataset.category === selectedCategory;
            project.classList.toggle('is-filtered-out', !shouldShow);
            if (shouldShow) {
                project.animate([
                    { opacity: 0, transform: 'translateY(18px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 420,
                    delay: index * 35,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                });
            }
        });
    });
});

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
// 16. LAZY LOAD IFRAMES (IntersectionObserver) - OPTIMIZADO
// ==============================================
const iframePlaceholders = document.querySelectorAll('.iframe-placeholder');

function loadProjectIframe(placeholder) {
    if (!placeholder || placeholder.dataset.loading === 'true') return;
    const src = placeholder.dataset.src;
    if (!src) return;
    placeholder.dataset.loading = 'true';

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = placeholder.closest('.web-project-card')?.querySelector('h3')?.textContent || 'Proyecto web';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('importance', 'low');
    iframe.style.pointerEvents = 'none';

    const card = placeholder.closest('.web-project-card');
    if (card) {
        card.addEventListener('mouseenter', () => { iframe.style.pointerEvents = 'auto'; }, { passive: true });
        card.addEventListener('mouseleave', () => { iframe.style.pointerEvents = 'none'; }, { passive: true });
    }

    placeholder.parentNode?.replaceChild(iframe, placeholder);
}

const iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const placeholder = entry.target;
            const wheelCard = placeholder.closest('.web-wheel .web-project-card');
            if (wheelCard && !wheelCard.classList.contains('is-active')) return;
            loadProjectIframe(placeholder);
            iframeObserver.unobserve(entry.target);
        }
    });
}, { 
    rootMargin: '100px', // Reducido de 200px
    threshold: 0.01
});

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
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    const items = document.querySelectorAll('.contact-card, .browser-mockup');

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
// ==============================================
// LANGUAGE TOGGLE (ES/EN)
// ==============================================
const translations = {
    es: {
        // Nav
        sobre: "Sobre Mí",
        web: "Diseño Web",
        grafico: "Diseño Gráfico",
        motion: "Motion",
        socio: "Étnica",
        certs: "Certificados",
        contacto: "Contacto",
        // Hero
        heroTag: "Diseñador Multimedia • Animador • Desarrollador Web",
        heroSubtitle: "Creando experiencias visuales que trascienden",
        scrollText: "Scroll para descubrir",
        // Sections
        aboutTitle: "Sobre Mí",
        aboutText1: "Soy un diseñador y director creativo apasionado por la creación de soluciones estructuradas que impactan visualmente y además generan un cambio funcional positivo.",
        aboutText2: "Mi enfoque abarca desde experiencias web minimalistas y gráficos de alto contraste, hasta narrativas en movimiento y compromisos socio-ambientales. Conecto los puntos entre la estética profunda y el diseño centrado en el usuario.",
        skillsTitle: "Habilidades",
        webTitle: "Diseño Web",
        webText: "Interfaces modernas y funcionales que combinan estética y experiencia de usuario.",
        webHint: "Haz clic en \"Ver Sitio\" para explorar cada proyecto en vivo",
        graficoTitle: "Diseño Gráfico",
        graficoText: "Comunicación visual de alto impacto donde convergen ideas innovadoras.",
        graficoHint: "Clic en cualquier diseño para verlo en pantalla completa",
        motionTitle: "Motion Graphics",
        motionText: "Dando vida a las ideas a través del movimiento y dinámico storytelling.",
        motionHint: "Clic en las miniaturas para reproducir directamente en HD",
        socioTitle: "Exp. Étnica Socio-ambiental",
        socioText: "Diseño con propósito y consciencia ecológica, honrando identidades, raíces y comunidades.",
        certsTitle: "Certificados",
        certsText: "Experiencia laboral respaldada por organizaciones y equipos de alto impacto.",
        contactoTitle: "Contacto",
        contactoText: "¿Tienes un proyecto en mente? Hablemos y hagamos algo increíble juntos.",
        // Buttons
        verProyecto: "Ver proyecto",
        verSitio: "Ver Sitio",
        verCodigo: "Ver Código",
        skipIntro: "Saltar intro",
        // Footer
        footerTagline: "Diseño con propósito. Código con pasión.",
        footerCopy: "© 2026 Alex Andrade. Todos los derechos reservados."
    },
    en: {
        // Nav
        sobre: "About Me",
        web: "Web Design",
        grafico: "Graphic",
        motion: "Motion",
        socio: "Ethnic",
        certs: "Certificates",
        contacto: "Contact",
        // Hero
        heroTag: "Multimedia Designer • Animator • Web Developer",
        heroSubtitle: "Creating visual experiences that transcend",
        scrollText: "Scroll to discover",
        // Sections
        aboutTitle: "About Me",
        aboutText1: "I'm a passionate creative designer focused on building structured solutions that make visual impact while generating positive functional change.",
        aboutText2: "My approach spans from minimalist web experiences and high-contrast graphics to motion narratives and socio-environmental commitments. I connect the dots between deep aesthetics and user-centered design.",
        skillsTitle: "Skills",
        webTitle: "Web Design",
        webText: "Modern and functional interfaces that combine aesthetics and user experience.",
        webHint: "Click \"View Site\" to explore each project live",
        graficoTitle: "Graphic Design",
        graficoText: "High-impact visual communication where innovative ideas converge.",
        graficoHint: "Click on any design to view it in full screen",
        motionTitle: "Motion Graphics",
        motionText: "Bringing ideas to life through movement and dynamic storytelling.",
        motionHint: "Click on thumbnails to play directly in HD",
        socioTitle: "Socio-environmental Ethnic Exp.",
        socioText: "Design with purpose and ecological awareness, honoring identities, roots, and communities.",
        certsTitle: "Certificates",
        certsText: "Work experience backed by high-impact organizations and teams.",
        contactoTitle: "Contact",
        contactoText: "Do you have a project in mind? Let's talk and create something amazing together.",
        // Buttons
        verProyecto: "View project",
        verSitio: "View Site",
        verCodigo: "View Code",
        skipIntro: "Skip intro",
        // Footer
        footerTagline: "Design with purpose. Code with passion.",
        footerCopy: "© 2026 Alex Andrade. All rights reserved."
    }
};

let currentLang = 'es';

function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Update nav links
    document.querySelectorAll('.nav-links a[data-es]').forEach(link => {
        link.textContent = t[link.dataset.section];
    });
    
    // Update mobile nav links
    document.querySelectorAll('.mobile-nav-links a[data-es]').forEach(link => {
        link.textContent = t[link.dataset.section] || link.dataset.en;
    });
    
    // Update hero
    const heroTag = document.querySelector('.hero-tag');
    if (heroTag) heroTag.textContent = t.heroTag;
    
    const heroSubtitle = document.querySelector('.hero .subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    
    const scrollText = document.querySelector('.scroll-indicator span');
    if (scrollText) scrollText.textContent = t.scrollText;
    
    // Update section titles
    document.querySelectorAll('.neon-text').forEach(title => {
        const text = title.textContent.replace(/\d+$/, '').trim();
        if (title.closest('.section-sobre')) {
            title.innerHTML = t.aboutTitle + ' <span class="number">00</span>';
        } else if (title.closest('.section-web')) {
            title.innerHTML = t.webTitle + ' <span class="number">01</span>';
        } else if (title.closest('.section-grafico')) {
            title.innerHTML = t.graficoTitle + ' <span class="number">02</span>';
        } else if (title.closest('.section-motion')) {
            title.innerHTML = t.motionTitle + ' <span class="number">03</span>';
        } else if (title.closest('.section-socio')) {
            title.innerHTML = t.socioTitle + ' <span class="number">04</span>';
        } else if (title.closest('.section-certs')) {
            title.innerHTML = t.certsTitle + ' <span class="number">05</span>';
        } else if (title.closest('.section-contacto')) {
            title.innerHTML = t.contactoTitle + ' <span class="number">06</span>';
        }
    });
    
    // Update section texts
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        const p = panel.querySelector('.section-content > p');
        if (p && panel.id === 'sobre') {
            const nextP = p.nextElementSibling;
            if (p) p.textContent = t.aboutText1;
            if (nextP && nextP.tagName === 'P') nextP.textContent = t.aboutText2;
            
            // Update skills
            document.querySelectorAll('.skill-chip').forEach(chip => {
                chip.textContent = chip.dataset[lang];
            });
        } else if (p && panel.id === 'web') {
            p.textContent = t.webText;
            const hint = panel.querySelector('.hint-text');
            if (hint) hint.textContent = t.webHint;
        } else if (p && panel.id === 'grafico') {
            p.textContent = t.graficoText;
            const hint = panel.querySelector('.hint-text');
            if (hint) hint.textContent = t.graficoHint;
        } else if (p && panel.id === 'motion') {
            p.textContent = t.motionText;
            const hint = panel.querySelector('.hint-text');
            if (hint) hint.textContent = t.motionHint;
        } else if (p && panel.id === 'socio') {
            p.textContent = t.socioText;
        } else if (p && panel.id === 'certs') {
            p.textContent = t.certsText;
        } else if (p && panel.id === 'contacto') {
            p.textContent = t.contactoText;
        }
    });
    
    // Update footer
    const footerTagline = document.querySelector('.footer-tagline');
    if (footerTagline) footerTagline.textContent = t.footerTagline;
    
    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy) footerCopy.textContent = t.footerCopy;
    
    // Update buttons
    document.querySelectorAll('.img-overlay span').forEach(span => {
        if (span.textContent.includes('Ver')) {
            span.textContent = t.verProyecto;
        }
    });
    
    document.querySelectorAll('.cyber-btn').forEach(btn => {
        if (btn.textContent.includes('Ver Sitio')) {
            btn.textContent = t.verSitio;
        }
    });
    
    // Update lang toggle buttons
    document.querySelectorAll('.lang-toggle .lang-current').forEach(span => {
        span.textContent = lang.toUpperCase();
    });
    document.querySelectorAll('.lang-toggle .lang-other').forEach(span => {
        span.textContent = lang === 'es' ? 'EN' : 'ES';
    });
    
    // Update skip button
    const skipBtn = document.getElementById('preloader-skip');
    if (skipBtn) skipBtn.textContent = t.skipIntro;
    
    // Save preference
    localStorage.setItem('portfolio-lang', lang);
}

// Language toggle event
const langToggle = document.getElementById('langToggle');
const langToggleMobile = document.getElementById('langToggleMobile');

function toggleLanguage() {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    updateLanguage(newLang);
}

if (langToggle) {
    langToggle.addEventListener('click', toggleLanguage);
}
if (langToggleMobile) {
    langToggleMobile.addEventListener('click', toggleLanguage);
}

// Load saved language preference
const savedLang = localStorage.getItem('portfolio-lang');
if (savedLang) {
    updateLanguage(savedLang);
}
