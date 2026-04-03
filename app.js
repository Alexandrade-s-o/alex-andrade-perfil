// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 1.5,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Pause scroll for preloader
lenis.stop();

// 2. Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// 3. Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Quick update for the main cursor dot
    gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1
    });
});

// Slower update for the follower circle
gsap.ticker.add(() => {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    gsap.set(follower, {
        x: cursorX,
        y: cursorY
    });
});

// Cursor hover effects on links
const links = document.querySelectorAll('a, .neon-text');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(follower, {
            scale: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'transparent',
            duration: 0.3
        });
    });
    link.addEventListener('mouseleave', () => {
        gsap.to(follower, {
            scale: 1,
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            duration: 0.3
        });
    });
});

// 4. Preloader & Intro Animation
const preloaderTl = gsap.timeline({
    onComplete: () => {
        lenis.start(); // Unlock scrolling
    }
});

// Flash lights
preloaderTl.to('.light-orb', {
    opacity: 0.15,
    duration: 1.5,
    stagger: 0.3,
    ease: "power2.out"
});

// Scale rings in
preloaderTl.from('.loader-rings', {
    scale: 0,
    opacity: 0,
    duration: 1,
    ease: "back.out(1.7)"
}, "-=1");

let progress = { val: 0 };
preloaderTl.to('.preloader-title', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
}, "-=0.5")
    .to(progress, {
        val: 100,
        duration: 7,
        ease: "power2.inOut",
        onUpdate: () => {
            document.getElementById('percent').innerText = Math.round(progress.val);
            document.querySelector('.progress-bar').style.width = progress.val + "%";
            document.querySelector('.progress-glow').style.width = progress.val + "%";

            let word = "ALEX ANDRADE";
            let phase = 0;
            if (progress.val > 20) { word = "DISEÑADOR"; phase = 1; }
            if (progress.val > 40) { word = "ANIMADOR"; phase = 2; }
            if (progress.val > 60) { word = "PROGRAMADOR"; phase = 3; }
            if (progress.val > 80) { word = "SOY DISEÑADOR MULTIMEDIA"; phase = 4; }

            const titleEl = document.querySelector('.preloader-title');
            if (!titleEl.dataset.phase) titleEl.dataset.phase = "0";

            if (titleEl.dataset.phase !== phase.toString()) {
                titleEl.dataset.phase = phase.toString();

                // Ultra plain crossfade; zero blur for readability
                gsap.to(titleEl, {
                    opacity: 0,
                    y: -5,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        titleEl.innerText = word;
                        gsap.fromTo(titleEl,
                            { y: 5, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
                        );

                        // Rings rotate gently
                        gsap.to('.loader-rings', {
                            rotation: "+=45",
                            duration: 1.5,
                            ease: "power2.inOut"
                        });
                    }
                });
            }
        }
    }, "-=0.5")
    // The Cinematic Explosion Out
    .to('.loader-rings', { scale: 8, opacity: 0, duration: 0.8, ease: "power4.in" })
    .to('.preloader-content', { scale: 1.5, opacity: 0, duration: 0.8, ease: "power4.in" }, "-=0.7")
    .to('.light-orb', { opacity: 1, scale: 2.5, duration: 0.6 }, "-=0.6")
    .to('#preloader', {
        autoAlpha: 0, // Smooth fade instead of slide
        duration: 1.5,
        ease: "power2.out"
    }, "+=0.1")
    .from('.hero h1', {
        scale: 0.8,
        opacity: 0,
        duration: 2.5,
        ease: "elastic.out(1, 0.3)"
    }, "-=1.2")
    .from('.hero .subtitle', {
        y: 30,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    }, "-=1.8");


// 5. Wow Text Prep
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

// 5.4 HUD Floating Design Symbols — fade in/out tied to scroll zones
document.querySelectorAll('#hud-floats .hf').forEach(el => {
    const posIn  = parseFloat(el.dataset.in)  || 0;
    const posOut = parseFloat(el.dataset.out) || 100;

    // Fade IN
    gsap.to(el, {
        opacity: 0.28,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: document.body,
            start: `${posIn}% top`,
            end:   `${posIn + 4}% top`,
            scrub: 0.8
        }
    });

    // Fade OUT slightly before the zone ends
    gsap.to(el, {
        opacity: 0,
        y: -8,
        duration: 0.5,
        ease: 'power2.in',
        scrollTrigger: {
            trigger: document.body,
            start: `${posOut - 3}% top`,
            end:   `${posOut + 2}% top`,
            scrub: 0.8
        }
    });

    // Start slightly offset for the drift effect
    gsap.set(el, { y: 10 });
});

// 5.5 Vertical Scroll Progress Rail
gsap.to('.scroll-progress-fill', {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
    }
});

// 6. Story Scrolling Animations
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
    const content = panel.querySelector('.portfolio-grid, .about-grid');
    const p = panel.querySelectorAll('p');
    const chars = title ? panel.querySelectorAll('.char') : [];

    // Initial state
    gsap.set([title, content, ...p], { y: 100, opacity: 0 });
    if (chars.length) gsap.set(chars, { opacity: 0, rotationX: -90, y: 50, transformOrigin: '50% 50% -50px' });

    ScrollTrigger.create({
        trigger: panel,
        start: "top 75%",
        onEnter: () => {
            gsap.to([title, ...p, content], {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out"
            });
            if (chars.length) {
                gsap.to(chars, {
                    opacity: 1,
                    rotationX: 0,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "back.out(2)",
                    delay: 0.2
                });
            }
        },
        onLeaveBack: () => {
            gsap.to([title, ...p, content], {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.in"
            });
            if (chars.length) {
                gsap.to(chars, {
                    opacity: 0,
                    rotationX: 90,
                    y: 30,
                    duration: 0.4,
                    stagger: 0.02,
                    ease: "power2.in"
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

// 7. Image Modal Logic
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const galleryItems = document.querySelectorAll('#grafico .portfolio-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            modalImg.src = img.src;
            modal.classList.add('active');
            lenis.stop(); // Pause smooth scrolling while viewing
        }
    });
});

modal.addEventListener('click', () => {
    modal.classList.remove('active');
    lenis.start(); // Resume scrolling when closed
});

// 8. YouTube Video Modal Logic
const vidModal = document.getElementById('videoModal');
const modalVideoIframe = document.getElementById('modalVideoIframe');
const videoTriggers = document.querySelectorAll('.video-trigger');

videoTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
        const vidId = btn.getAttribute('data-video-id');
        if (vidId) {
            modalVideoIframe.src = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0&showinfo=0`;
            vidModal.classList.add('active');
            lenis.stop(); // Pause smooth scrolling inside video player
        }
    });
});

vidModal.addEventListener('click', (e) => {
    // Cerrar si hace click afuera del frame de video
    if(e.target === vidModal) {
        vidModal.classList.remove('active');
        modalVideoIframe.src = ''; // Cortar la reproducción inmediatamente
        lenis.start();
    }
});
