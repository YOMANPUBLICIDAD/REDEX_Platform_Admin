import { supabase } from './admin/js/supabase-config.js';

async function validateAdvisor(email) {
  const { data, error } = await supabase
    .from('asesores')
    .select('id,estado,email')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Este usuario no está registrado como asesor REDEX.');
  if (data.estado !== 'activo') throw new Error(`Tu perfil de asesor está en estado: ${data.estado}.`);
}

window.handlePortalLogin = async function handlePortalLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = document.getElementById('login-btn');
  const status = document.getElementById('portal-status');
  const email = document.getElementById('p-email')?.value?.trim();
  const password = document.getElementById('p-pass')?.value || '';
  if (!email || !password) return;

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Verificando...';
  }
  if (status) {
    status.textContent = '';
    status.className = 'f-status';
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await validateAdvisor(email);
    window.location.href = 'portal-asesor.html';
  } catch (error) {
    await supabase.auth.signOut();
    if (status) {
      status.textContent = error.message || 'No se pudo iniciar sesión.';
      status.className = 'f-status err';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Ingresar al Portal';
    }
    if (form) form.querySelector('input[type="password"]')?.focus();
  }
};
