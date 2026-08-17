/**
 * currency-manager.js
 * Maneja el estado global de la moneda (USD / DOP) y provee funciones de conversión.
 */

const EXCHANGE_RATE = 59.50; // 1 USD = 59.50 DOP

// Inicializar la moneda preferida desde localStorage o usar DOP por defecto
let currentCurrency = localStorage.getItem('redex_currency') || 'DOP';

/**
 * Convierte y formatea un valor según la moneda objetivo.
 * @param {number} amount - El monto a convertir.
 * @param {string} baseCurrency - Moneda original ('USD' o 'DOP').
 * @param {string} targetCurrency - Moneda a la que se desea convertir ('USD' o 'DOP').
 * @returns {string} Texto formateado con la moneda (ej. "USD $100,000" o "RD$5,950,000").
 */
function formatCurrency(amount, baseCurrency = 'USD', targetCurrency = currentCurrency) {
    let convertedAmount = amount;
    
    if (baseCurrency === 'USD' && targetCurrency === 'DOP') {
        convertedAmount = amount * EXCHANGE_RATE;
    } else if (baseCurrency === 'DOP' && targetCurrency === 'USD') {
        convertedAmount = amount / EXCHANGE_RATE;
    }

    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    if (targetCurrency === 'USD') {
        return `USD $${formatter.format(convertedAmount)}`;
    } else {
        return `RD$${formatter.format(convertedAmount)}`;
    }
}

/**
 * Intenta convertir una cadena de precio arbitraria según la moneda seleccionada.
 * Ejemplos: "USD $185,000", "Reserva con RD$10,000", "Desde DOP $2,000/m²"
 */
function formatPriceString(priceStr) {
    if (!priceStr || typeof priceStr !== 'string') return priceStr;
    
    // Si contiene "Consultar", devolver tal cual
    if (priceStr.toLowerCase().includes('consultar')) return priceStr;

    // Detectar moneda original (USD vs DOP/RD)
    let baseCurrency = 'DOP';
    if (priceStr.includes('USD') || priceStr.includes('US$') || priceStr.includes('US ') || priceStr.includes('US')) {
        baseCurrency = 'USD';
    }

    // Extraer el primer número grande (ignorar decimales si no son significativos, o parsear bien)
    // Buscamos números con comas opcionales
    const numRegex = /[\d,]+(\.\d+)?/;
    const match = priceStr.match(numRegex);
    
    if (!match) return priceStr; // No se encontró número

    const rawNumStr = match[0].replace(/,/g, '');
    const amount = parseFloat(rawNumStr);
    
    if (isNaN(amount) || amount === 0) return priceStr;

    // Evitar convertir tasas de porcentaje o cosas pequeñas a menos que estemos seguros
    if (amount < 100) return priceStr; // Probablemente no es el precio principal

    const convertedAmount = convertAmount(amount, baseCurrency, currentCurrency);
    
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    const formattedNum = formatter.format(convertedAmount);

    // Reemplazar la parte del número y la etiqueta de moneda en la cadena original
    let newStr = priceStr;
    
    // Remover viejas etiquetas de moneda para no duplicar
    newStr = newStr.replace(/USD\s?\$?|US\$\s?|US\s?|DOP\s?\$?|RD\$\s?|RD\s?|\$/gi, '').trim();
    
    // Reemplazar el número viejo con el nuevo (asumiendo que solo reemplazamos la primera ocurrencia numérica grande)
    newStr = newStr.replace(match[0], formattedNum);

    // Añadir la nueva etiqueta de moneda apropiada según el contexto de la cadena original
    // Tratar de colocarla antes del número
    const symbol = currentCurrency === 'USD' ? 'USD $' : 'RD$';
    
    // Buscar donde está el número nuevo e insertar el símbolo justo antes
    const numIndex = newStr.indexOf(formattedNum);
    if (numIndex !== -1) {
        newStr = newStr.slice(0, numIndex) + symbol + newStr.slice(numIndex);
    } else {
        newStr = symbol + newStr;
    }

    return newStr;
}

/**
 * Convierte el valor numerico sin el string
 */
function convertAmount(amount, baseCurrency = 'USD', targetCurrency = currentCurrency) {
    let convertedAmount = amount;
    if (baseCurrency === 'USD' && targetCurrency === 'DOP') {
        convertedAmount = amount * EXCHANGE_RATE;
    } else if (baseCurrency === 'DOP' && targetCurrency === 'USD') {
        convertedAmount = amount / EXCHANGE_RATE;
    }
    return convertedAmount;
}

/**
 * Cambia la moneda actual y recarga la interfaz.
 * @param {string} newCurrency - 'USD' o 'DOP'.
 */
function setCurrency(newCurrency) {
    if (newCurrency !== 'USD' && newCurrency !== 'DOP') return;
    currentCurrency = newCurrency;
    localStorage.setItem('redex_currency', currentCurrency);
    updateCurrencyUI();
    document.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: currentCurrency } }));
}

/**
 * Actualiza todos los elementos del DOM que tienen el atributo data-raw-price.
 * Atributos soportados:
 * data-raw-price: El monto numérico (ej. "100000").
 * data-base-currency: Moneda base ('USD' o 'DOP').
 * data-prefix: Texto opcional que va antes del precio (ej. "Desde ").
 * data-suffix: Texto opcional que va después (ej. "/m²").
 */
function updateCurrencyUI() {
    // Actualizar botones toggle
    const toggles = document.querySelectorAll('.currency-toggle-btn');
    toggles.forEach(btn => {
        if (btn.dataset.currency === currentCurrency) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Actualizar textos de precios fijos
    const priceElements = document.querySelectorAll('[data-raw-price]');
    priceElements.forEach(el => {
        const rawPrice = parseFloat(el.getAttribute('data-raw-price'));
        const baseCurrency = el.getAttribute('data-base-currency') || 'USD';
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        
        if (!isNaN(rawPrice)) {
            const formatted = formatCurrency(rawPrice, baseCurrency, currentCurrency);
            el.innerHTML = `${prefix}<strong>${formatted}</strong>${suffix}`;
        }
    });
}

// Configurar el HTML del toggle de moneda (para ser inyectado en el navbar u otros lugares)
function createCurrencyToggle() {
    const container = document.createElement('div');
    container.className = 'currency-toggle-container';
    container.innerHTML = `
        <button class="currency-toggle-btn ${currentCurrency === 'DOP' ? 'active' : ''}" data-currency="DOP" onclick="setCurrency('DOP')">DOP</button>
        <button class="currency-toggle-btn ${currentCurrency === 'USD' ? 'active' : ''}" data-currency="USD" onclick="setCurrency('USD')">USD</button>
    `;
    return container;
}

// Estilos dinámicos para el toggle
const currencyStyles = document.createElement('style');
currencyStyles.textContent = `
    .currency-toggle-container {
        display: flex;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 4px;
        margin-left: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .currency-toggle-btn {
        background: transparent;
        border: none;
        color: var(--ww60);
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .currency-toggle-btn:hover {
        color: var(--ww);
    }
    .currency-toggle-btn.active {
        background: var(--gold);
        color: var(--black);
    }
    @media (max-width: 900px) {
        .currency-toggle-container {
            margin: 10px auto;
            justify-content: center;
            width: fit-content;
        }
    }
`;
document.head.appendChild(currencyStyles);

document.addEventListener('DOMContentLoaded', () => {
    // Injectar el toggle en el navbar
    const navbarNav = document.querySelector('#main-nav ul');
    if (navbarNav) {
        const li = document.createElement('li');
        li.appendChild(createCurrencyToggle());
        navbarNav.appendChild(li);
    }
    
    // Ejecutar la actualización inicial
    updateCurrencyUI();
});
