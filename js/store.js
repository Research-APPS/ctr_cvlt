/**
 * store.js — Capa de acceso a localStorage
 * Todos los accesos a datos persistidos pasan por aquí.
 */

const Store = (() => {
  const KEYS = {
    USER:          'escena_user',
    CART:          'escena_cart',
    PURCHASES:     'escena_purchases',
    FAVORITES:     'escena_favorites',
    ADMIN_EVENTS:  'escena_admin_events',
    DEMO_BANNER:   'escena_demo_banner',
    VALIDATIONS:   'escena_validations',
  };

  // ─── Generic helpers ──────────────────────────────────────
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('Store.set error:', e); }
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  // ─── User / Session ───────────────────────────────────────
  const user = {
    get:    ()      => get(KEYS.USER),
    set:    (u)     => set(KEYS.USER, u),
    clear:  ()      => remove(KEYS.USER),
    isAdmin:()      => get(KEYS.USER)?.role === 'admin',
    isLoggedIn: ()  => !!get(KEYS.USER),
  };

  // ─── Cart ─────────────────────────────────────────────────
  const cart = {
    get: () => get(KEYS.CART, []),
    set: (items) => set(KEYS.CART, items),
    add: (item) => {
      const items = get(KEYS.CART, []);
      const existing = items.find(i => i.ticket_type_id === item.ticket_type_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        items.push(item);
      }
      set(KEYS.CART, items);
    },
    remove: (ticket_type_id) => {
      const items = get(KEYS.CART, []).filter(i => i.ticket_type_id !== ticket_type_id);
      set(KEYS.CART, items);
    },
    clear: () => set(KEYS.CART, []),
    count: () => get(KEYS.CART, []).reduce((sum, i) => sum + i.quantity, 0),
    total: () => get(KEYS.CART, []).reduce((sum, i) => sum + (i.price * i.quantity), 0),
  };

  // ─── Purchases ────────────────────────────────────────────
  const purchases = {
    get: () => get(KEYS.PURCHASES, []),
    add: (order) => {
      const all = get(KEYS.PURCHASES, []);
      all.unshift(order);
      set(KEYS.PURCHASES, all);
    },
    clear: () => set(KEYS.PURCHASES, []),
  };

  // ─── Favorites ────────────────────────────────────────────
  const favorites = {
    get: ()         => get(KEYS.FAVORITES, []),
    toggle: (id)    => {
      const favs = get(KEYS.FAVORITES, []);
      const idx = favs.indexOf(id);
      if (idx >= 0) favs.splice(idx, 1);
      else favs.push(id);
      set(KEYS.FAVORITES, favs);
      return idx < 0; // returns true if added
    },
    has: (id)       => get(KEYS.FAVORITES, []).includes(id),
    clear: ()       => set(KEYS.FAVORITES, []),
  };

  // ─── Admin events (created in the demo) ───────────────────
  const adminEvents = {
    get: ()       => get(KEYS.ADMIN_EVENTS, []),
    add: (ev)     => {
      const all = get(KEYS.ADMIN_EVENTS, []);
      const idx = all.findIndex(e => e.id === ev.id);
      if (idx >= 0) all[idx] = ev;
      else all.unshift(ev);
      set(KEYS.ADMIN_EVENTS, all);
    },
    remove: (id)  => {
      const filtered = get(KEYS.ADMIN_EVENTS, []).filter(e => e.id !== id);
      set(KEYS.ADMIN_EVENTS, filtered);
    },
    toggleStatus: (id) => {
      const all = get(KEYS.ADMIN_EVENTS, []);
      const ev = all.find(e => e.id === id);
      if (ev) {
        ev.status = ev.status === 'published' ? 'draft' : 'published';
        set(KEYS.ADMIN_EVENTS, all);
      }
    },
  };

  // ─── Validations (ticket scanning) ───────────────────────
  const validations = {
    get: () => get(KEYS.VALIDATIONS, {}),
    validate: (orderId) => {
      const all = get(KEYS.VALIDATIONS, {});
      if (all[orderId]) return false; // ya usada
      all[orderId] = { validated: true, validated_at: new Date().toISOString() };
      set(KEYS.VALIDATIONS, all);
      return true;
    },
    isUsed: (orderId) => !!get(KEYS.VALIDATIONS, {})[orderId],
    clear: () => set(KEYS.VALIDATIONS, {}),
  };

  return { user, cart, purchases, favorites, adminEvents, validations };
})();

// Make globally available
window.Store = Store;
