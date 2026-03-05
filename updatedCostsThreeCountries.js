/**
 * Calculadora Teilur B2B - Comparación de 3 países
 * Muestra precios: país 1 (usuario), país 2 (usuario), país 3 (siempre Estados Unidos).
 * Depende de price-table-2026.js (PRICE_TABLE).
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
  level: '',
  secondCountry: ''
};

// Tercer país siempre Estados Unidos (clave en PRICE_TABLE = mismo nombre que en el Excel)
const THIRD_COUNTRY_KEY = 'Estados Unidos';
const THIRD_COUNTRY_LABEL = 'Estados Unidos';

// Comparación activa: true cuando el usuario ha pulsado compare-submit
var compareActive = false;

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

const COUNTRY_KEY_NORMALIZE = {};

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
    or: document.getElementById('or'),
    secondSection: document.getElementById('second-section'),
    secondCountry: document.getElementById('second-country'),
    compareSubmit: document.getElementById('compare-submit'),
    containerResults: document.getElementById('container-results'),
    titleCountry1: document.getElementById('title-country-1'),
    titleCountry2: document.getElementById('title-country-2'),
    titleCountry3: document.getElementById('title-country-3'),
    table: {
      candidatesSalary: document.getElementById('Candidates-salary'),
      teilursFee: document.getElementById('teilurs-fee'),
      price: document.getElementById('price'),
      median: document.getElementById('median'),
      min: document.getElementById('min'),
      max: document.getElementById('max'),
      total: document.getElementById('total'),
      bar: document.getElementById('bar'),
      candidatesSalary2: document.getElementById('Candidates-salary-2'),
      teilursFee2: document.getElementById('teilurs-fee-2'),
      total2: document.getElementById('total-2'),
      price2: document.getElementById('price-2'),
      candidatesSalary3: document.getElementById('Candidates-salary-3'),
      teilursFee3: document.getElementById('teilurs-fee-3'),
      total3: document.getElementById('total-3'),
      price3: document.getElementById('price-3')
    }
  };
}

/**
 * Muestra/oculta pasos del flujo. compare-submit solo visible si TODOS los selects tienen valor.
 */
function updateUI() {
  const el = getDOMElements();
  const containerElements = Object.values(el.containers).filter(Boolean);

  containerElements.forEach(function (node) {
    if (node) node.style.display = 'none';
  });

  const activeId = GROUP_CONTAINER_IDS[data.group];
  if (activeId) {
    const active = document.getElementById(activeId);
    if (active) active.style.display = 'flex';
  }

  const hasRole = getCurrentRole() !== '';
  const showCountry = data.group !== '' && hasRole;
  const showLevel = showCountry && data.country !== '';
  const showSecondSection = showLevel && data.level !== '';

  if (el.chooseCountry) el.chooseCountry.style.display = data.group === '' || !hasRole ? 'none' : 'flex';
  if (el.chooseTheExperience) el.chooseTheExperience.style.display = !showCountry || !data.country ? 'none' : 'flex';

  // or y second-section permanecen ocultos hasta que grupo, rol, país y nivel tengan valor
  if (el.or) el.or.style.display = showSecondSection ? 'flex' : 'none';
  if (el.secondSection) el.secondSection.style.display = showSecondSection ? 'flex' : 'none';
  if (el.secondCountry) el.secondCountry.style.display = showSecondSection ? 'flex' : 'none';

  // compare-submit solo si todos los selects tienen valor (incluido segundo país)
  var allSelected = showSecondSection && data.secondCountry !== '' && data.secondCountry != null;
  if (el.compareSubmit) el.compareSubmit.style.display = allSelected ? 'block' : 'none';

  // Contenedor de resultados: visible solo cuando se ha pulsado compare-submit
  if (el.containerResults) {
    el.containerResults.style.display = compareActive ? 'block' : 'none';
  }

  if (compareActive) {
    if (el.titleCountry1) {
      el.titleCountry1.textContent = data.country || '';
      el.titleCountry1.style.display = 'block';
    }
    if (el.titleCountry2) el.titleCountry2.textContent = data.secondCountry || '';
    if (el.titleCountry3) el.titleCountry3.textContent = THIRD_COUNTRY_LABEL;
  }
}

/**
 * Rellena la columna del país 1 desde PRICE_TABLE.
 */
function setPriceCountry1() {
  const el = getDOMElements();
  const role = getCurrentRole();
  if (!data.group || !role || !data.level || !data.country || !el.table.price) return;

  const country = COUNTRY_KEY_NORMALIZE[data.country] || data.country;
  const key = data.group + '|' + role + '|' + data.level + '|' + country;
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
 * Rellena la columna del país 2 desde PRICE_TABLE.
 */
function setPriceCountry2() {
  const el = getDOMElements();
  const role = getCurrentRole();
  if (!data.group || !role || !data.level || !data.secondCountry) return;

  const country2 = COUNTRY_KEY_NORMALIZE[data.secondCountry] || data.secondCountry;
  const key = data.group + '|' + role + '|' + data.level + '|' + country2;
  const row = typeof PRICE_TABLE !== 'undefined' && PRICE_TABLE[key];
  if (!row) return;

  const t = el.table;
  if (t.candidatesSalary2) t.candidatesSalary2.textContent = row.candidatesSalary;
  if (t.teilursFee2) t.teilursFee2.textContent = row.teilursFee;
  if (t.total2) t.total2.textContent = row.total;
  if (t.price2) t.price2.textContent = row.price;
}

/**
 * Rellena la columna del país 3 (siempre Estados Unidos) desde PRICE_TABLE.
 */
function setPriceCountry3() {
  const el = getDOMElements();
  const role = getCurrentRole();
  if (!data.group || !role || !data.level) return;

  const key = data.group + '|' + role + '|' + data.level + '|' + THIRD_COUNTRY_KEY;
  const row = typeof PRICE_TABLE !== 'undefined' && PRICE_TABLE[key];
  if (!row) return;

  const t = el.table;
  if (t.candidatesSalary3) t.candidatesSalary3.textContent = row.candidatesSalary;
  if (t.teilursFee3) t.teilursFee3.textContent = row.teilursFee;
  if (t.total3) t.total3.textContent = row.total;
  if (t.price3) t.price3.textContent = row.price;
}

/**
 * Rellena las 3 columnas de precios y muestra el contenedor de resultados.
 */
function fillAllThreePrices() {
  setPriceCountry1();
  setPriceCountry2();
  setPriceCountry3();
}

function onSelect() {
  updateUI();
}

// --- Event listeners ---
function bindEvents() {
  const compareSubmitBtn = document.getElementById('compare-submit');
  if (compareSubmitBtn) {
    compareSubmitBtn.addEventListener('click', function () {
      compareActive = true;
      updateUI();
      fillAllThreePrices();
    });
  }

  const selectGroup = document.getElementById('group-select');
  if (selectGroup) {
    selectGroup.addEventListener('change', function (e) {
      data.group = e.target.value;
      compareActive = false;
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
        compareActive = false;
        onSelect();
      });
    }
  });

  const selectCountry = document.getElementById('group-country');
  if (selectCountry) {
    selectCountry.addEventListener('change', function (e) {
      data.country = e.target.value;
      compareActive = false;
      onSelect();
    });
  }

  const selectLevel = document.getElementById('select-level');
  if (selectLevel) {
    selectLevel.addEventListener('change', function (e) {
      data.level = e.target.value;
      compareActive = false;
      onSelect();
    });
  }

  const selectSecondCountry = document.getElementById('second-country');
  if (selectSecondCountry) {
    selectSecondCountry.addEventListener('change', function (e) {
      var val = (e.target && e.target.value !== undefined) ? e.target.value : (selectSecondCountry.value || '');
      data.secondCountry = val != null ? String(val).trim() : '';
      compareActive = false;
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

console.log('Calculadora Teilur 3 países cargada', new Date().toISOString());
