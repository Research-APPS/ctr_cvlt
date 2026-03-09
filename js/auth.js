/**
 * auth.js — Autenticación simulada
 * Usuarios hardcoded, sesión en localStorage.
 */

const Auth = (() => {
  // Usuarios de prueba
  const DEMO_USERS = [
    {
      id: 'user-001',
      email: 'user@demo.com',
      password: '1234',
      name: 'Ana García',
      role: 'user',
      avatar: 'AG',
    },
    {
      id: 'admin-001',
      email: 'admin@demo.com',
      password: '1234',
      name: 'Carlos López',
      role: 'admin',
      avatar: 'CL',
    },
  ];

  function login(email, password) {
    const user = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: 'Email o contraseña incorrectos' };
    const { password: _, ...safe } = user;
    Store.user.set(safe);
    return { ok: true, user: safe };
  }

  function logout() {
    Store.user.clear();
    window.location.href = '/index.html';
  }

  function requireLogin(redirectBack = true) {
    if (!Store.user.isLoggedIn()) {
      const current = encodeURIComponent(window.location.href);
      window.location.href = redirectBack
        ? `login.html?next=${current}`
        : 'login.html';
      return false;
    }
    return true;
  }

  function requireAdmin() {
    if (!Store.user.isAdmin()) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }

  return { login, logout, requireLogin, requireAdmin, DEMO_USERS };
})();

window.Auth = Auth;
