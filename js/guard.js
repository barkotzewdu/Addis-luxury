/* ========================================================================
   ADISS - PRIVATE CLIENT ROUTE GUARD
   The site is still a front-end simulation, but the salon should never be
   shown without a stored session. Loaded in <head> so the redirect happens
   before the private client page paints.
   ======================================================================== */
(function () {
    'use strict';

    function readSession() {
        try {
            const raw = window.localStorage.getItem('addis_session');
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && parsed.email ? parsed : null;
        } catch (err) {
            return null;
        }
    }

    if (!readSession()) {
        window.location.replace('login.html?next=account.html');
    }
})();
