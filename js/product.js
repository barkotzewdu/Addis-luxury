/* ========================================================================
   ADISS — PRODUCT EXPERIENCE ENGINE
   Powers the Heritage T-shirt page: size selection, add-to-collection,
   editorial lightbox, quiet accordions, sticky purchase bar, graceful
   image fallbacks. Vanilla JS, layered over js/main.js.
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const PRODUCT = {
        id: 'adiss-001-heritage-tee',
        title: 'ADISS / 001 — Heritage T-shirt',
        priceUSD: 160.66, // ≈ AED 590 at the house rate
        category: 'The House'
    };

    let selectedSize = 'M';
    let noteTimer = null;

    /* -------------------------------------------------------------------
       1. Graceful image fallbacks
       ------------------------------------------------------------------- */
    document.querySelectorAll('.pdp-figure img, .pdp-hero__media img').forEach(img => {
        const mark = () => {
            const host = img.closest('.pdp-figure, .pdp-hero__media');
            if (host) host.classList.add('is-fallback');
        };
        if (img.complete && img.naturalWidth === 0) mark();
        img.addEventListener('error', mark, { once: true });
    });

    /* -------------------------------------------------------------------
       2. Size selection — hero + sticky, kept in sync
       ------------------------------------------------------------------- */
    const sizeGroups = [
        document.querySelector('.pdp-size__options'),
        document.getElementById('pdp-sticky-size')
    ].filter(Boolean);

    function setSize(size) {
        selectedSize = size;
        sizeGroups.forEach(group => {
            group.querySelectorAll('[data-size]').forEach(btn => {
                btn.setAttribute('aria-checked', String(btn.getAttribute('data-size') === size));
            });
        });
    }

    sizeGroups.forEach(group => {
        group.addEventListener('click', event => {
            const btn = event.target.closest('[data-size]');
            if (btn) setSize(btn.getAttribute('data-size'));
        });

        // Arrow-key support for the radiogroup
        group.addEventListener('keydown', event => {
            if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            const buttons = Array.from(group.querySelectorAll('[data-size]'));
            const current = buttons.findIndex(b => b.getAttribute('aria-checked') === 'true');
            if (current === -1) return;
            event.preventDefault();
            const dir = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? 1 : -1;
            const next = (current + dir + buttons.length) % buttons.length;
            buttons[next].focus();
            setSize(buttons[next].getAttribute('data-size'));
        });
    });

    /* -------------------------------------------------------------------
       3. Add to Collection
       ------------------------------------------------------------------- */
    const addNote = document.getElementById('pdp-add-note');
    const heroImage = document.querySelector('.pdp-hero__media img');

    function flashNote(message) {
        if (!addNote) return;
        addNote.textContent = message;
        addNote.classList.add('is-visible');
        window.clearTimeout(noteTimer);
        noteTimer = window.setTimeout(() => addNote.classList.remove('is-visible'), 4200);
    }

    function addToCollection() {
        const item = {
            id: PRODUCT.id + '-' + selectedSize,
            title: PRODUCT.title,
            priceUSD: PRODUCT.priceUSD,
            size: selectedSize,
            image: heroImage ? (heroImage.currentSrc || heroImage.src) : 'images/hero-trench-coat.jpg',
            quantity: 1,
            category: PRODUCT.category
        };

        if (typeof window.addToBag === 'function') {
            window.addToBag(item);
            flashNote('Added to your collection — size ' + selectedSize + '.');
        } else {
            flashNote('Size ' + selectedSize + ' reserved. Complete your order at checkout.');
        }
    }

    const addBtn = document.getElementById('pdp-add');
    const stickyAddBtn = document.getElementById('pdp-sticky-add');
    if (addBtn) addBtn.addEventListener('click', addToCollection);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', addToCollection);

    /* -------------------------------------------------------------------
       4. Quiet accordions (one open at a time)
       ------------------------------------------------------------------- */
    const accordions = Array.from(document.querySelectorAll('.pdp-acc'));

    function closeAccordion(acc) {
        acc.classList.remove('open');
        const panel = acc.querySelector('.pdp-acc__panel');
        const header = acc.querySelector('.pdp-acc__header');
        if (panel) panel.style.maxHeight = '0px';
        if (header) header.setAttribute('aria-expanded', 'false');
    }

    accordions.forEach(acc => {
        const header = acc.querySelector('.pdp-acc__header');
        const panel = acc.querySelector('.pdp-acc__panel');
        if (!header || !panel) return;

        header.addEventListener('click', () => {
            const isOpen = acc.classList.contains('open');
            accordions.forEach(closeAccordion);
            if (!isOpen) {
                acc.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });

    window.addEventListener('resize', () => {
        const open = document.querySelector('.pdp-acc.open .pdp-acc__panel');
        if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });

    /* -------------------------------------------------------------------
       5. Sticky purchase bar
       ------------------------------------------------------------------- */
    const stickyBar = document.getElementById('pdp-sticky');
    const hero = document.querySelector('.pdp-hero');
    const finalSection = document.querySelector('.pdp-final');
    let heroPassed = false;
    let atEnd = false;

    function updateSticky() {
        if (!stickyBar) return;
        const show = heroPassed && !atEnd;
        stickyBar.classList.toggle('is-visible', show);
        stickyBar.setAttribute('aria-hidden', String(!show));
    }

    if (stickyBar && hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            heroPassed = !entries[0].isIntersecting;
            updateSticky();
        }, { rootMargin: '-15% 0px 0px 0px', threshold: 0 }).observe(hero);

        if (finalSection) {
            new IntersectionObserver(entries => {
                atEnd = entries[0].isIntersecting;
                updateSticky();
            }, { threshold: 0.2 }).observe(finalSection);
        }
    }

    /* -------------------------------------------------------------------
       6. Editorial lightbox
       ------------------------------------------------------------------- */
    const lightbox = document.getElementById('pdp-lightbox');
    const lightboxImg = document.getElementById('pdp-lightbox-img');
    const lightboxCaption = document.getElementById('pdp-lightbox-caption');
    const lightboxClose = document.getElementById('pdp-lightbox-close');
    let lastFocused = null;

    function openLightbox(figure) {
        const img = figure.querySelector('img');
        if (!lightbox || !img) return;

        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || '';
        lightboxCaption.textContent = figure.getAttribute('data-caption') || '';

        lastFocused = document.activeElement;
        lightbox.classList.add('is-open');
        document.body.classList.add('modal-open');
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    document.querySelectorAll('[data-lightbox]').forEach(figure => {
        figure.addEventListener('click', () => openLightbox(figure));
        figure.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(figure);
            }
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', event => {
            if (event.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });

    /* -------------------------------------------------------------------
       7. Initial state
       ------------------------------------------------------------------- */
    setSize(selectedSize);
});
