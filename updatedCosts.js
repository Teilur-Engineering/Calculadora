/**
 * Calculadora Teilur B2B - Refactorizado
 * Valores 2026 Master Hierarchy (Brazil).
 * En Webflow: cargar primero price-table-2026.js, luego este archivo.
 */
var Webflow = Webflow || [];

// --- Estado del formulario ---
const data = {
  group: '',
  experience: '',
  sales: '',
  finance: '',
  product: '',
  internal: '',
  marketing: '',
  analytics: '',
  country: '',
  level: ''
};

// --- Mapeo grupo → ID del contenedor de roles (Webflow) ---
const GROUP_CONTAINER_IDS = {
  'Development & Engineering': 'Development-Engineering',
  'Sales & Business Dev': 'Sales-Business-Dev',
  'Finance & Accounting': 'Finance-Accounting',
  'Product Dev & Design': 'Product-Dev-Design',
  'HR & Internal Ops': 'HR-Internal-Ops',
  'Marketing & Branding': 'Marketing-Branding',
  'Data & Analytics': 'Data-Analytics'
};

// --- Rol actual según el grupo (campo en data) ---
function getCurrentRole() {
  const roleByGroup = {
    'Development & Engineering': data.experience,
    'Sales & Business Dev': data.sales,
    'Finance & Accounting': data.finance,
    'Product Dev & Design': data.product,
    'HR & Internal Ops': data.internal,
    'Marketing & Branding': data.marketing,
    'Data & Analytics': data.analytics
  };
  return roleByGroup[data.group] || '';
}

// --- Referencias DOM (IDs Webflow) ---
function getDOMElements() {
  return {
    containers: {
      developmentEngineering: document.getElementById('Development-Engineering'),
      salesBusinessDev: document.getElementById('Sales-Business-Dev'),
      financeAccounting: document.getElementById('Finance-Accounting'),
      productDevDesign: document.getElementById('Product-Dev-Design'),
      hrInternalOps: document.getElementById('HR-Internal-Ops'),
      marketingBranding: document.getElementById('Marketing-Branding'),
      dataAnalytics: document.getElementById('Data-Analytics')
    },
    chooseCountry: document.getElementById('group-country'),
    chooseTheExperience: document.getElementById('select-level'),
    estimateCost: document.getElementById('submit'),
    table: {
      candidatesSalary: document.getElementById('Candidates-salary'),
      teilursFee: document.getElementById('teilurs-fee'),
      price: document.getElementById('price'),
      median: document.getElementById('median'),
      min: document.getElementById('min'),
      max: document.getElementById('max'),
      total: document.getElementById('total'),
      bar: document.getElementById('bar')
    }
  };
}

/**
 * Muestra/oculta contenedores de roles y pasos (país, nivel, enviar).
 */
function updateUI() {
  const el = getDOMElements();
  const containerIds = Object.values(GROUP_CONTAINER_IDS);
  const containerElements = Object.values(el.containers).filter(Boolean);

  // Ocultar todos los contenedores de roles
  containerElements.forEach(function (node) {
    if (node) node.style.display = 'none';
  });

  // Mostrar solo el contenedor del grupo seleccionado
  const activeId = GROUP_CONTAINER_IDS[data.group];
  if (activeId) {
    const active = document.getElementById(activeId);
    if (active) active.style.display = 'flex';
  }

  // Flujo: grupo → país → nivel → enviar
  const hasRole = getCurrentRole() !== '';
  const showCountry = data.group !== '' && hasRole;
  const showLevel = showCountry && data.country !== '';
  const showSubmit = showLevel && data.level !== '';

  if (el.chooseCountry) el.chooseCountry.style.display = data.group === '' || !hasRole ? 'none' : 'flex';
  if (el.chooseTheExperience) el.chooseTheExperience.style.display = !showCountry || !data.country ? 'none' : 'flex';
  if (el.estimateCost) el.estimateCost.style.display = showSubmit ? 'flex' : 'none';
}

/**
 * Rellena la tabla de precios desde PRICE_TABLE (2026).
 */
function setPrice() {
  const el = getDOMElements();
  const role = getCurrentRole();
  if (!data.group || !role || !data.level || !el.table.price) return;

  const key = data.group + '|' + role + '|' + data.level;
  const row = typeof PRICE_TABLE !== 'undefined' && PRICE_TABLE[key];

  if (!row) return;

  const t = el.table;
  t.price.textContent = row.price;
  t.total.textContent = row.total;
  t.median.textContent = row.median;
  t.min.textContent = row.min;
  t.max.textContent = row.max;
  t.candidatesSalary.textContent = row.candidatesSalary;
  t.teilursFee.textContent = row.teilursFee;
  if (t.bar) t.bar.style.width = '50%';
}

/**
 * Actualiza estado, UI y (opcional) precios.
 */
function onSelect() {
  updateUI();
}

// --- Event listeners (mantienen los mismos IDs que en Webflow) ---
function bindEvents() {
  const submitBtn = document.getElementById('submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      setPrice();
    });
  }

  const selectGroup = document.getElementById('group-select');
  if (selectGroup) {
    selectGroup.addEventListener('change', function (e) {
      data.group = e.target.value;
      onSelect();
    });
  }

  const groupIds = [
    'Development-Engineering',
    'Sales-Business-Dev',
    'Product-Dev-Design',
    'Finance-Accounting',
    'HR-Internal-Ops',
    'Marketing-Branding',
    'Data-Analytics'
  ];
  const dataKeys = ['experience', 'sales', 'product', 'finance', 'internal', 'marketing', 'analytics'];

  groupIds.forEach(function (id, i) {
    const node = document.getElementById(id);
    const key = dataKeys[i];
    if (node && key) {
      node.addEventListener('change', function (e) {
        data[key] = e.target.value;
        onSelect();
      });
    }
  });

  const selectCountry = document.getElementById('group-country');
  if (selectCountry) {
    selectCountry.addEventListener('change', function (e) {
      data.country = e.target.value;
      onSelect();
    });
  }

  const selectLevel = document.getElementById('select-level');
  if (selectLevel) {
    selectLevel.addEventListener('change', function (e) {
      data.level = e.target.value;
      onSelect();
    });
  }
}

// --- Inicialización ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    onSelect();
  });
} else {
  bindEvents();
  onSelect();
}

console.log('Calculadora Teilur cargada (2026)', new Date().toISOString());
