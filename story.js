// =====================================================================
// STORY SCROLLING — coreografía (corre después de gsap + ScrollTrigger).
// Robusto: usa gsap.from (estado natural = visible), así que si algo
// fallara, el contenido sigue a la vista.
// =====================================================================
(function () {
    if (!window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    // 1) Cada escena de capítulo se PINEA (queda fija) mientras su título
    //    se ensambla y luego se desvanece con el scroll (scrollytelling).
    gsap.utils.toArray('.chapter-intro').forEach(function (intro) {
        var num = intro.querySelector('.ci-num');
        var title = intro.querySelector('.ci-title');
        var line = intro.querySelector('.ci-line');
        var cue = intro.querySelector('.ci-cue');
        var ghost = intro.querySelector('.ci-ghost');

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: intro,
                start: 'top top',
                end: '+=90%',
                pin: true,
                pinSpacing: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // entra (ensamblado del título, scrubeado por el scroll)
        tl.from(num,   { yPercent: 45, autoAlpha: 0, ease: 'none' }, 0)
          .from(title, { yPercent: 70, autoAlpha: 0, ease: 'none' }, 0.06)
          .from(line,  { yPercent: 90, autoAlpha: 0, ease: 'none' }, 0.12);
        if (cue) tl.from(cue, { autoAlpha: 0, ease: 'none' }, 0.18);
        if (ghost) tl.fromTo(ghost, { yPercent: 10 }, { yPercent: -10, ease: 'none' }, 0);

        // sale (deriva + fade) en el último tramo del pin
        tl.to([num, title, line], { autoAlpha: 0, yPercent: -26, ease: 'none' }, 0.66);
        if (cue) tl.to(cue, { autoAlpha: 0, ease: 'none' }, 0.6);
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
