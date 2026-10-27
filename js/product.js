/* ========================================================================
   ADISS - PRODUCT EXPERIENCE ENGINE
   Powers product-detail.html for every piece in the Shop. Product data is
   selected from the ?id= query string, then the editorial page is hydrated
   in place. Vanilla JS, layered over js/main.js.
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const PRODUCTS = {
        'heritage-t-shirt': {
            index: 'ADISS / 001',
            title: 'Heritage T-shirt',
            priceUSD: 160.66,
            category: 'The House',
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&h=1900&q=80',
            alt: 'Model wearing the ADISS Heritage T-shirt in aged ivory, photographed in warm directional light',
            desc: 'An archive-weight cotton tee in aged ivory, opened by hand along its seams and edges, then closed with a single chain and leather clasp at the right chest.',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            materials: [
                '<strong>Body</strong> &nbsp;100% long-staple cotton, aged ivory',
                '<strong>Hardware</strong> &nbsp;Fine brushed metal chain',
                '<strong>Trim</strong> &nbsp;Vegetable-tanned leather, hand-stitched',
                '<strong>Finish</strong> &nbsp;Hand-opened, torn and heat-sealed edges',
                '<strong>Origin</strong> &nbsp;Designed in the Gulf, woven and finished with Ethiopian hand-loomed cotton'
            ],
            care: [
                'Wash by hand, or dry clean, in cold water.',
                'Do not bleach. Do not tumble dry.',
                'Dry flat, away from direct heat and sunlight.',
                'Iron on low, avoiding the chain and leather.',
                'The colour is intended to age; slight variation is part of the piece.'
            ],
            ideaTitle: 'Heritage, carried forward &mdash; <em>not preserved in glass.</em>',
            idea: [
                'This garment began with a question about inheritance: what do we carry, and what are we willing to let change? Its material is traditional. Its construction is deliberately not.',
                'The openings are not damage. They are the point at which the past is allowed in. A piece that keeps everything intact keeps everything at a distance; this one is made to be worn, altered by the body, and lived in.',
                'It should read as though it carries a history &mdash; and remain, entirely, of this moment.'
            ]
        },
        'empress-kemis-gown': {
            index: 'ADISS / 001',
            title: 'The Empress Kemis Evening Gown',
            priceUSD: 2850,
            category: "Women's Couture",
            image: 'images/product-garment-01.jpg',
            alt: 'The Empress Kemis Evening Gown in warm ivory',
            desc: 'A floor-length evening gown in warm ivory, shaped with a considered bodice and a long, quiet line. Cut for presence rather than spectacle.',
            sizes: ['XS', 'S', 'M', 'L'],
            materials: [
                '<strong>Body</strong> &nbsp;Silk blend, warm ivory',
                '<strong>Structure</strong> &nbsp;Sculpted bodice with internal support',
                '<strong>Finish</strong> &nbsp;Hand-finished seams and hem',
                '<strong>Origin</strong> &nbsp;Designed in the Gulf, finished with Ethiopian handwoven textile'
            ],
            care: [
                'Dry clean only, by a specialist in delicate silks.',
                'Store on a padded hanger, away from direct sunlight.',
                'Do not press directly over the seam allowance.',
                'Slight variation in the weave is part of the piece.'
            ],
            ideaTitle: 'A silhouette that holds its poise &mdash; <em>without asking for attention.</em>',
            idea: [
                'The gown is built around a single idea: that evening dressing should feel like an extension of the person, not a departure from them.',
                'The bodice is shaped with restraint, the line released through the skirt. Nothing is added that does not serve the whole.',
                'It is intended to be worn, kept, and returned to &mdash; a piece that becomes more personal with time.'
            ]
        },
        'arabian-nights-tuxedo': {
            index: 'ADISS / 002',
            title: 'Arabian Nights Bespoke Tuxedo',
            priceUSD: 3400,
            category: "Men's Tailoring",
            image: 'images/product-garment-02.jpg',
            alt: 'Arabian Nights Bespoke Tuxedo in midnight navy wool',
            desc: 'A midnight tuxedo with a clean lapel, a defined shoulder and a long, composed line. Tailored to be understood slowly.',
            sizes: ['38R', '40R', '42R', '44R'],
            materials: [
                '<strong>Body</strong> &nbsp;Italian wool, midnight navy',
                '<strong>Lapel</strong> &nbsp;Silk-faced peak lapel',
                '<strong>Construction</strong> &nbsp;Half-canvassed, hand-finished',
                '<strong>Origin</strong> &nbsp;Designed in the Gulf, tailored with Ethiopian hand-finished detail'
            ],
            care: [
                'Dry clean sparingly, by a specialist in tailored wool.',
                'Brush after wearing and rest on a broad hanger.',
                'Steam gently to release creases.',
                'Store in the supplied garment bag, away from damp.'
            ],
            ideaTitle: 'Tailoring, reduced to <em>what matters.</em>',
            idea: [
                'A tuxedo is a study in proportion. The shoulder, the lapel and the break of the trouser must agree before anything else is considered.',
                'This piece keeps its language quiet: a midnight cloth, a silk face, and a line that follows the body without gripping it.',
                'It is made for the moments that ask for composure, and for the years of wear that follow them.'
            ]
        },
        'highland-weave-cape': {
            index: 'ADISS / 003',
            title: 'Highland Weave Silk Cape',
            priceUSD: 1650,
            category: 'Ethiopian Craft Line',
            image: 'images/product-garment-03.jpg',
            alt: 'Highland Weave Silk Cape in natural ivory',
            desc: 'A cape in handwoven silk, cut to fall with a soft, sculptural drape. A quiet layer with a deep sense of place.',
            sizes: ['One Size'],
            materials: [
                '<strong>Body</strong> &nbsp;Handwoven silk, natural ivory',
                '<strong>Finish</strong> &nbsp;Hand-finished edges',
                '<strong>Craft</strong> &nbsp;Ethiopian handweaving tradition',
                '<strong>Origin</strong> &nbsp;Woven and finished in Ethiopia'
            ],
            care: [
                'Dry clean only, by a specialist in delicate silks.',
                'Store folded in tissue, away from direct sunlight.',
                'Do not hang for long periods; the weave prefers to rest flat.',
                'Small irregularities are the signature of the handloom.'
            ],
            ideaTitle: 'Cloth with a memory <em>of the hand that made it.</em>',
            idea: [
                'The cape begins with the loom. Its surface carries the small irregularities that machine weaving removes, and that give the cloth its character.',
                'The cut is deliberately simple, so the textile can speak. It falls from the shoulder in one considered line.',
                'It is a layer for transitions &mdash; for the cool of an evening, and for the quiet pleasure of wearing something made slowly.'
            ]
        },
        'desert-bloom-gown': {
            index: 'ADISS / 004',
            title: 'Desert Bloom Silk Gown',
            priceUSD: 3100,
            category: 'UAE Limited Edition',
            image: 'images/product-garment-04.jpg',
            alt: 'Desert Bloom Silk Gown in pale sand silk',
            desc: 'A floor-length silk gown in a pale desert tone, with a fluid line and a restrained, luminous surface.',
            sizes: ['XS', 'S', 'M', 'L'],
            materials: [
                '<strong>Body</strong> &nbsp;Silk, pale desert tone',
                '<strong>Finish</strong> &nbsp;Hand-finished seams and hem',
                '<strong>Edition</strong> &nbsp;UAE Limited Edition',
                '<strong>Origin</strong> &nbsp;Designed in the Gulf, finished with Ethiopian handwoven detail'
            ],
            care: [
                'Dry clean only, by a specialist in delicate silks.',
                'Store on a padded hanger, away from direct sunlight.',
                'Do not press directly over the seam allowance.',
                'The colour shifts gently with light; this is intended.'
            ],
            ideaTitle: 'Light, held in <em>a single length of silk.</em>',
            idea: [
                'The gown is an exercise in light. The cloth is kept pale so that it catches the room rather than competing with it.',
                'Its line is fluid and uninterrupted, with the smallest possible interruption at the waist.',
                'Made in limited number for the UAE, it is intended for evenings that ask for calm rather than display.'
            ]
        },
        'diplomat-executive-suit': {
            index: 'ADISS / 005',
            title: 'The Diplomat Executive Suit',
            priceUSD: 2450,
            category: "Men's Tailoring",
            image: 'images/product-garment-02.jpg',
            alt: 'The Diplomat Executive Suit in charcoal wool',
            desc: 'A single-breasted suit in deep charcoal, with a clean shoulder, a quiet lapel and a line built for long days.',
            sizes: ['38R', '40R', '42R', '44R'],
            materials: [
                '<strong>Body</strong> &nbsp;Wool, deep charcoal',
                '<strong>Construction</strong> &nbsp;Half-canvassed, hand-finished',
                '<strong>Lapel</strong> &nbsp;Notch lapel, self-faced',
                '<strong>Origin</strong> &nbsp;Designed in the Gulf, tailored with Ethiopian hand-finished detail'
            ],
            care: [
                'Dry clean sparingly, by a specialist in tailored wool.',
                'Brush after wearing and rest on a broad hanger.',
                'Steam gently to release creases.',
                'Store in the supplied garment bag, away from damp.'
            ],
            ideaTitle: 'A suit for the long view &mdash; <em>not the loud moment.</em>',
            idea: [
                'The Diplomat is built for the working day: a suit that holds its line from morning to evening without asking to be noticed.',
                'The shoulder is clean, the lapel quiet, the cloth chosen for its ability to recover. Nothing is decorative.',
                'It is an investment in repetition &mdash; the piece you reach for when the day matters.'
            ]
        },
        'habesha-heritage-scarf': {
            index: 'ADISS / 006',
            title: 'Habesha Heritage Silk Scarf',
            priceUSD: 320,
            category: 'Silk Accessories',
            image: 'images/product-garment-03.jpg',
            alt: 'Habesha Heritage Silk Scarf in natural ivory',
            desc: 'A silk scarf in natural ivory, finished with a quiet woven edge. A small piece with a long memory.',
            sizes: ['One Size'],
            materials: [
                '<strong>Body</strong> &nbsp;Silk, natural ivory',
                '<strong>Finish</strong> &nbsp;Hand-rolled edge',
                '<strong>Craft</strong> &nbsp;Ethiopian handweaving tradition',
                '<strong>Origin</strong> &nbsp;Woven and finished in Ethiopia'
            ],
            care: [
                'Dry clean only, or hand wash in cold water with silk detergent.',
                'Do not wring. Roll in a towel to remove excess water.',
                'Dry flat, away from direct heat and sunlight.',
                'Iron on low, through a pressing cloth.'
            ],
            ideaTitle: 'A small gesture, <em>carried with meaning.</em>',
            idea: [
                'The scarf is the smallest piece in the collection, and the most personal. It sits close to the body and travels with it.',
                'Its surface is left quiet so that the weave can be read at close range &mdash; a private detail rather than a public one.',
                'It is intended to be worn often, folded differently, and made your own.'
            ]
        }
    };

    const params = new URLSearchParams(window.location.search);
    const requested = (params.get('id') || '').toLowerCase();
    const isCatalogProduct = Boolean(PRODUCTS[requested] && requested !== 'heritage-t-shirt');
    const PRODUCT = PRODUCTS[requested] || PRODUCTS['heritage-t-shirt'];

    let selectedSize = PRODUCT.sizes.indexOf('M') !== -1 ? 'M' : PRODUCT.sizes[0];
    let noteTimer = null;

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatUSD(value) {
        return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    /* -------------------------------------------------------------------
       1. Hydrate the product page from the selected piece
       ------------------------------------------------------------------- */
    function hydrate() {
        const heroImage = $('.pdp-hero__media img');
        if (heroImage) {
            heroImage.src = PRODUCT.image;
            heroImage.alt = PRODUCT.alt;
        }

        if (isCatalogProduct) {
            document.querySelectorAll('.pdp-campaign, .pdp-construction, .pdp-craft, .pdp-heritage').forEach(section => section.remove());

            const ideaImage = $('.pdp-idea__media img');
            if (ideaImage) {
                ideaImage.src = PRODUCT.image;
                ideaImage.alt = PRODUCT.alt;
            }
        }

        const indexEl = $('.pdp-hero__index');
        if (indexEl) indexEl.textContent = PRODUCT.index;

        const titleEl = $('#pdp-title');
        if (titleEl) titleEl.textContent = PRODUCT.title;

        const priceEl = $('.pdp-hero__price');
        if (priceEl) {
            priceEl.textContent = formatUSD(PRODUCT.priceUSD);
            priceEl.setAttribute('data-price-usd', String(PRODUCT.priceUSD));
        }

        const descEl = $('.pdp-hero__desc');
        if (descEl) descEl.textContent = PRODUCT.desc;

        const stickyName = $('.pdp-sticky__name');
        if (stickyName) stickyName.textContent = PRODUCT.title;

        const stickyPrice = $('.pdp-sticky__price');
        if (stickyPrice) {
            stickyPrice.textContent = formatUSD(PRODUCT.priceUSD);
            stickyPrice.setAttribute('data-price-usd', String(PRODUCT.priceUSD));
        }

        const ideaTitle = $('.pdp-idea__text .pdp-display');
        if (ideaTitle) ideaTitle.innerHTML = PRODUCT.ideaTitle;

        const ideaBody = $('.pdp-idea__body');
        if (ideaBody) {
            ideaBody.innerHTML = PRODUCT.idea.map(paragraph => '<p>' + paragraph + '</p>').join('');
        }

        const materials = $('#acc-materials ul');
        if (materials) {
            materials.innerHTML = PRODUCT.materials.map(item => '<li>' + item + '</li>').join('');
        }

        const care = $('#acc-care ul');
        if (care) {
            care.innerHTML = PRODUCT.care.map(item => '<li>' + item + '</li>').join('');
        }

        renderSizes();
        renderRelated();

        document.title = PRODUCT.title + ' | ADISS';

        const description = PRODUCT.desc;
        [['name="description"', description],
         ['property="og:title"', PRODUCT.title + ' | ADISS'],
         ['property="og:description"', description],
         ['name="twitter:title"', PRODUCT.title + ' | ADISS'],
         ['name="twitter:description"', description]].forEach(([selector, value]) => {
            const el = document.querySelector('meta[' + selector + ']');
            if (el) el.setAttribute('content', value);
        });

        if (window.ADISS && window.ADISS.currency) window.ADISS.currency.apply();
    }

    /* -------------------------------------------------------------------
       2. Sizes - hero + sticky, kept in sync
       ------------------------------------------------------------------- */
    function renderSizes() {
        const groups = [$('.pdp-size__options'), document.getElementById('pdp-sticky-size')].filter(Boolean);

        groups.forEach(group => {
            const isSticky = group.id === 'pdp-sticky-size';
            group.innerHTML = (isSticky ? '<span>Size</span>' : '') + PRODUCT.sizes.map(size => {
                const checked = size === selectedSize;
                return '<button type="button" role="radio" aria-checked="' + checked + '" data-size="' + escapeHtml(size) + '">' + escapeHtml(size) + '</button>';
            }).join('');
        });
    }

    function setSize(size) {
        selectedSize = size;
        [$('.pdp-size__options'), document.getElementById('pdp-sticky-size')].filter(Boolean).forEach(group => {
            group.querySelectorAll('[data-size]').forEach(btn => {
                btn.setAttribute('aria-checked', String(btn.getAttribute('data-size') === size));
            });
        });
    }

    function bindSizes() {
        [$('.pdp-size__options'), document.getElementById('pdp-sticky-size')].filter(Boolean).forEach(group => {
            group.addEventListener('click', event => {
                const btn = event.target.closest('[data-size]');
                if (btn) setSize(btn.getAttribute('data-size'));
            });

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
    }

    /* -------------------------------------------------------------------
       3. Related pieces - every card opens its own product
       ------------------------------------------------------------------- */
    function renderRelated() {
        const grid = $('.pdp-related__grid');
        if (!grid) return;

        const keys = Object.keys(PRODUCTS).filter(key => key !== requested && key !== 'heritage-t-shirt').slice(0, 3);
        grid.innerHTML = keys.map(key => {
            const item = PRODUCTS[key];
            return [
                '<a class="pdp-related__item fade-in" href="product-detail.html?id=' + encodeURIComponent(key) + '" aria-label="' + escapeHtml(item.index + ' - ' + item.title) + '">',
                '<div class="pdp-figure pdp-figure--portrait pdp-figure--hover">',
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy" decoding="async">',
                '</div>',
                '<span class="pdp-related__idx">' + escapeHtml(item.index) + '</span>',
                '<h3 class="pdp-related__name">' + escapeHtml(item.title) + '</h3>',
                '<span class="pdp-related__price" data-price-usd="' + item.priceUSD + '">' + formatUSD(item.priceUSD) + '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    /* -------------------------------------------------------------------
       4. Add to Collection
       ------------------------------------------------------------------- */
    const addNote = document.getElementById('pdp-add-note');

    function flashNote(message) {
        if (!addNote) return;
        addNote.textContent = message;
        addNote.classList.add('is-visible');
        window.clearTimeout(noteTimer);
        noteTimer = window.setTimeout(() => addNote.classList.remove('is-visible'), 4200);
    }

    function addToCollection() {
        const item = {
            id: (requested || 'heritage-t-shirt') + '-' + selectedSize,
            title: PRODUCT.title,
            priceUSD: PRODUCT.priceUSD,
            size: selectedSize,
            image: PRODUCT.image,
            quantity: 1,
            category: PRODUCT.category
        };

        if (typeof window.addToBag === 'function') {
            window.addToBag(item);
            flashNote('Added to your collection - size ' + selectedSize + '.');
        } else {
            flashNote('Size ' + selectedSize + ' reserved. Complete your order at checkout.');
        }
    }

    /* -------------------------------------------------------------------
       5. Quiet accordions (one open at a time)
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
       6. Sticky purchase bar
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
       7. Editorial lightbox
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

    function bindLightbox() {
        document.querySelectorAll('[data-lightbox]').forEach(figure => {
            figure.addEventListener('click', () => openLightbox(figure));
            figure.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox(figure);
                }
            });
        });
    }

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
       8. Initial state
       ------------------------------------------------------------------- */
    hydrate();
    bindSizes();

    const addBtn = document.getElementById('pdp-add');
    const stickyAddBtn = document.getElementById('pdp-sticky-add');
    if (addBtn) addBtn.addEventListener('click', addToCollection);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', addToCollection);

    bindLightbox();
});
