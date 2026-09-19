/**
 * ADISS — Analytics bootstrap (CSP-safe)
 * Consent defaults run first, then GA4 loads only after consent is granted.
 */
(function () {
    'use strict';

    var STORAGE = 'addis_cookie_consent';

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
        window.dataLayer.push(arguments);
    };

    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });

    function readConsent() {
        try {
            var raw = localStorage.getItem(STORAGE);
            if (!raw) return null;
            var value = JSON.parse(raw);
            return value && typeof value === 'object' ? value : null;
        } catch (err) {
            return null;
        }
    }

    var CONSENT_GRANTED = 'granted';

    function loadAnalytics() {
        if (document.getElementById('ga4-script')) return;
        var script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(script);
    }

    function applyConsent(consent) {
        if (!consent) return;
        var granted = consent.analytics === true;
        gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: granted ? CONSENT_GRANTED : 'denied'
        });
        if (granted) loadAnalytics();
    }

    applyConsent(readConsent());

    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE) applyConsent(readConsent());
    });
})();
