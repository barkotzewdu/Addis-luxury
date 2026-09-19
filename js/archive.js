/* ========================================================================
   THE ARCHIVE — blog.html only
   Calm, expensive motion: fade reveals, soft background parallax and a
   gentle "unrolling" cue for the manuscript. No bounce, no flash.
   ======================================================================== */
(function () {
    'use strict';

    var body = document.body;
    if (!body || !body.classList.contains('arc-page')) {
        return;
    }

    var reducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    /* ---- Scroll reveals ------------------------------------------------ */
    var revealEls = document.querySelectorAll('[data-arc-reveal]');

    if (!('IntersectionObserver' in window) || reducedMotion) {
        for (var i = 0; i < revealEls.length; i++) {
            revealEls[i].classList.add('is-revealed');
        }
    } else {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

        for (var j = 0; j < revealEls.length; j++) {
            revealObserver.observe(revealEls[j]);
        }
    }

    /* ---- Soft parallax on the atmosphere ------------------------------- */
    if (reducedMotion) {
        return;
    }

    var art = document.querySelector('.arc-bg__art');
    var mist = document.querySelector('.arc-bg__mist');
    var paper = document.querySelector('.arc-paper');
    if (!art && !mist && !paper) {
        return;
    }

    var ticking = false;

    function render() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (art) {
            var artShift = Math.min(y * 0.055, 150);
            art.style.transform = 'translate3d(0,' + artShift.toFixed(1) + 'px,0) scale(1.04)';
        }

        if (mist) {
            var mistShift = Math.min(y * 0.1, 240);
            mist.style.transform = 'translate3d(0,' + mistShift.toFixed(1) + 'px,0)';
        }

        if (paper) {
            var rect = paper.getBoundingClientRect();
            var progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            paper.style.setProperty('--arc-unroll', progress.toFixed(3));
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(render);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    render();
})();
