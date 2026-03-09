/**
 * ui.js — Componentes de UI reutilizables (navbar, footer, toast)
 */

const UI = (() => {

  // ─── Navbar ───────────────────────────────────────────────
  function renderNavbar(opts = {}) {
    const { base = '.', activePage = '' } = opts;
    const user = Store.user.get();
    const cartCount = Store.cart.count();

    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const isAdmin = user?.role === 'admin';

    nav.innerHTML = `
      <div class="navbar__inner">
        <a href="${base}/index.html" class="navbar__logo">ESCENA</a>
        <nav class="navbar__nav">
          <a href="${base}/index.html" class="${activePage === 'home' ? 'active' : ''}">Conciertos</a>
          ${isAdmin ? `<a href="${base}/admin/index.html" class="${activePage === 'admin' ? 'active' : ''}">Panel</a>` : ''}
        </nav>
        <div class="navbar__actions">
          <button class="navbar__cart" onclick="window.location.href='${base}/profile.html'" title="Mi perfil / entradas">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
            </svg>
            ${cartCount > 0 ? `<span class="navbar__cart-count">${cartCount}</span>` : ''}
          </button>
          ${user
            ? `<div class="navbar__user" onclick="window.location.href='${base}/profile.html'">
                <div class="navbar__avatar">${user.avatar || user.name.charAt(0)}</div>
                <span class="hide-mobile">${user.name.split(' ')[0]}</span>
               </div>`
            : `<a href="${base}/login.html" class="btn btn--secondary btn--sm">Entrar</a>`
          }
          <button class="navbar__hamburger" id="hamburger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="navbar__mobile-menu" id="mobileMenu">
        <a href="${base}/index.html">Conciertos</a>
        ${isAdmin ? `<a href="${base}/admin/index.html">Panel admin</a>` : ''}
        ${user
          ? `<a href="${base}/profile.html">Mi perfil (${user.name.split(' ')[0]})</a>
             <a href="#" onclick="Auth.logout()">Cerrar sesión</a>`
          : `<a href="${base}/login.html">Iniciar sesión</a>`
        }
      </div>`;

    // Hamburger toggle
    document.getElementById('hamburger')?.addEventListener('click', () => {
      document.getElementById('mobileMenu')?.classList.toggle('open');
    });
  }

  // ─── Footer ───────────────────────────────────────────────
  function renderFooter(opts = {}) {
    const { base = '.' } = opts;
    const footer = document.querySelector('.footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <span class="navbar__logo">ESCENA</span>
            <p>La plataforma de ticketing para promotoras independientes.<br>Vende entradas sin intermediarios.</p>
          </div>
          <div class="footer__col">
            <h4>Descubrir</h4>
            <ul>
              <li><a href="${base}/index.html">Conciertos</a></li>
              <li><a href="${base}/index.html?filter=Madrid">Madrid</a></li>
              <li><a href="${base}/index.html?filter=Barcelona">Barcelona</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4>Ayuda</h4>
            <ul>
              <li><a href="#">Cómo funciona</a></li>
              <li><a href="#">Política de devolución</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4>Promotoras</h4>
            <ul>
              <li><a href="${base}/admin/index.html">Panel de gestión</a></li>
              <li><a href="#">Precios</a></li>
              <li><a href="#">Documentación</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <p>© 2026 ESCENA · <a href="#">Términos</a> · <a href="#">Privacidad</a></p>
          <p style="color:var(--accent);font-size:var(--text-xs);font-weight:600">⚡ DEMO — Datos simulados. Sin pagos reales.</p>
        </div>
      </div>`;
  }

  // ─── Toast ────────────────────────────────────────────────
  let toastTimeout;
  function toast(msg, type = '') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = `toast ${type ? 'toast--'+type : ''}`;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), 3000);
  }

  // ─── Demo banner ──────────────────────────────────────────
  function renderDemoBanner() {
    if (sessionStorage.getItem('banner_closed')) return;
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 500;
      background: rgba(200,255,0,0.08); border-top: 1px solid rgba(200,255,0,0.2);
      padding: 10px 24px; display: flex; align-items: center;
      justify-content: space-between; gap: 16px; font-size: 13px; color: #9a9a9a;
      backdrop-filter: blur(8px); flex-wrap: wrap;
    `;
    banner.innerHTML = `
      <span>
        <strong style="color:#c8ff00">⚡ Demo interactivo</strong> —
        Datos simulados. Usa <strong style="color:#f5f5f5">user@demo.com</strong> / <strong style="color:#f5f5f5">admin@demo.com</strong> con contraseña <strong style="color:#f5f5f5">1234</strong>.
      </span>
      <button onclick="this.parentElement.remove(); sessionStorage.setItem('banner_closed','1')"
        style="background:transparent;border:1px solid #2a2a2a;color:#9a9a9a;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;flex-shrink:0">
        Cerrar
      </button>`;
    document.body.appendChild(banner);
  }

  // ─── FAQ accordion ────────────────────────────────────────
  function initFAQ(container) {
    container?.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        item.classList.toggle('open');
      });
    });
  }

  // ─── Countdown ────────────────────────────────────────────
  function startCountdown(dateStr, containerSelector) {
    const el = document.querySelector(containerSelector);
    if (!el) return;

    function update() {
      const parts = Data.getCountdownParts(dateStr);
      if (!parts) {
        el.innerHTML = '<span style="color:var(--text-muted)">El evento ya ha comenzado</span>';
        return;
      }
      el.innerHTML = `
        <div class="countdown__unit"><span class="countdown__value">${String(parts.days).padStart(2,'0')}</span><span class="countdown__label">días</span></div>
        <span class="countdown__sep">:</span>
        <div class="countdown__unit"><span class="countdown__value">${String(parts.hours).padStart(2,'0')}</span><span class="countdown__label">horas</span></div>
        <span class="countdown__sep">:</span>
        <div class="countdown__unit"><span class="countdown__value">${String(parts.minutes).padStart(2,'0')}</span><span class="countdown__label">min</span></div>
        <span class="countdown__sep">:</span>
        <div class="countdown__unit"><span class="countdown__value">${String(parts.seconds).padStart(2,'0')}</span><span class="countdown__label">seg</span></div>`;
    }

    update();
    return setInterval(update, 1000);
  }

  return { renderNavbar, renderFooter, toast, renderDemoBanner, initFAQ, startCountdown };
})();

window.UI = UI;
