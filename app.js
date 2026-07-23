// ==============================================
// ALEX ESTUDIO — MULTIMEDIA & CREATIVE DIRECTION
// Combined Application Logic
// ==============================================

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const dot = document.querySelector('.cursor-dot');
const progress = document.querySelector('.scroll-progress');
const parallaxItems = [...document.querySelectorAll('.parallax')];
const imageParallax = [...document.querySelectorAll('.image-parallax')];
const shiftedServices = [...document.querySelectorAll('.service[data-shift]')];
const contactOrbit = document.querySelector('.contact-orbit');
let ticking = false;

// --- Scroll & Parallax Scene ---
function updateScrollScene() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
        header.classList.toggle('scrolled', y > 24);
    }
    if (progress) {
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }

    // Parallax elements
    parallaxItems.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        const speed = Number(el.dataset.speed || 0);
        const offset = (rect.top - window.innerHeight * 0.5) * speed;
        el.style.setProperty('--parallax-y', `${offset}px`);
    });

    // Image Parallax
    imageParallax.forEach(img => {
        const box = img.parentElement.getBoundingClientRect();
        const center = (box.top + box.height / 2) - window.innerHeight / 2;
        img.style.setProperty('--image-y', `${center * -0.055}px`);
    });

    // Service Shift
    shiftedServices.forEach(item => {
        const rect = item.getBoundingClientRect();
        const visible = Math.max(-1, Math.min(1, (rect.top - window.innerHeight * 0.5) / window.innerHeight));
        item.style.setProperty('--shift-x', `${visible * Number(item.dataset.shift) * 42}px`);
    });

    // Contact Orbit Rotation
    if (contactOrbit) {
        const contactSection = document.querySelector('.contact');
        if (contactSection) {
            const rect = contactSection.getBoundingClientRect();
            contactOrbit.style.setProperty('--scroll-rotation', String((window.innerHeight - rect.top) * 0.025));
        }
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateScrollScene);
        ticking = true;
    }
}, { passive: true });

window.addEventListener('resize', updateScrollScene);
updateScrollScene();

// --- Mobile Navigation Menu ---
if (menu && nav) {
    menu.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            menu.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// --- Custom Cursor Dot ---
if (dot && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', e => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
    }, { passive: true });

    document.querySelectorAll('a, button, .project, .threed-card, .web-project-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.width = '34px';
            dot.style.height = '34px';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.width = '9px';
            dot.style.height = '9px';
        });
    });
}

// --- Reveal Observer ---
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- Split Text Effects ---
document.querySelectorAll('.split-text').forEach(title => {
    const nodes = [...title.childNodes];
    title.innerHTML = '';
    nodes.forEach(node => {
        if (node.nodeType === 3) {
            node.textContent.split(/(\s+)/).forEach(word => {
                if (!word.trim()) {
                    title.append(word);
                    return;
                }
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = word;
                title.append(span);
            });
        } else {
            title.append(node);
        }
    });
});

// --- Lazy Load IFrames ---
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
            loadProjectIframe(entry.target);
            iframeObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '120px', threshold: 0.01 });

iframePlaceholders.forEach(p => iframeObserver.observe(p));

// --- Local Video Lightbox Modal for 3D Projects ---
const videoModal = document.getElementById('videoModal');
const modalLocalVideo = document.getElementById('modalLocalVideo');
const modalClose = document.querySelector('.modal-close');

function openLocalVideo(videoSrc) {
    if (!videoModal || !modalLocalVideo) return;
    modalLocalVideo.src = videoSrc;
    modalLocalVideo.style.display = 'block';
    videoModal.classList.add('active');
    modalLocalVideo.play();
}

function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (modalLocalVideo) {
        modalLocalVideo.pause();
        modalLocalVideo.src = '';
    }
}

document.querySelectorAll('.video-trigger-local').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const videoSrc = trigger.dataset.localVideo;
        if (videoSrc) openLocalVideo(videoSrc);
    });
});

if (modalClose) {
    modalClose.addEventListener('click', closeVideoModal);
}

if (videoModal) {
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });
}

// --- Brief Contact Form Handler ---
const form = document.querySelector('#contactForm');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = new FormData(form);
        const subject = encodeURIComponent(`Nuevo Brief de Proyecto — ${data.get('service')}`);
        const body = encodeURIComponent(`Nombre: ${data.get('name')}\nEmail: ${data.get('email')}\nServicio: ${data.get('service')}\n\nMensaje:\n${data.get('message')}`);
        const status = form.querySelector('.form-status');
        if (status) status.textContent = 'Abriendo tu correo para enviar el brief…';
        window.location.href = `mailto:alexanher9@gmail.com?subject=${subject}&body=${body}`;
    });
}
