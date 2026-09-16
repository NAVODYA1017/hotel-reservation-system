/* ==========================================================================
   UC-06 Administration & Reporting - shared page code
   - session: email + password sign-in, token sent as "Authorization: Bearer <token>"
   - API helper, header / nav / footer, formatting, charts, dialogs, toasts
   ========================================================================== */
const Mgmt = (() => {

    // Works when served by Spring Boot (same origin) and when opened as a local file.
    const API_BASE = location.protocol === 'file:' ? 'http://localhost:8080' : '';

    const ADMIN_ROLES = ['HOTEL_MANAGER', 'SYSTEM_ADMIN'];
    const REPORT_ROLES = ['HOTEL_MANAGER', 'SYSTEM_ADMIN', 'FINANCE_EXECUTIVE'];

    const ROLE_LABELS = {
        CUSTOMER: 'Customer',
        RECEPTIONIST: 'Receptionist',
        EVENT_COORDINATOR: 'Event Coordinator',
        HOTEL_MANAGER: 'Hotel Manager',
        SYSTEM_ADMIN: 'System Administrator',
        FINANCE_EXECUTIVE: 'Finance Executive'
    };

    // Navigation: key, label, href, roles allowed to see it
    const NAV = [
        { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', roles: REPORT_ROLES },
        { key: 'reports', label: 'Reports', href: 'reports.html', roles: REPORT_ROLES },
        { key: 'users', label: 'Users & Roles', href: 'users.html', roles: ADMIN_ROLES },
        { key: 'settings', label: 'System Settings', href: 'settings.html', roles: ADMIN_ROLES },
        { key: 'reservations', label: 'Reservations', href: '../admin.html', roles: ADMIN_ROLES, external: true }
    ];

    // ── Storage (wrapped: may be unavailable in private mode) ───────────────
    const store = {
        get(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { sessionStorage.setItem(key, value); } catch (e) { /* ignore */ } },
        remove(key) { try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ } },
        getLocal(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        setLocal(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
    };

    let currentUser = null;

    // ── Escaping: every API value goes through esc() before touching innerHTML ──
    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ── API ────────────────────────────────────────────────────────────────
    class ApiError extends Error {
        constructor(status, message) { super(message); this.status = status; }
    }

    async function api(path, { method = 'GET', body } = {}) {
        const headers = { 'Accept': 'application/json' };
        const token = store.get('mgmt.token');
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (body !== undefined) headers['Content-Type'] = 'application/json';

        let response;
        try {
            response = await fetch(API_BASE + path, {
                method, headers, body: body !== undefined ? JSON.stringify(body) : undefined
            });
        } catch (networkError) {
            throw new ApiError(0, 'Cannot reach the server. Make sure the Spring Boot application is running on port 8080.');
        }

        const text = await response.text();
        let data = null;
        if (text) {
            try { data = JSON.parse(text); } catch (e) { data = text; }
        }
        if (!response.ok) {
            const message = (data && data.message) || (typeof data === 'string' && data) || `Request failed (${response.status})`;
            // Session missing/expired while using a page → back to the sign-in form
            if (response.status === 401 && token && !path.startsWith('/api/admin/auth/')) {
                clearSession();
                goToLogin(message);
            }
            throw new ApiError(response.status, message);
        }
        return data;
    }

    // ── Session ────────────────────────────────────────────────────────────
    // Called by login.html with the response of POST /api/admin/auth/login
    function signIn(loginResponse) {
        store.set('mgmt.token', loginResponse.token);
        store.set('mgmt.user', JSON.stringify(loginResponse.user));
    }

    function clearSession() {
        store.remove('mgmt.token');
        store.remove('mgmt.user');
    }

    async function signOut() {
        try { await api('/api/admin/auth/logout', { method: 'POST' }); } catch (e) { /* already signed out */ }
        clearSession();
        location.href = 'login.html';
    }

    function goToLogin(message) {
        const next = location.pathname.split('/').pop() + location.search;
        const params = new URLSearchParams({ next });
        if (message) params.set('msg', message);
        location.href = 'login.html?' + params.toString();
    }

    /**
     * Call first on every protected page.
     * Verifies the stored user with the server, draws the header/footer and
     * returns the user - or shows "access denied" (UC-06 extension 1a) and returns null.
     */
    async function init({ page, roles = REPORT_ROLES }) {
        drawChrome(page, null);

        if (!store.get('mgmt.token')) {
            goToLogin();
            return null;
        }

        try {
            currentUser = await api('/api/admin/users/me');
            store.set('mgmt.user', JSON.stringify(currentUser));
        } catch (err) {
            if (err.status === 401 || err.status === 403) {
                clearSession();
                goToLogin(err.message);
                return null;
            }
            // Server down etc. - show the error in the page body
            drawChrome(page, null);
            showPageError(err);
            return null;
        }

        drawChrome(page, currentUser);
        loadBranding();

        if (!roles.includes(currentUser.role)) {
            showAccessDenied();
            return null;
        }
        return currentUser;
    }

    function user() { return currentUser; }
    function isAdmin(u = currentUser) { return !!u && ADMIN_ROLES.includes(u.role); }

    // ── Branding pulled from System Settings (cached for non-admin roles) ──
    function hotelName() { return store.getLocal('mgmt.hotelName') || 'Grand Horizon Hotel'; }
    function currency() { return store.getLocal('mgmt.currency') || 'LKR'; }

    async function loadBranding() {
        if (!isAdmin()) return;
        try {
            const settings = await api('/api/admin/settings');
            applyBranding(settings);
        } catch (e) { /* branding is optional */ }
    }

    function applyBranding(settings) {
        const byKey = Object.fromEntries(settings.map(s => [s.key, s.value]));
        if (byKey['hotel.name']) store.setLocal('mgmt.hotelName', byKey['hotel.name']);
        if (byKey['currency']) store.setLocal('mgmt.currency', byKey['currency']);
        document.querySelectorAll('[data-hotel-name]').forEach(n => { n.textContent = hotelName(); });
        document.title = document.title.replace(/·.*$/, '· ' + hotelName());
    }

    // ── Header, navigation, footer ─────────────────────────────────────────
    const ORNAMENT = `<svg class="ornament" viewBox="0 0 32 32" aria-hidden="true">
        <g fill="currentColor">${[0, 60, 120, 180, 240, 300].map(a =>
            `<ellipse cx="16" cy="8.5" rx="3.2" ry="7" transform="rotate(${a} 16 16)" opacity=".9"/>`).join('')}
        <circle cx="16" cy="16" r="2.6" fill="#fff"/></g></svg>`;

    function drawChrome(activePage, u) {
        const chrome = document.getElementById('chrome');
        if (chrome) {
            const links = NAV.filter(item => !u || item.roles.includes(u.role));
            chrome.innerHTML = `
                <div class="topbar">
                    <div class="topbar-inner">
                        <span class="topbar-title">Administration &amp; Reporting</span>
                        <div class="topbar-user">
                            ${u ? `<span>${esc(u.name)}</span><span class="sep">|</span>
                                   <span>${esc(ROLE_LABELS[u.role] || u.role)}</span><span class="sep">|</span>
                                   <button type="button" id="signOutBtn">Sign out</button>` : '<span>&nbsp;</span>'}
                        </div>
                    </div>
                </div>
                <header class="site-header">
                    <div class="header-inner">
                        <button class="menu-toggle" type="button" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav">
                            <span></span><span></span><span></span>
                        </button>
                        <div class="header-left">Management Suite</div>
                        <a class="brand" href="dashboard.html">
                            <span class="brand-name" data-hotel-name>${esc(hotelName())}</span>
                            <span class="brand-sub">Hotels &amp; Events · Admin</span>
                        </a>
                        <div class="header-right">
                            <a class="btn btn-primary" href="../index.html">View website</a>
                        </div>
                    </div>
                    <nav class="main-nav" id="mainNav" aria-label="Administration">
                        <ul>
                            ${links.map(item => `<li><a href="${item.href}"
                                class="${item.key === activePage ? 'active' : ''} ${item.external ? 'external' : ''}"
                                ${item.key === activePage ? 'aria-current="page"' : ''}>${item.label}</a></li>`).join('')}
                        </ul>
                    </nav>
                </header>`;

            const toggle = document.getElementById('menuToggle');
            toggle.addEventListener('click', () => {
                const nav = document.getElementById('mainNav');
                const open = nav.classList.toggle('open');
                toggle.setAttribute('aria-expanded', String(open));
            });
            const signOutBtn = document.getElementById('signOutBtn');
            if (signOutBtn) signOutBtn.addEventListener('click', signOut);
        }

        const footer = document.getElementById('footer');
        if (footer) {
            const links = NAV.filter(item => !u || item.roles.includes(u.role));
            footer.innerHTML = `
                <footer class="site-footer">
                    <div class="footer-inner">
                        <div>
                            <div class="footer-brand" data-hotel-name>${esc(hotelName())}</div>
                            <p style="margin-top:8px;font-size:14px;max-width:360px">
                                Monitor hotel operations, review reservation and revenue reports,
                                and manage accounts and system settings.</p>
                        </div>
                        <div>
                            <h4>Administration</h4>
                            <ul>${links.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}</ul>
                        </div>
                        <div>
                            <h4>Reports</h4>
                            <ul>
                                <li><a href="reservation-report.html">Reservation report</a></li>
                                <li><a href="revenue-report.html">Revenue report</a></li>
                                <li><a href="../index.html">Guest website</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">UC-06 Administration &amp; Reporting Management</div>
                </footer>
                <div class="toast-stack" id="toastStack" aria-live="polite"></div>
                <div class="tooltip" id="chartTooltip" role="tooltip"></div>`;
        }
    }

    function pageBody() { return document.getElementById('pageBody'); }

    function showAccessDenied() {
        const body = pageBody();
        if (!body) return;
        body.innerHTML = `
            <div class="container">
                <div class="state denied">
                    ${ORNAMENT}
                    <h3>Access denied</h3>
                    <p>Your role (${esc(ROLE_LABELS[currentUser.role] || currentUser.role)}) does not have
                       administrator privileges for this page.</p>
                    <a class="btn btn-primary" href="${currentUser && REPORT_ROLES.includes(currentUser.role) ? 'dashboard.html' : 'login.html'}">Go back</a>
                </div>
            </div>`;
    }

    function showPageError(err) {
        const body = pageBody();
        if (!body) return;
        body.innerHTML = `
            <div class="container section">
                ${errorState(err.message, 'Try again')}
            </div>`;
        body.querySelector('[data-retry]').addEventListener('click', () => location.reload());
    }

    // ── Reusable fragments ─────────────────────────────────────────────────
    function errorState(message, retryLabel = 'Retry') {
        return `<div class="state">
                    ${ORNAMENT}
                    <h3>Something went wrong</h3>
                    <p>${esc(message)}</p>
                    <button class="btn btn-primary" type="button" data-retry>${esc(retryLabel)}</button>
                </div>`;
    }

    function emptyState(title, message) {
        return `<div class="state">${ORNAMENT}<h3>${esc(title)}</h3><p>${esc(message)}</p></div>`;
    }

    function alertBox(type, message) {
        const icons = { error: '!', success: '✓', warning: '!', info: 'i' };
        return `<div class="alert alert-${type}" role="${type === 'error' ? 'alert' : 'status'}">
                    <span class="icon" aria-hidden="true">${icons[type] || 'i'}</span>
                    <div class="alert-body">${esc(message)}</div>
                </div>`;
    }

    function statusBadge(status) {
        const label = String(status || '').replace(/_/g, ' ').toLowerCase();
        return `<span class="badge s-${esc(status)}">${esc(label)}</span>`;
    }

    function roleBadge(role) {
        return `<span class="badge role r-${esc(role)}">${esc(ROLE_LABELS[role] || role)}</span>`;
    }

    // ── Formatting ─────────────────────────────────────────────────────────
    function money(value, { compact = false } = {}) {
        const n = Number(value || 0);
        if (compact && n === 0) return currency() + ' 0';
        if (compact && Math.abs(n) >= 1000) {
            return currency() + ' ' + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
        }
        return currency() + ' ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function number(value) { return Number(value || 0).toLocaleString('en-US'); }

    // "1 room" / "2 rooms"
    function plural(count, singular, pluralForm = singular + 's') {
        return `${number(count)} ${Number(count) === 1 ? singular : pluralForm}`;
    }

    function date(value) {
        if (!value) return '—';
        const d = new Date(String(value).length === 10 ? value + 'T00:00:00' : value);
        return isNaN(d) ? esc(value) : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function dateTime(value) {
        if (!value) return '—';
        const d = new Date(value);
        return isNaN(d) ? esc(value) : d.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    function isoDate(d) {
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function titleCase(value) {
        return String(value || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    // Date range presets shared by the report pages
    function presetRange(name) {
        const today = new Date();
        const y = today.getFullYear(), m = today.getMonth();
        switch (name) {
            case 'this-month': return [new Date(y, m, 1), today];
            case 'last-month': return [new Date(y, m - 1, 1), new Date(y, m, 0)];
            case 'last-30': { const s = new Date(today); s.setDate(s.getDate() - 29); return [s, today]; }
            case 'this-year': return [new Date(y, 0, 1), new Date(y, 11, 31)];
            case 'next-90': { const e = new Date(today); e.setDate(e.getDate() + 90); return [today, e]; }
            default: return [new Date(y, m, 1), today];
        }
    }

    // ── Toasts ─────────────────────────────────────────────────────────────
    function toast(message, type = 'success') {
        const stack = document.getElementById('toastStack');
        if (!stack) return;
        const node = document.createElement('div');
        node.className = 'toast ' + type;
        node.textContent = message;
        stack.appendChild(node);
        setTimeout(() => node.remove(), 4200);
    }

    // ── Confirm dialog (Promise<boolean>) ──────────────────────────────────
    function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false }) {
        return new Promise(resolve => {
            const dlg = document.createElement('dialog');
            dlg.className = 'modal';
            dlg.innerHTML = `
                <div class="modal-head"><h2>${esc(title)}</h2>
                    <button class="modal-close" type="button" aria-label="Close" value="cancel">&times;</button></div>
                <div class="modal-body">
                    <p>${esc(message)}</p>
                    <div class="form-actions">
                        <button class="btn" type="button" data-answer="no">Cancel</button>
                        <button class="btn ${danger ? 'btn-danger solid' : 'btn-primary'}" type="button" data-answer="yes">${esc(confirmLabel)}</button>
                    </div>
                </div>`;
            document.body.appendChild(dlg);
            const finish = answer => { dlg.close(); dlg.remove(); resolve(answer); };
            dlg.querySelector('[data-answer="yes"]').addEventListener('click', () => finish(true));
            dlg.querySelector('[data-answer="no"]').addEventListener('click', () => finish(false));
            dlg.querySelector('.modal-close').addEventListener('click', () => finish(false));
            dlg.addEventListener('cancel', e => { e.preventDefault(); finish(false); });
            dlg.showModal();
        });
    }

    // ── Chart tooltip ──────────────────────────────────────────────────────
    function bindTooltip(target, valueText, labelText) {
        const show = (x, y) => {
            const tip = document.getElementById('chartTooltip');
            if (!tip) return;
            tip.innerHTML = '';
            const strong = document.createElement('strong');
            strong.textContent = valueText;
            const span = document.createElement('span');
            span.textContent = labelText;
            tip.append(strong, span);
            const w = tip.offsetWidth || 160;
            tip.style.left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8) + 'px';
            tip.style.top = Math.max(8, y - 64) + 'px';
            tip.classList.add('show');
        };
        const hide = () => { const tip = document.getElementById('chartTooltip'); if (tip) tip.classList.remove('show'); };
        target.addEventListener('pointermove', e => show(e.clientX, e.clientY));
        target.addEventListener('pointerleave', hide);
        target.addEventListener('focus', () => {
            const r = target.getBoundingClientRect();
            show(r.left + r.width / 2, r.top + 20);
        });
        target.addEventListener('blur', hide);
    }

    /**
     * Horizontal bar list - single series, so no legend box; values are labelled at the bar tip.
     * items: [{ label, value, display }]
     */
    function hbarChart(container, items, { format = number } = {}) {
        const max = Math.max(0, ...items.map(i => Number(i.value) || 0));
        container.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'hbar-list';
        items.forEach(item => {
            const v = Number(item.value) || 0;
            const row = document.createElement('div');
            row.className = 'hbar-row bar-hit';
            row.tabIndex = 0;
            row.setAttribute('aria-label', `${item.label}: ${format(v)}`);

            const label = document.createElement('span');
            label.className = 'hbar-label';
            label.textContent = item.label;

            const track = document.createElement('div');
            track.className = 'hbar-track';
            const fill = document.createElement('div');
            fill.className = 'hbar-fill' + (v === 0 ? ' zero' : '');
            fill.style.width = '0%';
            track.appendChild(fill);

            const value = document.createElement('span');
            value.className = 'hbar-value';
            value.textContent = format(v);

            row.append(label, track, value);
            list.appendChild(row);
            bindTooltip(row, format(v), item.label);
            requestAnimationFrame(() => { fill.style.width = (max ? Math.max(1, (v / max) * 100) : 0) + '%'; });
        });
        container.appendChild(list);
    }

    // Round an axis maximum up to a clean number (0 / 5,000 / 10,000 ...)
    function niceMax(value) {
        if (value <= 0) return 1;
        const exp = Math.pow(10, Math.floor(Math.log10(value)));
        const f = value / exp;
        const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
        return nice * exp;
    }

    /**
     * Column chart for a time series - single series, clean y ticks, hover/focus tooltip on each column.
     * points: [{ label (axis), tooltipLabel, value }]
     */
    function columnChart(container, points, { format = number, tickFormat = format } = {}) {
        container.innerHTML = '';
        const max = niceMax(Math.max(0, ...points.map(p => Number(p.value) || 0)));
        const wrap = document.createElement('div');
        wrap.className = 'col-chart';

        const grid = document.createElement('div');
        grid.className = 'col-grid';
        [0, 0.25, 0.5, 0.75, 1].forEach(t => {
            const gl = document.createElement('div');
            gl.className = 'gl';
            gl.style.bottom = (t * 100) + '%';
            const span = document.createElement('span');
            span.textContent = tickFormat(max * t);
            gl.appendChild(span);
            grid.appendChild(gl);
        });

        const plot = document.createElement('div');
        plot.className = 'col-plot';
        const axis = document.createElement('div');
        axis.className = 'col-axis';
        const labelEvery = Math.max(1, Math.ceil(points.length / 10));

        points.forEach((p, i) => {
            const v = Number(p.value) || 0;
            const slot = document.createElement('div');
            slot.className = 'col-slot';
            slot.tabIndex = 0;
            slot.setAttribute('aria-label', `${p.tooltipLabel || p.label}: ${format(v)}`);
            const bar = document.createElement('div');
            bar.className = 'col-bar';
            bar.style.height = v > 0 ? Math.max(1, (v / max) * 100) + '%' : '0';
            if (v === 0) bar.style.minHeight = '0';
            slot.appendChild(bar);
            plot.appendChild(slot);
            bindTooltip(slot, format(v), p.tooltipLabel || p.label);

            const tick = document.createElement('span');
            tick.textContent = i % labelEvery === 0 ? p.label : '';
            axis.appendChild(tick);
        });

        wrap.append(grid, plot, axis);
        container.appendChild(wrap);
    }

    // ── CSV export ─────────────────────────────────────────────────────────
    function downloadCsv(filename, headers, rows) {
        const cell = v => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const csv = [headers, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return {
        API_BASE, ADMIN_ROLES, REPORT_ROLES, ROLE_LABELS, ORNAMENT, ApiError,
        api, init, user, isAdmin, signIn, signOut, store,
        esc, errorState, emptyState, alertBox, statusBadge, roleBadge,
        money, number, plural, date, dateTime, isoDate, titleCase, presetRange,
        toast, confirmDialog, hbarChart, columnChart, downloadCsv, applyBranding, hotelName
    };
})();
