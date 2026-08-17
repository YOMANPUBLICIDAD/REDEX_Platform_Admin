import { supabase, isSupabaseConfigured } from './supabase-config.js';

const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const logoutBtn = document.getElementById('logout-btn');
const ADMIN_EMAIL = 'admin@redexinmobiliaria.com';

function setStatus(message, type = 'info') {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.className = `admin-status ${type}`;
}

function setLoading(form, isLoading) {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = isLoading ? 'Verificando...' : button.dataset.originalText;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function requireSession() {
  if (!isSupabaseConfigured()) {
    window.location.href = 'login.html?config=missing';
    return null;
  }

  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const email = String(session.user?.email || '').toLowerCase();
  if (email !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    window.location.href = 'login.html?admin=required';
    return null;
  }

  return session;
}

export async function redirectIfAuthenticated() {
  if (!isSupabaseConfigured()) return;
  const session = await getSession();
  if (!session) return;
  const email = String(session.user?.email || '').toLowerCase();
  if (email === ADMIN_EMAIL) {
    window.location.href = 'dashboard.html';
    return;
  }
  await supabase.auth.signOut();
}

if (loginForm) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('config') === 'missing') {
    setStatus('Configura SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY antes de entrar.', 'error');
  }
  if (params.get('admin') === 'required') {
    setStatus('Cerramos una sesión no administrativa. Entra con el usuario administrador del CMS.', 'error');
  }

  redirectIfAuthenticated().catch(() => {
    setStatus('No pudimos validar la sesión actual.', 'error');
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (!isSupabaseConfigured()) {
      setStatus('Falta configurar Supabase en admin/js/supabase-config.js.', 'error');
      return;
    }

    const formData = new FormData(loginForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      setStatus('Ingresa tu correo y contraseña.', 'error');
      return;
    }

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setStatus('Este panel solo acepta el usuario administrador del CMS.', 'error');
      return;
    }

    setLoading(loginForm, true);
    setStatus('Validando acceso...', 'info');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(loginForm, false);

    if (error) {
      setStatus('Credenciales inválidas o usuario sin acceso.', 'error');
      return;
    }

    setStatus('Acceso confirmado. Entrando al panel...', 'success');
    window.location.href = 'dashboard.html';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  });
}
