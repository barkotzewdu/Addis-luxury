/**
 * ADDIS LUXURY — E-Commerce & Interactivity Engine
 *
 * Architecture
 * ------------
 *   state    Central, single source of truth (currency + cart).
 *   modules  Small, single-purpose features that read/write `state`:
 *              Currency   — multi-currency display + dropdown
 *              Cart       — persistent cart store (the public API)
 *              CartDrawer — slide-over mini-cart rendering
 *              CartPage   — full checkout page rendering
 *              Search     — overlay search over a product catalog
 *              Navigation — mobile slide-out drawer
 *              SiteHeader — sticky header scroll state
 *              Catalog    — shop.html filtering & sorting
 *              Collections— products.html collection filtering
 *              Faq        — accordion
 *              CookieConsent, Forms, Reveal
 *
 * Events are bound with addEventListener and cart interactions use event
 * delegation (data-cart-action) — no inline handlers, so the strict CSP is
 * honoured and no user-controlled string is executed.
 */
(function () {
    'use strict';

    /* =====================================================================
       Config & seed data
       ===================================================================== */
    const STORAGE = {
        currency: 'addis_currency',
        cart: 'addis_cart',
        cookie: 'addis_cookie_consent'
    };

    const DEFAULT_CURRENCY = 'USD';
    const FREE_SHIPPING_THRESHOLD = 500;

    const CURRENCY_RATES = {
        USD: { symbol: '$', rate: 1, label: 'USD ($)', code: 'USD' },
        AED: { symbol: 'AED ', rate: 3.6725, label: 'UAE AED', code: 'AED' }
    };

    const DEFAULT_CART = [
        {
            id: 'empress-kemis-gown',
            title: 'The Empress Kemis Evening Gown',
            priceUSD: 2850,
            size: 'M',
            image: 'images/product-garment-01.jpg',
            quantity: 1,
            category: "Women's Couture"
        },
        {
            id: 'arabian-nights-tuxedo',
            title: 'Arabian Nights Bespoke Tuxedo',
            priceUSD: 3400,
            size: '40R (Bespoke)',
            image: 'images/product-garment-02.jpg',
            quantity: 1,
            category: "Men's Tailoring"
        }
    ];

    const SEARCH_CATALOG = [
        { title: 'The Empress Kemis Evening Gown', category: "Women's Couture", priceUSD: 2850, url: 'product-detail.html', img: 'images/product-garment-01.jpg' },
        { title: 'Arabian Nights Bespoke Tuxedo', category: "Men's Tailoring", priceUSD: 3400, url: 'product-detail.html', img: 'images/product-garment-02.jpg' },
        { title: 'Shemma Weave Heritage Cape', category: 'Ethiopian Craft Line', priceUSD: 1650, url: 'shop.html', img: 'images/lookbook-collection-01.jpg' },
        { title: 'Dubai Edition Gold-Silk Kimono', category: 'UAE Exclusive', priceUSD: 2200, url: 'shop.html', img: 'images/lookbook-collection-02.jpg' },
        { title: 'Handwoven Habesha Silk Pocket Square', category: 'Accessories', priceUSD: 195, url: 'shop.html', img: 'images/lookbook-collection-01.jpg' },
        { title: 'The Art of Ethiopian Handweaving', category: 'Journal', priceUSD: 0, url: 'blog.html#art-handweaving', img: 'images/founder-ethiopia.jpg' }
    ];

    /* =====================================================================
       State
       ===================================================================== */
    function readCurrency() {
        const stored = localStorage.getItem(STORAGE.currency);
        return CURRENCY_RATES[stored] ? stored : DEFAULT_CURRENCY;
    }

    function readCart() {
        try {
            const stored = localStorage.getItem(STORAGE.cart);
            if (!stored) return DEFAULT_CART.slice();
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : DEFAULT_CART.slice();
        } catch (err) {
            return DEFAULT_CART.slice();
        }
    }

    const state = {
        currency: readCurrency(),
        cart: readCart()
    };

    /* =====================================================================
       Helpers
       ===================================================================== */
    const $ = (selector, root) => (root || document).querySelector(selector);
    const $$ = (selector, root) => Array.prototype.slice.call((root || document).querySelectorAll(selector));

    function escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatPrice(priceInUSD) {
        const currency = CURRENCY_RATES[state.currency] || CURRENCY_RATES[DEFAULT_CURRENCY];
        const converted = priceInUSD * currency.rate;
        return currency.symbol + converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function getCartSubtotalUSD() {
        return state.cart.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);
    }

    /* =====================================================================
       Cart drawer — slide-over mini-cart
       ===================================================================== */
    const CartDrawer = {
        el: null,
        overlay: null,
        closeBtn: null,

        init() {
            this.el = $('#cart-drawer');
            this.overlay = $('#cart-drawer-overlay');
            this.closeBtn = $('#cart-drawer-close');

            if (!this.el || !this.overlay) return;

            $$('.cart-trigger-btn').forEach(btn => {
                btn.addEventListener('click', event => {
                    event.preventDefault();
                    this.open();
                });
            });

            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', () => this.close());
        },

        open() {
            if (!this.el || !this.overlay) return;
            this.render();
            this.el.classList.add('open');
            this.overlay.classList.add('open');
            document.body.classList.add('drawer-open');
        },

        close() {
            if (!this.el || !this.overlay) return;
            this.el.classList.remove('open');
            this.overlay.classList.remove('open');
            document.body.classList.remove('drawer-open');
        },

        itemMarkup(item) {
            const id = escapeHtml(item.id);
            const size = escapeHtml(item.size);
            const lineTotal = formatPrice(item.priceUSD * item.quantity);

            return [
                '<div class="cart-item-card">',
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="cart-item-img">',
                '<div class="cart-item-info">',
                '<span class="cart-item-title">' + escapeHtml(item.title) + '</span>',
                '<span class="cart-item-meta">Size: ' + size + '</span>',
                '<span class="cart-item-price">' + lineTotal + '</span>',
                '<div class="cart-qty-control">',
                '<button type="button" class="cart-qty-btn" data-cart-action="decrease" data-id="' + id + '" data-size="' + size + '" aria-label="Decrease quantity">-</button>',
                '<span class="cart-qty-val">' + item.quantity + '</span>',
                '<button type="button" class="cart-qty-btn" data-cart-action="increase" data-id="' + id + '" data-size="' + size + '" aria-label="Increase quantity">+</button>',
                '</div>',
                '</div>',
                '<button type="button" class="cart-item-remove" data-cart-action="remove" data-id="' + id + '" data-size="' + size + '">Remove</button>',
                '</div>'
            ].join('');
        },

        render() {
            const bodyEl = $('#cart-drawer-items');
            if (!bodyEl) return;

            const subtotalUSD = getCartSubtotalUSD();

            const subtotalEl = $('#cart-drawer-subtotal');
            if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalUSD);

            /* Complimentary shipping progress */
            const shippingBar = $('#cart-shipping-fill');
            const shippingMsg = $('#cart-shipping-msg');
            if (shippingBar && shippingMsg) {
                const pct = Math.min(100, Math.round((subtotalUSD / FREE_SHIPPING_THRESHOLD) * 100));
                shippingBar.style.width = pct + '%';

                if (subtotalUSD >= FREE_SHIPPING_THRESHOLD) {
                    shippingMsg.innerHTML = '<strong>Complimentary Luxury Worldwide Shipping</strong> Unlocked';
                } else {
                    shippingMsg.innerHTML = 'Add <strong>' + formatPrice(FREE_SHIPPING_THRESHOLD - subtotalUSD) + '</strong> more for complimentary courier shipping';
                }
            }

            if (state.cart.length === 0) {
                bodyEl.innerHTML = [
                    '<div class="cart-empty-state">',
                    '<p>Your shopping bag is currently empty.</p>',
                    '<a href="shop.html" class="btn btn--outline" data-cart-close>Explore Collections</a>',
                    '</div>'
                ].join('');
                return;
            }

            bodyEl.innerHTML = state.cart.map(item => this.itemMarkup(item)).join('');
        }
    };

    /* =====================================================================
       Full cart / checkout page
       ===================================================================== */
    const CartPage = {
        container: null,

        init() {
            this.container = $('#full-cart-items-container');
        },

        render() {
            const container = this.container || $('#full-cart-items-container');
            if (!container) return;

            if (state.cart.length === 0) {
                container.innerHTML = '<p class="cart-empty-msg">Your shopping bag is currently empty. <a href="shop.html">Explore the collections</a>.</p>';
            } else {
                container.innerHTML = state.cart.map(item => CartDrawer.itemMarkup(item)).join('');
            }

            const subtotal = getCartSubtotalUSD();
            $$('[data-cart-subtotal]').forEach(el => {
                el.textContent = formatPrice(subtotal);
            });
        }
    };

    /* =====================================================================
       Cart store — public API
       ===================================================================== */
    const Cart = {
        save() {
            localStorage.setItem(STORAGE.cart, JSON.stringify(state.cart));
            Cart.updateBadge();
            CartDrawer.render();
            CartPage.render();
        },

        updateBadge() {
            const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
            $$('.cart-badge').forEach(badge => {
                badge.textContent = totalItems;
                badge.classList.add('bump');
                window.setTimeout(() => badge.classList.remove('bump'), 300);
            });
        },

        add(product) {
            const existing = state.cart.find(item => item.id === product.id && item.size === product.size);
            if (existing) {
                existing.quantity += product.quantity || 1;
            } else {
                state.cart.push({
                    id: product.id,
                    title: product.title,
                    priceUSD: product.priceUSD,
                    size: product.size || 'M',
                    image: product.image || 'images/product-garment-01.jpg',
                    quantity: product.quantity || 1,
                    category: product.category || 'Bespoke Line'
                });
            }
            Cart.save();
            CartDrawer.open();
        },

        updateQty(id, size, delta) {
            const item = state.cart.find(i => i.id === id && i.size === size);
            if (!item) return;

            item.quantity += delta;
            if (item.quantity <= 0) {
                state.cart = state.cart.filter(i => !(i.id === id && i.size === size));
            }
            Cart.save();
        },

        remove(id, size) {
            state.cart = state.cart.filter(i => !(i.id === id && i.size === size));
            Cart.save();
        }
    };

    /* =====================================================================
       Currency
       ===================================================================== */
    const Currency = {
        apply() {
            $$('[data-price-usd]').forEach(el => {
                const usd = parseFloat(el.getAttribute('data-price-usd'));
                if (!isNaN(usd)) el.textContent = formatPrice(usd);
            });

            $$('.current-currency-label').forEach(el => {
                el.textContent = state.currency;
            });

            CartDrawer.render();
            CartPage.render();
        },

        init() {
            const btn = $('#currency-btn');
            const dropdown = $('#currency-dropdown');
            if (!btn || !dropdown) return;

            btn.addEventListener('click', event => {
                event.stopPropagation();
                dropdown.classList.toggle('open');
            });

            $$('.currency-option').forEach(option => {
                option.addEventListener('click', event => {
                    event.stopPropagation();
                    const selected = option.getAttribute('data-currency');
                    if (!CURRENCY_RATES[selected]) return;

                    state.currency = selected;
                    localStorage.setItem(STORAGE.currency, selected);

                    $$('.currency-option').forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    dropdown.classList.remove('open');
                    Currency.apply();
                });
            });

            document.addEventListener('click', () => dropdown.classList.remove('open'));
        }
    };

    /* =====================================================================
       Search modal
       ===================================================================== */
    const Search = {
        overlay: null,
        input: null,
        results: null,
        closeBtn: null,

        init() {
            this.overlay = $('#search-modal-overlay');
            this.input = $('#search-input');
            this.results = $('#search-results-list');
            this.closeBtn = $('#search-modal-close');

            if (this.overlay) {
                $$('.search-trigger-btn').forEach(btn => {
                    btn.addEventListener('click', event => {
                        event.preventDefault();
                        this.open();
                    });
                });

                if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
                this.overlay.addEventListener('click', event => {
                    if (event.target === this.overlay) this.close();
                });
            }

            if (this.input && this.results) {
                this.input.addEventListener('input', () => this.render(this.input.value));
            }

            $$('.search-tag-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    if (!this.input) return;
                    this.input.value = chip.textContent.trim();
                    this.render(this.input.value);
                });
            });
        },

        open() {
            if (!this.overlay) return;
            this.overlay.classList.add('open');
            document.body.classList.add('drawer-open');

            if (this.input) {
                this.input.value = '';
                this.input.focus();
            }
            if (this.results) {
                this.results.classList.remove('has-results');
                this.results.innerHTML = '';
            }
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('open');
            document.body.classList.remove('drawer-open');
        },

        render(value) {
            if (!this.results) return;

            const query = String(value || '').toLowerCase().trim();
            if (query.length < 2) {
                this.results.classList.remove('has-results');
                this.results.innerHTML = '';
                return;
            }

            const matches = SEARCH_CATALOG.filter(item =>
                item.title.toLowerCase().indexOf(query) !== -1 ||
                item.category.toLowerCase().indexOf(query) !== -1
            );

            this.results.classList.add('has-results');

            if (matches.length === 0) {
                this.results.innerHTML = '<p class="search-empty-msg">No pieces found matching "' + escapeHtml(query) + '". Try &ldquo;Gown&rdquo;, &ldquo;Tuxedo&rdquo; or &ldquo;Silk&rdquo;.</p>';
                return;
            }

            this.results.innerHTML = matches.map(item => {
                const meta = escapeHtml(item.category) + (item.priceUSD ? ' · ' + formatPrice(item.priceUSD) : '');
                return [
                    '<a href="' + escapeHtml(item.url) + '" class="search-result-item">',
                    '<img src="' + escapeHtml(item.img) + '" alt="' + escapeHtml(item.title) + '" class="search-result-thumb">',
                    '<span class="search-result-item__text">',
                    '<span class="search-result-item__title">' + escapeHtml(item.title) + '</span>',
                    '<span class="search-result-item__meta">' + meta + '</span>',
                    '</span>',
                    '</a>'
                ].join('');
            }).join('');
        }
    };

    /* =====================================================================
       Mobile navigation drawer
       ===================================================================== */
    const Navigation = {
        init() {
            const toggle = $('#nav-toggle-btn');
            const drawer = $('#mobile-nav-drawer');
            if (!toggle || !drawer) return;

            const overlay = this.ensureOverlay();
            const closeBtn = $('#mobile-nav-close');
            const close = () => this.close(drawer, toggle, overlay);

            toggle.addEventListener('click', event => {
                event.stopPropagation();
                if (drawer.classList.contains('open')) {
                    close();
                } else {
                    drawer.classList.add('open');
                    toggle.setAttribute('aria-expanded', 'true');
                    document.body.classList.add('drawer-open');
                    overlay.classList.add('is-visible');
                }
            });

            if (closeBtn) closeBtn.addEventListener('click', close);
            overlay.addEventListener('click', close);

            $$('a', drawer).forEach(link => {
                link.addEventListener('click', () => window.setTimeout(close, 80));
            });

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') close();
            });
        },

        ensureOverlay() {
            let overlay = $('.nav-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'nav-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                document.body.appendChild(overlay);
            }
            return overlay;
        },

        close(drawer, toggle, overlay) {
            if (!drawer || !drawer.classList.contains('open')) return;
            drawer.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('drawer-open');
            if (overlay) overlay.classList.remove('is-visible');
        }
    };

    /* =====================================================================
       Sticky header
       ===================================================================== */
    const SiteHeader = {
        init() {
            const header = $('#site-header');
            if (!header) return;

            const onScroll = () => {
                header.classList.toggle('scrolled', window.scrollY > 30);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    };

    /* =====================================================================
       Shop catalog — filtering & sorting (shop.html)
       ===================================================================== */
    const Catalog = {
        init() {
            const grid = $('#product-grid');
            if (!grid) return;

            const cards = $$('.product-card', grid);
            if (!cards.length) return;

            const categoryCheckboxes = $$('#category-filter-list input[type="checkbox"]');
            const allCategories = categoryCheckboxes.find(cb => cb.value === 'all');
            const sizeChips = $$('#size-filter-chips .size-chip');
            const priceRadios = $$('#price-filter-list input[type="radio"]');
            const sortSelect = $('#shop-sort');
            const resultsNumber = $('#shop-results-number');
            const emptyState = $('#shop-empty-state');
            const clearBtn = $('#shop-clear-filters-btn');

            /* Preserve editorial (DOM) order for the default sort. */
            cards.forEach((card, index) => {
                card.dataset.originalOrder = index;
            });

            const activeCategories = () => categoryCheckboxes
                .filter(cb => cb.checked && cb.value !== 'all')
                .map(cb => cb.value);

            const activeSize = () => {
                const chip = sizeChips.find(c => c.classList.contains('active'));
                return chip ? chip.getAttribute('data-size') : 'all';
            };

            const activePrice = () => {
                const radio = priceRadios.find(r => r.checked);
                if (!radio || radio.value === 'all') return null;
                const parts = radio.value.split('-').map(Number);
                return { min: parts[0], max: parts[1] };
            };

            function apply() {
                const categories = activeCategories();
                const size = activeSize();
                const price = activePrice();
                const sortMode = sortSelect ? sortSelect.value : 'editorial';
                let visibleCount = 0;

                cards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category') || '';
                    const cardSize = card.getAttribute('data-size') || '';
                    const cardPrice = parseFloat(card.getAttribute('data-price')) || 0;
                    let matches = true;

                    if (categories.length && categories.indexOf(cardCategory) === -1) matches = false;
                    if (size !== 'all' && cardSize !== size) matches = false;
                    if (price && (cardPrice < price.min || cardPrice > price.max)) matches = false;

                    card.classList.toggle('is-hidden', !matches);
                    if (matches) visibleCount += 1;
                });

                const sorted = cards.slice().sort((a, b) => {
                    const priceA = parseFloat(a.getAttribute('data-price')) || 0;
                    const priceB = parseFloat(b.getAttribute('data-price')) || 0;

                    if (sortMode === 'price-asc') return priceA - priceB;
                    if (sortMode === 'price-desc') return priceB - priceA;
                    if (sortMode === 'newest') return parseInt(b.dataset.originalOrder, 10) - parseInt(a.dataset.originalOrder, 10);
                    return parseInt(a.dataset.originalOrder, 10) - parseInt(b.dataset.originalOrder, 10);
                });

                sorted.forEach(card => grid.appendChild(card));

                if (resultsNumber) resultsNumber.textContent = visibleCount;
                if (emptyState) emptyState.classList.toggle('is-visible', visibleCount === 0);
            }

            categoryCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    if (cb.value === 'all') {
                        if (cb.checked) {
                            categoryCheckboxes.forEach(other => { if (other !== cb) other.checked = false; });
                        }
                    } else {
                        if (cb.checked && allCategories) allCategories.checked = false;
                        const anyChecked = categoryCheckboxes.some(other => other.value !== 'all' && other.checked);
                        if (!anyChecked && allCategories) allCategories.checked = true;
                    }
                    apply();
                });
            });

            sizeChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    sizeChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    apply();
                });
            });

            priceRadios.forEach(radio => radio.addEventListener('change', apply));
            if (sortSelect) sortSelect.addEventListener('change', apply);

            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    categoryCheckboxes.forEach(cb => { cb.checked = (cb.value === 'all'); });
                    sizeChips.forEach(c => c.classList.remove('active'));
                    const allSizeChip = sizeChips.find(c => c.getAttribute('data-size') === 'all');
                    if (allSizeChip) allSizeChip.classList.add('active');
                    priceRadios.forEach(r => { r.checked = (r.value === 'all'); });
                    if (sortSelect) sortSelect.value = 'editorial';
                    apply();
                });
            }

            apply();
        }
    };

    /* =====================================================================
       Collections filter (products.html)
       ===================================================================== */
    const Collections = {
        init() {
            const chips = $$('.filter-chip');
            const cards = $$('.card--collection');
            const count = $('#collection-count');
            if (!chips.length || !cards.length) return;

            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const filter = chip.getAttribute('data-filter');

                    chips.forEach(c => {
                        c.classList.remove('is-active');
                        c.setAttribute('aria-selected', 'false');
                    });
                    chip.classList.add('is-active');
                    chip.setAttribute('aria-selected', 'true');

                    let visible = 0;
                    cards.forEach(card => {
                        const match = filter === 'all' || card.getAttribute('data-category') === filter;
                        card.classList.toggle('is-hidden', !match);
                        if (match) visible += 1;
                    });

                    if (count) count.textContent = visible;
                });
            });
        }
    };

    /* =====================================================================
       FAQ accordion
       ===================================================================== */
    const Faq = {
        init() {
            const questions = $$('.faq__question');
            if (!questions.length) return;

            questions.forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.faq__item');
                    if (!item) return;

                    const wasOpen = item.classList.contains('open');
                    $$('.faq__item').forEach(i => i.classList.remove('open'));
                    if (!wasOpen) item.classList.add('open');
                });
            });
        }
    };

    /* =====================================================================
       Cookie consent
       ===================================================================== */
    const CookieConsent = {
        init() {
            const banner = $('#cookie-banner');
            if (!banner) return;

            const accept = $('#cookie-accept');
            const reject = $('#cookie-reject');

            if (!localStorage.getItem(STORAGE.cookie)) {
                window.setTimeout(() => banner.classList.remove('hidden'), 800);
            } else {
                banner.classList.add('hidden');
            }

            if (accept) {
                accept.addEventListener('click', () => {
                    localStorage.setItem(STORAGE.cookie, 'accepted');
                    banner.classList.add('hidden');
                    if (typeof gtag === 'function') {
                        gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
                    }
                });
            }

            if (reject) {
                reject.addEventListener('click', () => {
                    localStorage.setItem(STORAGE.cookie, 'rejected');
                    banner.classList.add('hidden');
                });
            }
        }
    };

    /* =====================================================================
       Forms
       ===================================================================== */
    const Forms = {
        init() {
            $$('form').forEach(form => {
                if (form.id === 'footer-newsletter') return;

                form.addEventListener('submit', event => {
                    event.preventDefault();
                    let hasError = false;

                    $$('input[required], textarea[required], select[required]', form).forEach(field => {
                        if (!field.value.trim()) {
                            field.classList.add('error');
                            hasError = true;
                        } else {
                            field.classList.remove('error');
                        }
                    });

                    if (!hasError) window.location.href = 'thank-you.html';
                });
            });

            const newsletter = $('#footer-newsletter');
            if (!newsletter) return;

            newsletter.addEventListener('submit', event => {
                event.preventDefault();
                const input = newsletter.querySelector('.ad-newsletter__input');
                const status = $('#footer-newsletter-status');

                if (input && input.value.trim()) {
                    if (status) {
                        status.textContent = 'Welcome to ADISS — you are on the list.';
                        status.classList.add('is-visible');
                    }
                    newsletter.reset();
                } else if (input) {
                    input.classList.add('has-error');
                    input.addEventListener('input', () => input.classList.remove('has-error'), { once: true });
                }
            });
        }
    };

    /* =====================================================================
       Scroll reveal
       ===================================================================== */
    const Reveal = {
        init() {
            const items = $$('.fade-in');
            if (!items.length) return;

            if (!('IntersectionObserver' in window)) {
                items.forEach(el => el.classList.add('visible'));
                return;
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            items.forEach(el => observer.observe(el));
        }
    };

    /* =====================================================================
       About — creator-card cursor glow (about.html)
       ===================================================================== */
    const About = {
        init() {
            const cards = $$('.creator-card');
            if (!cards.length) return;

            const canHover = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;
            if (!canHover) return;

            cards.forEach(card => {
                card.addEventListener('pointermove', event => {
                    const rect = card.getBoundingClientRect();
                    const x = ((event.clientX - rect.left) / rect.width) * 100;
                    const y = ((event.clientY - rect.top) / rect.height) * 100;
                    card.style.setProperty('--mx', x.toFixed(1) + '%');
                    card.style.setProperty('--my', y.toFixed(1) + '%');
                });

                card.addEventListener('pointerleave', () => {
                    card.style.removeProperty('--mx');
                    card.style.removeProperty('--my');
                });
            });
        }
    };

    /* =====================================================================
       Event delegation — cart interactions (CSP-safe)
       ===================================================================== */
    function bindGlobalEvents() {
        document.addEventListener('click', event => {
            const target = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
            if (!target) return;

            const action = target.closest('[data-cart-action]');
            if (action) {
                event.preventDefault();
                const type = action.getAttribute('data-cart-action');
                const id = action.getAttribute('data-id');
                const size = action.getAttribute('data-size');

                if (type === 'increase') Cart.updateQty(id, size, 1);
                else if (type === 'decrease') Cart.updateQty(id, size, -1);
                else if (type === 'remove') Cart.remove(id, size);
                return;
            }

            if (target.closest('[data-cart-close], .cart-drawer-view-bag-link')) {
                CartDrawer.close();
            }
        });
    }

    /* =====================================================================
       Public API (used by js/product.js and legacy callers)
       ===================================================================== */
    window.ADISS = {
        state: state,
        currency: Currency,
        cart: Cart,
        drawer: CartDrawer,
        search: Search
    };

    window.addToBag = product => Cart.add(product);
    window.updateCartQty = (id, size, delta) => Cart.updateQty(id, size, delta);
    window.removeCartItem = (id, size) => Cart.remove(id, size);
    window.openCartDrawer = () => CartDrawer.open();
    window.closeCartDrawer = () => CartDrawer.close();

    /* =====================================================================
       Bootstrap
       ===================================================================== */
    function init() {
        CartDrawer.init();
        CartPage.init();
        Currency.init();

        Cart.updateBadge();
        Currency.apply();

        Search.init();
        Navigation.init();
        SiteHeader.init();
        Catalog.init();
        Collections.init();
        Faq.init();
        CookieConsent.init();
        Forms.init();
        Reveal.init();
        About.init();
        bindGlobalEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
