import { supabase } from './admin/js/supabase-config.js';

const params = new URLSearchParams(window.location.search);
const token = params.get('t') || '';

const els = {
  card: document.getElementById('seller-card'),
  message: document.getElementById('seller-message'),
  form: document.getElementById('seller-sale-form'),
  status: document.getElementById('seller-status'),
  assetImage: document.getElementById('asset-image'),
  assetType: document.getElementById('asset-type'),
  assetName: document.getElementById('asset-name'),
  assetLocation: document.getElementById('asset-location'),
  assetPrice: document.getElementById('asset-price'),
  assetMeterage: document.getElementById('asset-meterage')
};

function setStatus(message, type = '') {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.className = `admin-status ${type}`;
}

function numberValue(formData, key) {
  const value = String(formData.get(key) || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return value ? Number(value[0]) : null;
}

function textValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

async function loadLink() {
  if (!token) throw new Error('Este link no es válido.');

  const { data, error } = await supabase.rpc('obtener_link_venta', { p_token: token });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.message || 'Este link no está disponible.');

  els.card.hidden = false;
  els.message.hidden = true;
  els.assetType.textContent = data.tipo_activo === 'proyecto' ? 'Proyecto vendido' : 'Propiedad vendida';
  els.assetName.textContent = data.activo_nombre || 'Inmueble REDEX';
  els.assetLocation.textContent = data.ubicacion || '';
  els.assetPrice.textContent = data.precio ? String(data.precio) : 'Consultar';
  els.assetMeterage.textContent = data.metraje ? `${data.metraje} m²` : 'Metraje por confirmar';
  if (data.imagen_portada) els.assetImage.src = data.imagen_portada;

  const today = new Date().toISOString().slice(0, 10);
  if (els.form?.elements.fecha_venta) els.form.elements.fecha_venta.value = today;
  if (els.form?.elements.metraje && data.metraje) els.form.elements.metraje.value = data.metraje;
  if (els.form?.elements.ubicacion_inmueble && data.ubicacion) els.form.elements.ubicacion_inmueble.value = data.ubicacion;
}

async function submitReport(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  submit.disabled = true;
  submit.textContent = 'Enviando...';
  setStatus('');

  try {
    const assetDetails = textValue(formData, 'detalles_activo');
    const notes = textValue(formData, 'notas');
    const payload = {
      p_token: token,
      p_vendedor_nombre: textValue(formData, 'vendedor_nombre'),
      p_vendedor_telefono: textValue(formData, 'vendedor_telefono'),
      p_vendedor_correo: textValue(formData, 'vendedor_correo'),
      p_cliente_nombre: textValue(formData, 'cliente_nombre'),
      p_cliente_telefono: textValue(formData, 'cliente_telefono'),
      p_cliente_correo: textValue(formData, 'cliente_correo'),
      p_cliente_ubicacion: textValue(formData, 'cliente_ubicacion'),
      p_fecha_venta: textValue(formData, 'fecha_venta'),
      p_precio_final: numberValue(formData, 'precio_final'),
      p_monto_inicial: numberValue(formData, 'monto_inicial'),
      p_forma_pago: textValue(formData, 'forma_pago') || 'contado',
      p_banco_entidad: textValue(formData, 'banco_entidad'),
      p_porcentaje_interes: numberValue(formData, 'porcentaje_interes'),
      p_plazo_financiamiento: textValue(formData, 'plazo_financiamiento'),
      p_metraje: textValue(formData, 'metraje'),
      p_ubicacion_inmueble: textValue(formData, 'ubicacion_inmueble'),
      p_notas: [
        assetDetails ? `Otros detalles del inmueble o proyecto: ${assetDetails}` : '',
        notes
      ].filter(Boolean).join('\n\n')
    };

    const { data, error } = await supabase.rpc('crear_reporte_venta', payload);
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || 'No se pudo enviar el reporte.');

    form.reset();
    setStatus('Reporte enviado correctamente. REDEX revisará la venta.', 'success');
    submit.textContent = 'Reporte enviado';
  } catch (error) {
    setStatus(error.message || 'No se pudo enviar el reporte.', 'error');
    submit.disabled = false;
    submit.textContent = 'Enviar reporte';
  }
}

els.form?.addEventListener('submit', submitReport);

loadLink().catch(error => {
  if (els.message) els.message.textContent = error.message || 'Este link no está disponible.';
});
