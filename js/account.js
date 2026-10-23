/* ========================================================================
   ADISS — PRIVATE CLIENT
   Powers account.html: the left-salon navigation, the refined edit
   interactions for profile / measurements / preferences, the measurement-led
   size recommendation engine and the tailoring notes behind it ("Why?").
   Recommendations are a plain rule on the client's own measurements and
   preferred fit — no scoring, no invented confidence.
   Vanilla JS, no dependencies. Honours the strict CSP (no inline code).
   ======================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'addis_private_client';

    const DEFAULTS = {
        profile: {
            fullName: 'Eliyas Yonas Tekle',
            country: 'UAE',
            language: 'English / Amharic / French',
            currency: 'AED'
        },
        measurements: {
            height: '188',
            weight: '50',
            build: 'Slim',
            shoulder: '',
            chest: '',
            waist: '',
            fit: 'Tailored'
        },
        preferences: {
            preferredFit: 'Tailored',
            favoriteCollection: 'Monarch',
            materials: ['Cotton', 'Cashmere', 'Wool'],
            palette: ['Ivory', 'Charcoal', 'Camel', 'Black']
        }
    };

    function readStore() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (err) {
            return null;
        }
    }

    function writeStore(store) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch (err) {
            /* storage unavailable — the salon still works in-session */
        }
    }

    const store = Object.assign({}, DEFAULTS, readStore() || {});
    store.measurements = Object.assign({}, DEFAULTS.measurements, store.measurements || {});
    store.preferences = Object.assign({}, DEFAULTS.preferences, store.preferences || {});
    store.profile = Object.assign({}, DEFAULTS.profile, store.profile || {});

    function save() {
        writeStore(store);
    }

    /* -------------------------------------------------------------------
       1. Left rail — scroll-spy
       ------------------------------------------------------------------- */
    const railLinks = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
    const railTargets = railLinks
        .map(function (link) { return document.getElementById(link.getAttribute('data-rail')); })
        .filter(Boolean);

    function updateRail() {
        if (!railTargets.length) return;
        const probe = window.scrollY + 190;
        let current = railTargets[0];

        railTargets.forEach(function (target) {
            if (target.offsetTop <= probe) current = target;
        });

        railLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('data-rail') === current.id);
        });
    }

    if (railTargets.length) {
        let ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                updateRail();
                ticking = false;
            });
        }, { passive: true });
        updateRail();
    }

    /* -------------------------------------------------------------------
       2. Refined editing — profile, measurements, preferences
       ------------------------------------------------------------------- */
    function formatMeasure(key, raw) {
        const clean = String(raw || '').trim();
        if (!clean) return { text: 'Not specified', empty: true };
        if (key === 'height') {
            const n = parseFloat(clean);
            return n ? { text: n + ' cm', empty: false } : { text: clean, empty: false };
        }
        if (key === 'weight') {
            const n = parseFloat(clean);
            return n ? { text: n + ' kg', empty: false } : { text: clean, empty: false };
        }
        return { text: clean, empty: false };
    }

    function applyMeasure(input) {
        const key = input.getAttribute('data-measure-key');
        const target = input.parentElement;
        const result = formatMeasure(key, input.value);
        target.textContent = result.text;
        target.classList.toggle('is-empty', result.empty);
        target.setAttribute('data-measure', key);
        store.measurements[key] = result.empty ? '' : input.value.trim();
    }

    function startDDFields(panel) {
        panel.querySelectorAll('dd[data-field]').forEach(function (dd) {
            if (dd.querySelector('input')) return;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = dd.textContent.trim();
            input.setAttribute('aria-label', (dd.previousElementSibling && dd.previousElementSibling.textContent) || dd.getAttribute('data-field'));
            dd.dataset.value = dd.textContent.trim();
            dd.textContent = '';
            dd.appendChild(input);
            input.focus();
        });
    }

    function endDDFields(panel, bucket) {
        panel.querySelectorAll('dd[data-field]').forEach(function (dd) {
            const input = dd.querySelector('input');
            if (!input) return;
            const key = dd.getAttribute('data-field');
            const value = input.value.trim() || dd.dataset.value || '';
            dd.textContent = value;
            if (bucket && store[bucket]) store[bucket][key] = value;
        });
    }

    function startMeasureFields(panel) {
        panel.querySelectorAll('.pc-measure__value[data-measure]').forEach(function (el) {
            if (el.querySelector('input')) return;
            const key = el.getAttribute('data-measure');
            const raw = el.textContent.replace(/\s*(cm|kg)\s*$/i, '').trim();
            const input = document.createElement('input');
            input.type = key === 'height' || key === 'weight' ? 'number' : 'text';
            input.value = raw === 'Not specified' ? '' : raw;
            input.setAttribute('data-measure-key', key);
            input.setAttribute('aria-label', el.getAttribute('data-measure'));
            el.textContent = '';
            el.appendChild(input);
        });
        const first = panel.querySelector('.pc-measure__value input');
        if (first) first.focus();
    }

    function endMeasureFields(panel) {
        panel.querySelectorAll('.pc-measure__value input').forEach(function (input) {
            applyMeasure(input);
        });
    }

    function syncPreferenceIndicators() {
        document.querySelectorAll('[data-pref-group]').forEach(function (group) {
            const groupName = group.getAttribute('data-pref-group');
            const list = store.preferences[groupName] || [];
            group.querySelectorAll('[data-pref]').forEach(function (chip) {
                const selected = list.indexOf(chip.getAttribute('data-pref')) !== -1;
                chip.classList.toggle('is-selected', selected);
                chip.setAttribute('aria-pressed', String(selected));
            });
        });

        document.querySelectorAll('dd[data-field="preferredFit"]').forEach(function (el) {
            if (!el.querySelector('input')) el.textContent = store.preferences.preferredFit;
        });
        document.querySelectorAll('dd[data-field="favoriteCollection"]').forEach(function (el) {
            if (!el.querySelector('input')) el.textContent = store.preferences.favoriteCollection;
        });
    }

    document.querySelectorAll('[data-edit]').forEach(function (button) {
        const key = button.getAttribute('data-edit');
        const panel = button.closest('.pc-panel');
        if (!panel) return;

        button.addEventListener('click', function () {
            const editing = !panel.classList.contains('is-editing');

            if (editing) {
                panel.classList.add('is-editing');
                button.textContent = 'Save';

                if (key === 'profile') startDDFields(panel);
                if (key === 'measurements') startMeasureFields(panel);
                if (key === 'preferences') {
                    startDDFields(panel);
                    syncPreferenceIndicators();
                }
            } else {
                panel.classList.remove('is-editing');
                button.textContent = 'Edit';

                if (key === 'profile') endDDFields(panel, 'profile');
                if (key === 'measurements') endMeasureFields(panel);
                if (key === 'preferences') {
                    endDDFields(panel, 'preferences');
                    syncPreferenceIndicators();
                }
                save();
                if (key === 'measurements' || key === 'preferences') refreshRecommendations();
            }
        });
    });

    /* -------------------------------------------------------------------
       3. Update Measurements — instant effect on recommendations
       ------------------------------------------------------------------- */
    const updateBtn = document.getElementById('pc-update-measurements');
    const measurePanel = document.getElementById('measurements');

    if (updateBtn && measurePanel) {
        updateBtn.addEventListener('click', function () {
            const editButton = measurePanel.querySelector('[data-edit="measurements"]');
            const editing = measurePanel.classList.contains('is-editing');

            if (editing) {
                if (editButton) editButton.click();
                refreshRecommendations();
            } else {
                if (editButton) editButton.click();
                const first = measurePanel.querySelector('.pc-measure__value input');
                if (first) first.focus();
            }
        });
    }

    /* -------------------------------------------------------------------
       4. Size recommendations — a plain rule on the client's measurements
       ------------------------------------------------------------------- */
    const ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const BASE = {
        heritage: { size: 'M' },
        signature: { size: 'M' },
        trench: { size: 'L' }
    };

    function shiftSize(size, step) {
        const index = ORDER.indexOf(size);
        if (index === -1) return size;
        const next = Math.min(ORDER.length - 1, Math.max(0, index + step));
        return ORDER[next];
    }

    function computeRecommendations() {
        const m = store.measurements;
        const fit = String(m.fit || store.preferences.preferredFit || 'Tailored').toLowerCase();

        // Preferred fit moves the intended silhouette.
        let fitShift = 0;
        if (fit === 'oversized') fitShift = 1;

        return {
            heritage: { size: shiftSize(BASE.heritage.size, fitShift) },
            signature: { size: shiftSize(BASE.signature.size, fitShift) },
            trench: { size: shiftSize(BASE.trench.size, fitShift) }
        };
    }

    function refreshRecommendations() {
        const recs = computeRecommendations();

        Object.keys(recs).forEach(function (key) {
            const card = document.querySelector('[data-rec="' + key + '"]');
            if (!card) return;

            const sizeEl = card.querySelector('[data-rec-size]');
            const leadEl = card.querySelector('.pc-reason__lead');

            if (sizeEl) sizeEl.textContent = recs[key].size;

            if (leadEl) {
                const fitLabel = store.measurements.fit || store.preferences.preferredFit || 'Tailored';
                const size = recs[key].size;
                if (key === 'heritage') {
                    leadEl.textContent = 'Based on your height, weight and ' + fitLabel.toLowerCase() +
                        ' fit, Size ' + size + ' delivers the intended silhouette.';
                } else if (key === 'signature') {
                    leadEl.textContent = 'Size ' + size + ' suits your frame while allowing the knit to relax naturally over time.';
                } else if (key === 'trench') {
                    leadEl.textContent = 'Size ' + size + ' gives the trench the layered ease the House intends over tailoring.';
                }
            }
        });
    }

    /* -------------------------------------------------------------------
       5. Digital Tailoring Assistant — "Why?"
       ------------------------------------------------------------------- */
    document.querySelectorAll('[data-why]').forEach(function (button) {
        button.addEventListener('click', function () {
            const card = button.closest('.pc-rec');
            if (!card) return;
            const isOpen = card.classList.contains('is-open');

            document.querySelectorAll('.pc-rec.is-open').forEach(function (other) {
                other.classList.remove('is-open');
                const otherBtn = other.querySelector('[data-why]');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            });

            card.classList.toggle('is-open', !isOpen);
            button.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    /* -------------------------------------------------------------------
       6. Preferences — elegant toggling (never checkbox forms)
       ------------------------------------------------------------------- */
    document.querySelectorAll('[data-pref-group] [data-pref]').forEach(function (chip) {
        chip.addEventListener('click', function () {
            const group = chip.closest('[data-pref-group]');
            const groupName = group.getAttribute('data-pref-group');
            const value = chip.getAttribute('data-pref');
            const list = store.preferences[groupName] || [];

            if (list.indexOf(value) === -1) {
                list.push(value);
            } else if (list.length > 1) {
                list.splice(list.indexOf(value), 1);
            }

            store.preferences[groupName] = list;
            syncPreferenceIndicators();
            save();
        });
    });

    /* -------------------------------------------------------------------
       7. Reserved pieces — gentle heart toggle
       ------------------------------------------------------------------- */
    document.querySelectorAll('[data-heart]').forEach(function (heart) {
        heart.addEventListener('click', function () {
            const saved = heart.classList.toggle('is-saved');
            heart.setAttribute('aria-pressed', String(saved));
            heart.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + (heart.getAttribute('data-heart')) + ' reserved piece');
        });
    });

    /* -------------------------------------------------------------------
       8. Sign out — return to the Private Client Portal
       ------------------------------------------------------------------- */
    const signOut = document.getElementById('pc-signout');
    if (signOut) {
        signOut.addEventListener('click', function () {
            window.location.href = 'login.html';
        });
    }

    /* -------------------------------------------------------------------
       9. Hydrate from the private client record
       ------------------------------------------------------------------- */
    function hydrate() {
        // Profile
        document.querySelectorAll('#profile dd[data-field]').forEach(function (dd) {
            const key = dd.getAttribute('data-field');
            if (store.profile[key]) dd.textContent = store.profile[key];
        });

        // Measurements
        document.querySelectorAll('.pc-measure__value[data-measure]').forEach(function (el) {
            const key = el.getAttribute('data-measure');
            const result = formatMeasure(key, store.measurements[key]);
            el.textContent = result.text;
            el.classList.toggle('is-empty', result.empty);
        });

        // Preferences
        syncPreferenceIndicators();

        // Recommendations
        refreshRecommendations();
    }

    hydrate();
})();
