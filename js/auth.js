/* ========================================================================
   ADISS — UNIFIED AUTH ENGINE
   Powers login.html (Sign In <-> Create Account inline toggle): password
   visibility, view switching, validation and submission routing.
   Vanilla JS, no dependencies.
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------
       0. Brand Preloader — fade out once the page has fully loaded
       ------------------------------------------------------------------- */
    const preloader = document.getElementById('preloader');

    function dismissPreloader() {
        if (!preloader) return;
        preloader.classList.add('is-hidden');
        preloader.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }

    if (document.readyState === 'complete') {
        window.setTimeout(dismissPreloader, 250);
    } else {
        window.addEventListener('load', () => window.setTimeout(dismissPreloader, 250));
    }

    /* -------------------------------------------------------------------
       0b. Form State Baseline — force every input to an empty string on
           load so restored autofill / test data (e.g. "Fletcher") cannot
           linger in the register form.
       ------------------------------------------------------------------- */
    const formState = {};

    document.querySelectorAll('.auth-form input, .signup-form input').forEach(field => {
        const key = field.name || field.id;
        if (!key) return;

        if (field.type === 'checkbox') {
            formState[key] = false;
            return;
        }

        formState[key] = '';
        if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
            field.value = '';
        }
    });

    /* -------------------------------------------------------------------
       0c. Small helpers
       ------------------------------------------------------------------- */
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setStatus(el, message, type) {
        if (!el) return;
        el.textContent = message || '';
        el.classList.remove('is-error', 'is-success');
        if (type) el.classList.add('is-' + type);
        el.classList.toggle('is-visible', Boolean(message));
    }

    /* -------------------------------------------------------------------
       1. Password Visibility Toggle (works on every eye button)
       ------------------------------------------------------------------- */
    document.querySelectorAll('.eye-toggle').forEach(toggle => {
        const targetId = toggle.getAttribute('data-eye');
        let input = targetId ? document.getElementById(targetId) : null;

        if (!input) {
            const wrap = toggle.closest('.password-wrap');
            input = wrap ? wrap.querySelector('input') : null;
        }
        // Fallback: an unlabelled eye toggle inside .password-wrap
        if (!input && toggle.id === 'eye-toggle') {
            input = document.getElementById('password');
        }
        if (!input) return;

        toggle.addEventListener('click', () => {
            const isVisible = input.type === 'text';

            input.type = isVisible ? 'password' : 'text';
            toggle.setAttribute('aria-pressed', String(!isVisible));
            toggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');

            const caret = input.value.length;
            input.focus();
            try {
                input.setSelectionRange(caret, caret);
            } catch (err) {
                /* not supported on every input type */
            }
        });
    });

    /* -------------------------------------------------------------------
       2. Inline View Switch — Sign In <-> Create Account (login.html)
       ------------------------------------------------------------------- */
    const viewsWrap = document.getElementById('auth-views');
    const switchLink = document.getElementById('auth-switch-link');
    const switchPrompt = document.getElementById('auth-switch-prompt');
    const views = {
        signin: document.getElementById('view-signin'),
        register: document.getElementById('view-register')
    };

    const SWITCH_COPY = {
        signin: { prompt: 'New to ADISS?', link: 'Create an Account', target: 'register' },
        register: { prompt: 'Already part of the fold?', link: 'Sign In', target: 'signin' }
    };

    function activateView(target) {
        if (!viewsWrap || !views[target]) return;

        const incoming = views[target];
        const outgoing = views.signin && views.signin.classList.contains('is-active')
            ? views.signin
            : (views.register && views.register.classList.contains('is-active') ? views.register : null);

        if (incoming === outgoing) return;

        // Lock the current height, then animate to the incoming view's height.
        const startHeight = viewsWrap.offsetHeight;
        viewsWrap.style.height = startHeight + 'px';

        if (outgoing) {
            outgoing.classList.remove('is-active');
            outgoing.setAttribute('aria-hidden', 'true');
        }
        incoming.classList.add('is-active');
        incoming.setAttribute('aria-hidden', 'false');

        const copy = SWITCH_COPY[target];
        if (switchPrompt) switchPrompt.textContent = copy.prompt;
        if (switchLink) {
            switchLink.textContent = copy.link;
            switchLink.setAttribute('data-target', copy.target);
            switchLink.setAttribute('aria-controls', 'view-' + copy.target);
            switchLink.setAttribute('aria-expanded', String(copy.target === 'signin'));
        }

        const endHeight = incoming.offsetHeight;
        requestAnimationFrame(() => {
            viewsWrap.style.height = endHeight + 'px';
        });

        const release = () => {
            viewsWrap.style.height = '';
            viewsWrap.removeEventListener('transitionend', release);
        };
        viewsWrap.addEventListener('transitionend', release);
        window.setTimeout(release, 700);

        const firstField = incoming.querySelector('input:not([type="checkbox"])');
        if (firstField) {
            window.setTimeout(() => firstField.focus({ preventScroll: true }), 320);
        }
    }

    if (viewsWrap && switchLink) {
        switchLink.addEventListener('click', () => {
            activateView(switchLink.getAttribute('data-target') || 'register');
        });

        // Deep-link support: login.html#register or ?view=register
        const requested = (
            window.location.hash.replace('#', '') ||
            new URLSearchParams(window.location.search).get('view') ||
            ''
        ).toLowerCase();

        if (['register', 'signup', 'create', 'join'].includes(requested)) {
            activateView('register');
        }
    }

    /* -------------------------------------------------------------------
       3. Form Validation & Submission
       ------------------------------------------------------------------- */
    document.querySelectorAll('.auth-form, .signup-form').forEach(form => {
        const statusEl = form.querySelector('.form-status');
        const fields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'));

        // Clear the error state as the user corrects a field.
        fields.forEach(field => {
            const evt = field.type === 'checkbox' ? 'change' : 'input';
            field.addEventListener(evt, () => {
                field.classList.remove('is-invalid', 'error');
                field.removeAttribute('aria-invalid');
                if (statusEl && statusEl.classList.contains('is-error')) {
                    setStatus(statusEl, '', null);
                }
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            let firstInvalid = null;

            fields.forEach(field => {
                const value = (field.value || '').trim();
                let invalid = false;

                if (field.type === 'checkbox') {
                    invalid = !field.checked;
                } else if (field.type === 'email') {
                    invalid = !EMAIL_PATTERN.test(value);
                } else if (field.type === 'password') {
                    invalid = value.length < 8;
                } else {
                    invalid = value.length === 0;
                }

                if (invalid) {
                    field.classList.add('is-invalid');
                    field.setAttribute('aria-invalid', 'true');
                    firstInvalid = firstInvalid || field;
                } else {
                    field.classList.remove('is-invalid');
                    field.removeAttribute('aria-invalid');
                }
            });

            if (firstInvalid) {
                setStatus(statusEl, 'Please complete the highlighted fields to continue.', 'error');
                firstInvalid.focus();
                return;
            }

            const submitBtn = form.querySelector('.btn-cultivate');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Please wait…';
            }
            setStatus(statusEl, 'One moment — preparing your private atelier…', 'success');

            const destination = form.getAttribute('data-success') || 'thank-you.html';
            window.setTimeout(() => {
                window.location.href = destination;
            }, 1000);
        });
    });

    /* -------------------------------------------------------------------
       4. Forgot Password
       ------------------------------------------------------------------- */
    const forgotLink = document.getElementById('forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', (event) => {
            event.preventDefault();
            const form = forgotLink.closest('form');
            const statusEl = form ? form.querySelector('.form-status') : null;
            setStatus(statusEl, 'A password reset link has been dispatched to your email address.', 'success');
        });
    }

    /* -------------------------------------------------------------------
       5. Social Auth Feedback
       ------------------------------------------------------------------- */
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.getAttribute('data-provider') || 'provider';
            const form = btn.closest('form');
            const statusEl = form ? form.querySelector('.form-status') : null;
            setStatus(statusEl, 'Connecting to ' + provider + '…', 'success');
        });
    });
});
