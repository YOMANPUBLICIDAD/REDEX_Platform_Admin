import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export { createClient };

export const SUPABASE_URL = 'https://uwcxkwwtvvsplcnlncfd.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZeMpdNfPRtxuALkJgnQf3g_G1xm50Th';

export const PROPERTIES_TABLE = 'propiedades';
export const PROPERTIES_BUCKET = 'propiedades';
export const PROJECTS_TABLE = 'proyectos';
export const PROJECTS_BUCKET = 'proyectos';
export const WEB_PAGES_TABLE = 'paginas';
export const WEB_SECTIONS_TABLE = 'secciones';
export const WEB_CONTENT_BUCKET = 'contenido-web';
export const SALES_TABLE = 'ventas';
export const SALES_LINKS_TABLE = 'ventas_links';
export const SALES_REPORTS_TABLE = 'ventas_reportadas';
export const LEADS_TABLE = 'solicitudes';
export const LEADS_BUCKET = 'solicitudes';
export const ADVISORS_TABLE = 'asesores';

const configured =
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_URL.includes('SUPABASE_URL') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('SUPABASE_PUBLISHABLE_KEY');

const clientUrl = configured ? SUPABASE_URL : 'https://redex-config-required.supabase.co';
const clientKey = configured ? SUPABASE_PUBLISHABLE_KEY : 'redex-config-required-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export function isSupabaseConfigured() {
  return configured;
}
