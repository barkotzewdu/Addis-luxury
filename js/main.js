/**
 * ADDIS LUXURY - E-Commerce & Interactivity Engine
 * Features: Pangaia 3-Zone Header, Multi-Currency Switcher, Slide-Over Cart Drawer,
 * Free Shipping Calculator, Search Modal, Shop Catalog Filtering & Sorting,
 * Product Detail Interactions, and Checkout Handling.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // 1. Multi-Currency Engine
    // =========================================================================
    const CURRENCY_RATES = {
        USD: { symbol: '$', rate: 1, label: 'USD ($)', code: 'USD' },
        AED: { symbol: 'AED ', rate: 3.6725, label: 'UAE AED', code: 'AED' }
    };

    let activeCurrency = localStorage.getItem('addis_currency') || 'USD';
    if (!CURRENCY_RATES[activeCurrency]) activeCurrency = 'USD';

    function formatPrice(priceInUSD) {
        const curr = CURRENCY_RATES[activeCurrency];
        const converted = priceInUSD * curr.rate;
        return `${curr.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    function updatePagePrices() {
        document.querySelectorAll('[data-price-usd]').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-price-usd'));
            if (!isNaN(usd)) {
                el.textContent = formatPrice(usd);
            }
        });

        document.querySelectorAll('.current-currency-label').forEach(el => {
            el.textContent = activeCurrency;
        });

        // Re-render cart elements if open
        renderCartDrawer();
        if (typeof renderFullCartPage === 'function') {
            renderFullCartPage();
        }
    }

    // Currency Dropdown Listeners
    const currencyBtn = document.getElementById('currency-btn');
    const currencyDropdown = document.getElementById('currency-dropdown');

    if (currencyBtn && currencyDropdown) {
        currencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyDropdown.classList.toggle('open');
        });

        document.querySelectorAll('.currency-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const selected = opt.getAttribute('data-currency');
                if (CURRENCY_RATES[selected]) {
                    activeCurrency = selected;
                    localStorage.setItem('addis_currency', activeCurrency);
                    document.querySelectorAll('.currency-option').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    currencyDropdown.classList.remove('open');
                    updatePagePrices();
                }
            });
        });

        document.addEventListener('click', () => {
            currencyDropdown.classList.remove('open');
        });
    }

    // =========================================================================
    // 2. Reactive E-Commerce Cart Store
    // =========================================================================
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

    let cart = [];
    try {
        const stored = localStorage.getItem('addis_cart');
        cart = stored ? JSON.parse(stored) : DEFAULT_CART;
    } catch (e) {
        cart = DEFAULT_CART;
    }

    function saveCart() {
        localStorage.setItem('addis_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartDrawer();
        if (typeof renderFullCartPage === 'function') {
            renderFullCartPage();
        }
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = totalItems;
            badge.classList.add('bump');
            setTimeout(() => badge.classList.remove('bump'), 300);
        });
    }

    function getCartSubtotalUSD() {
        return cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    }

    window.addToBag = function(product) {
        const existing = cart.find(item => item.id === product.id && item.size === product.size);
        if (existing) {
            existing.quantity += (product.quantity || 1);
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                priceUSD: product.priceUSD,
                size: product.size || 'M',
                image: product.image || 'images/product-garment-01.jpg',
                quantity: product.quantity || 1,
                category: product.category || 'Bespoke Line'
            });
        }
        saveCart();
        openCartDrawer();
    };

    window.updateCartQty = function(id, size, delta) {
        const item = cart.find(i => i.id === id && i.size === size);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => !(i.id === id && i.size === size));
            }
            saveCart();
        }
    };

    window.removeCartItem = function(id, size) {
        cart = cart.filter(i => !(i.id === id && i.size === size));
        saveCart();
    };

    // =========================================================================
    // 3. Slide-Over Mini-Cart Drawer
    // =========================================================================
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartCloseBtn = document.getElementById('cart-drawer-close');

    function openCartDrawer() {
        if (cartDrawer && cartOverlay) {
            renderCartDrawer();
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.classList.add('drawer-open');
        }
    }

    function closeCartDrawer() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.classList.remove('drawer-open');
        }
    }

    document.querySelectorAll('.cart-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    function renderCartDrawer() {
        const bodyEl = document.getElementById('cart-drawer-items');
        const subtotalEl = document.getElementById('cart-drawer-subtotal');
        const shippingBar = document.getElementById('cart-shipping-fill');
        const shippingMsg = document.getElementById('cart-shipping-msg');

        if (!bodyEl) return;

        const subtotalUSD = getCartSubtotalUSD();
        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalUSD);

        // Free Shipping calculation (Threshold: $500 USD)
        const FREE_SHIPPING_THRESHOLD = 500;
        if (shippingBar && shippingMsg) {
            const pct = Math.min(100, Math.round((subtotalUSD / FREE_SHIPPING_THRESHOLD) * 100));
            shippingBar.style.width = `${pct}%`;

            if (subtotalUSD >= FREE_SHIPPING_THRESHOLD) {
                shippingMsg.innerHTML = `<strong>Complimentary Luxury Worldwide Shipping</strong> Unlocked`;
            } else {
                const diffUSD = FREE_SHIPPING_THRESHOLD - subtotalUSD;
                shippingMsg.innerHTML = `Add <strong>${formatPrice(diffUSD)}</strong> more for complimentary courier shipping`;
            }
        }

        if (cart.length === 0) {
            bodyEl.innerHTML = `
                <div class="cart-empty-state">
                    <p>Your shopping bag is currently empty.</p>
                    <a href="shop.html" class="btn btn--outline" onclick="closeCartDrawer()">Explore Collections</a>
                </div>
            `;
            return;
        }

        let html = '';
        cart.forEach(item => {
            const itemTotalFormatted = formatPrice(item.priceUSD * item.quantity);
            html += `
                <div class="cart-item-card">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-info">
                        <span class="cart-item-title">${item.title}</span>
                        <span class="cart-item-meta">Size: ${item.size}</span>
                        <span class="cart-item-price">${itemTotalFormatted}</span>
                        <div class="cart-qty-control">
                            <button type="button" class="cart-qty-btn" onclick="updateCartQty('${item.id}', '${item.size}', -1)">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button type="button" class="cart-qty-btn" onclick="updateCartQty('${item.id}', '${item.size}', 1)">+</button>
                        </div>
                    </div>
                    <button type="button" class="cart-item-remove" onclick="removeCartItem('${item.id}', '${item.size}')">Remove</button>
                </div>
            `;
        });
        bodyEl.innerHTML = html;
    }

    // =========================================================================
    // 4. Search Modal Overlay Engine
    // =========================================================================
    const searchOverlay = document.getElementById('search-modal-overlay');
    const searchCloseBtn = document.getElementById('search-modal-close');
    const searchInput = document.getElementById('search-input');
    const searchResultsList = document.getElementById('search-results-list');

    const SEARCH_CATALOG = [
        { title: "The Empress Kemis Evening Gown", category: "Women's Couture", priceUSD: 2850, url: "product-detail.html", img: "images/product-garment-01.jpg" },
        { title: "Arabian Nights Bespoke Tuxedo", category: "Men's Tailoring", priceUSD: 3400, url: "product-detail.html", img: "images/product-garment-02.jpg" },
        { title: "Shemma Weave Heritage Cape", category: "Ethiopian Craft Line", priceUSD: 1650, url: "shop.html", img: "images/lookbook-collection-01.jpg" },
        { title: "Dubai Edition Gold-Silk Kimono", category: "UAE Exclusive", priceUSD: 2200, url: "shop.html", img: "images/lookbook-collection-02.jpg" },
        { title: "Handwoven Habesha Silk Pocket Square", category: "Accessories", priceUSD: 195, url: "shop.html", img: "images/lookbook-collection-01.jpg" },
        { title: "The Art of Ethiopian Handweaving", category: "Journal", priceUSD: 0, url: "blog.html#art-handweaving", img: "images/founder-ethiopia.jpg" }
    ];

    function openSearchModal() {
        if (searchOverlay) {
            searchOverlay.classList.add('open');
            document.body.classList.add('drawer-open');
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            if (searchResultsList) {
                searchResultsList.classList.remove('has-results');
                searchResultsList.innerHTML = '';
            }
        }
    }

    function closeSearchModal() {
        if (searchOverlay) {
            searchOverlay.classList.remove('open');
            document.body.classList.remove('drawer-open');
        }
    }

    document.querySelectorAll('.search-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openSearchModal();
        });
    });

    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearchModal);
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearchModal();
        });
    }

    if (searchInput && searchResultsList) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResultsList.classList.remove('has-results');
                searchResultsList.innerHTML = '';
                return;
            }

            const matches = SEARCH_CATALOG.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                searchResultsList.classList.add('has-results');
                searchResultsList.innerHTML = matches.map(item => `
                    <a href="${item.url}" class="search-result-item">
                        <img src="${item.img}" alt="${item.title}" class="search-result-thumb">
                        <span class="search-result-item__text">
                            <span class="search-result-item__title">${item.title}</span>
                            <span class="search-result-item__meta">${item.category}${item.priceUSD ? ' · ' + formatPrice(item.priceUSD) : ''}</span>
                        </span>
                    </a>
                `).join('');
            } else {
                searchResultsList.classList.add('has-results');
                searchResultsList.innerHTML = `<p class="search-empty-msg">No pieces found matching "${query}". Try &ldquo;Gown&rdquo;, &ldquo;Tuxedo&rdquo; or &ldquo;Silk&rdquo;.</p>`;
            }
        });
    }

    document.querySelectorAll('.search-tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.textContent.trim();
            if (searchInput) {
                searchInput.value = tag;
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // =========================================================================
    // 5. Mobile Slide-Out Drawer Navigation
    // =========================================================================
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    const ensureNavOverlay = () => {
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }
        return overlay;
    };

    const closeMobileDrawer = () => {
        if (!mobileDrawer || !mobileDrawer.classList.contains('open')) return;
        mobileDrawer.classList.remove('open');
        if (navToggleBtn) navToggleBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) overlay.classList.remove('is-visible');
    };

    if (navToggleBtn && mobileDrawer) {
        const overlay = ensureNavOverlay();
        const navCloseBtn = document.getElementById('mobile-nav-close');

        navToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileDrawer.classList.contains('open');
            if (isOpen) {
                closeMobileDrawer();
            } else {
                mobileDrawer.classList.add('open');
                navToggleBtn.setAttribute('aria-expanded', 'true');
                document.body.classList.add('drawer-open');
                overlay.classList.add('is-visible');
            }
        });

        if (navCloseBtn) {
            navCloseBtn.addEventListener('click', closeMobileDrawer);
        }

        overlay.addEventListener('click', closeMobileDrawer);

        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMobileDrawer, 80);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileDrawer();
        });
    }

    // =========================================================================
    // 6. Sticky Header Scroll Indicator
    // =========================================================================
    const siteHeader = document.getElementById('site-header');
    if (siteHeader) {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // =========================================================================
    // 7. Product Detail Page (PDP) Interactions
    // =========================================================================
    const mainPdpImg = document.getElementById('pdp-main-img');
    document.querySelectorAll('.pdp-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (mainPdpImg) {
                mainPdpImg.src = thumb.getAttribute('data-src') || thumb.src;
            }
        });
    });

    let selectedSize = 'M';
    document.querySelectorAll('.pdp-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.getAttribute('data-size') || btn.textContent.trim();

            const customBox = document.getElementById('pdp-custom-fit-box');
            if (customBox) {
                if (selectedSize === 'Custom Bespoke') {
                    customBox.classList.add('open');
                } else {
                    customBox.classList.remove('open');
                }
            }
        });
    });

    const pdpAddBagBtn = document.getElementById('pdp-add-to-bag-btn');
    if (pdpAddBagBtn) {
        pdpAddBagBtn.addEventListener('click', () => {
            const title = document.querySelector('.pdp-title')?.textContent.trim() || 'Custom Luxury Garment';
            const priceUSD = parseFloat(document.querySelector('.pdp-price')?.getAttribute('data-price-usd') || 2850);
            const img = mainPdpImg?.src || 'images/product-garment-01.jpg';

            addToBag({
                id: 'pdp-' + title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                title: title,
                priceUSD: priceUSD,
                size: selectedSize,
                image: img,
                quantity: 1
            });
        });
    }

    // PDP Accordions
    document.querySelectorAll('.pdp-accordion-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
            const parent = hdr.parentElement;
            const isOpen = parent.classList.contains('open');
            document.querySelectorAll('.pdp-accordion-item').forEach(item => item.classList.remove('open'));
            if (!isOpen) {
                parent.classList.add('open');
            }
        });
    });

    // =========================================================================
    // 8. Shop Catalog Filtering & Sorting (`shop.html`)
    // =========================================================================
    const productGrid = document.getElementById('product-grid');

    if (productGrid) {
        const allCards = Array.from(productGrid.querySelectorAll('.product-card'));
        const categoryCheckboxes = Array.from(document.querySelectorAll('#category-filter-list input[type="checkbox"]'));
        const allCategoriesCheckbox = categoryCheckboxes.find(cb => cb.value === 'all');
        const sizeChips = Array.from(document.querySelectorAll('#size-filter-chips .size-chip'));
        const priceRadios = Array.from(document.querySelectorAll('#price-filter-list input[type="radio"]'));
        const sortSelect = document.getElementById('shop-sort');
        const resultsNumberEl = document.getElementById('shop-results-number');
        const emptyStateEl = document.getElementById('shop-empty-state');
        const clearFiltersBtn = document.getElementById('shop-clear-filters-btn');

        // Preserve each card's original position for "Bespoke Editorial Picks" (default) order
        allCards.forEach((card, index) => {
            card.dataset.originalOrder = index;
        });

        function getActiveCategories() {
            const checked = categoryCheckboxes.filter(cb => cb.checked && cb.value !== 'all');
            return checked.map(cb => cb.value);
        }

        function getActiveSize() {
            const activeChip = sizeChips.find(chip => chip.classList.contains('active'));
            return activeChip ? activeChip.getAttribute('data-size') : 'all';
        }

        function getActivePriceRange() {
            const checked = priceRadios.find(r => r.checked);
            if (!checked || checked.value === 'all') return null;
            const [min, max] = checked.value.split('-').map(Number);
            return { min, max };
        }

        function applyFilters() {
            const activeCategories = getActiveCategories();
            const activeSize = getActiveSize();
            const activePrice = getActivePriceRange();
            const sortMode = sortSelect ? sortSelect.value : 'editorial';

            let visibleCount = 0;

            allCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category') || '';
                const cardSize = card.getAttribute('data-size') || '';
                const cardPrice = parseFloat(card.getAttribute('data-price')) || 0;

                let matches = true;

                if (activeCategories.length > 0 && !activeCategories.includes(cardCategory)) {
                    matches = false;
                }
                if (activeSize !== 'all' && cardSize !== activeSize) {
                    matches = false;
                }
                if (activePrice && (cardPrice < activePrice.min || cardPrice > activePrice.max)) {
                    matches = false;
                }

                card.classList.toggle('is-hidden', !matches);
                if (matches) visibleCount += 1;
            });

            // Sorting: reorder visible + hidden cards together so DOM order matches chosen sort
            const sorted = allCards.slice().sort((a, b) => {
                if (sortMode === 'price-asc') {
                    return (parseFloat(a.getAttribute('data-price')) || 0) - (parseFloat(b.getAttribute('data-price')) || 0);
                }
                if (sortMode === 'price-desc') {
                    return (parseFloat(b.getAttribute('data-price')) || 0) - (parseFloat(a.getAttribute('data-price')) || 0);
                }
                if (sortMode === 'newest') {
                    // Newest Arrivals: reverse of original editorial order
                    return parseInt(b.dataset.originalOrder, 10) - parseInt(a.dataset.originalOrder, 10);
                }
                // Default: Bespoke Editorial Picks (original order)
                return parseInt(a.dataset.originalOrder, 10) - parseInt(b.dataset.originalOrder, 10);
            });

            sorted.forEach(card => productGrid.appendChild(card));

            if (resultsNumberEl) resultsNumberEl.textContent = visibleCount;
            if (emptyStateEl) emptyStateEl.classList.toggle('is-visible', visibleCount === 0);
        }

        // Category checkboxes: "All Categories" is exclusive of the rest
        categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.value === 'all') {
                    if (cb.checked) {
                        categoryCheckboxes.forEach(other => { if (other !== cb) other.checked = false; });
                    }
                } else {
                    if (cb.checked && allCategoriesCheckbox) {
                        allCategoriesCheckbox.checked = false;
                    }
                    const anyChecked = categoryCheckboxes.some(other => other.value !== 'all' && other.checked);
                    if (!anyChecked && allCategoriesCheckbox) {
                        allCategoriesCheckbox.checked = true;
                    }
                }
                applyFilters();
            });
        });

        // Size chips: single-select
        sizeChips.forEach(chip => {
            chip.addEventListener('click', () => {
                sizeChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                applyFilters();
            });
        });

        // Price radios
        priceRadios.forEach(radio => {
            radio.addEventListener('change', applyFilters);
        });

        // Sort dropdown
        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        // Clear all filters
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                categoryCheckboxes.forEach(cb => { cb.checked = (cb.value === 'all'); });
                sizeChips.forEach(c => c.classList.remove('active'));
                const allSizeChip = sizeChips.find(c => c.getAttribute('data-size') === 'all');
                if (allSizeChip) allSizeChip.classList.add('active');
                priceRadios.forEach(r => { r.checked = (r.value === 'all'); });
                if (sortSelect) sortSelect.value = 'editorial';
                applyFilters();
            });
        }

        // Initial run
        applyFilters();
    }

    // =========================================================================
    // 9. FAQ Accordion
    // =========================================================================
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq__item');
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) {
                item.classList.add('open');
            }
        });
    });

    // =========================================================================
    // 10. Cookie Consent Banner
    // =========================================================================
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieReject = document.getElementById('cookie-reject');

    if (cookieBanner) {
        if (!localStorage.getItem('addis_cookie_consent')) {
            setTimeout(() => cookieBanner.classList.remove('hidden'), 800);
        } else {
            cookieBanner.classList.add('hidden');
        }

        if (cookieAccept) {
            cookieAccept.addEventListener('click', () => {
                localStorage.setItem('addis_cookie_consent', 'accepted');
                cookieBanner.classList.add('hidden');
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', { 'analytics_storage': 'granted', 'ad_storage': 'granted' });
                }
            });
        }

        if (cookieReject) {
            cookieReject.addEventListener('click', () => {
                localStorage.setItem('addis_cookie_consent', 'rejected');
                cookieBanner.classList.add('hidden');
            });
        }
    }

    // =========================================================================
    // 11. Form Real-Time Validation & Submission Handling
    // =========================================================================
    document.querySelectorAll('form').forEach(form => {
        if (form.id === 'footer-newsletter') return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let hasError = false;

            form.querySelectorAll('input[required], textarea[required], select[required]').forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    hasError = true;
                } else {
                    field.classList.remove('error');
                }
            });

            if (!hasError) {
                window.location.href = 'thank-you.html';
            }
        });
    });

    // Newsletter (footer)
    const newsletterForm = document.getElementById('footer-newsletter');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('.ad-newsletter__input');
            const status = document.getElementById('footer-newsletter-status');
            if (input && input.value.trim()) {
                if (status) {
                    status.textContent = 'Welcome to ADISS — you are on the list.';
                    status.classList.add('is-visible');
                }
                newsletterForm.reset();
            } else if (input) {
                input.classList.add('has-error');
                input.addEventListener('input', () => input.classList.remove('has-error'), { once: true });
            }
        });
    }

    // =========================================================================
    // 11b. Collections Filter (products page)
    // =========================================================================
    const filterChips = document.querySelectorAll('.filter-chip');
    const collectionCards = document.querySelectorAll('.card--collection');
    const collectionCount = document.getElementById('collection-count');

    if (filterChips.length && collectionCards.length) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.getAttribute('data-filter');

                filterChips.forEach(c => {
                    c.classList.remove('is-active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('is-active');
                chip.setAttribute('aria-selected', 'true');

                let visible = 0;
                collectionCards.forEach(card => {
                    const match = filter === 'all' || card.getAttribute('data-category') === filter;
                    card.classList.toggle('is-hidden', !match);
                    if (match) visible++;
                });

                if (collectionCount) collectionCount.textContent = visible;
            });
        });
    }

    // =========================================================================
    // 12. IntersectionObserver Fade-In
    // =========================================================================
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }

    // Initialize state
    updateCartBadge();
    updatePagePrices();
});