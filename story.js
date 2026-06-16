// =====================================================================
// STORY SCROLLING — coreografía (corre después de gsap + ScrollTrigger).
// Robusto: usa gsap.from (estado natural = visible), así que si algo
// fallara, el contenido sigue a la vista.
// =====================================================================
(function () {
    if (!window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    // 1) Reveal de cada escena de título de capítulo
    gsap.utils.toArray('.chapter-intro').forEach(function (intro) {
        var els = intro.querySelectorAll('.ci-num, .ci-title, .ci-line, .ci-cue');
        gsap.from(els, {
            y: 70, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: intro, start: 'top 72%', toggleActions: 'play none none reverse' }
        });
        var ghost = intro.querySelector('.ci-ghost');
        if (ghost) {
            gsap.to(ghost, {
                yPercent: 16, ease: 'none',
                scrollTrigger: { trigger: intro, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        }
    });

    // 2) Riel de capítulos: resaltar el capítulo activo (intro + sección)
    var rail = document.querySelector('.chapter-rail');
    if (rail) {
        var links = Array.from(rail.querySelectorAll('a'));
        var setActive = function (active) {
            links.forEach(function (l) { l.classList.toggle('active', l === active); });
        };
        links.forEach(function (link) {
            var id = (link.getAttribute('href') || '').slice(1);
            var section = document.getElementById(id);
            if (!section) return;
            var intro = document.querySelector('.chapter-intro[data-chapter="' + id + '"]');
            ScrollTrigger.create({
                trigger: intro || section,
                start: 'top center',
                endTrigger: section,
                end: 'bottom center',
                onToggle: function (self) { if (self.isActive) setActive(link); }
            });
        });
    }

    // 3) Recalcular posiciones cuando la consola DEV BOY (iframe) cambie de alto
    window.addEventListener('load', function () {
        setTimeout(function () { ScrollTrigger.refresh(); }, 400);
    });
})();
