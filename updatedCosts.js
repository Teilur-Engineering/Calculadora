/**
 * Calculadora Teilur B2B - Refactorizado
 * Valores: 2026 Master Hierarchy por país (Brazil, Colombia, Mexico, Argentina).
 * La estimación de costos usa el país seleccionado en el select (group-country).
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
  level: '',
  secondCountry: ''
};

// Modo comparación: true cuando el usuario ha pulsado compare-submit
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

// Valores del select País que coinciden con la clave en PRICE_TABLE (Brazil, Colombia, Mexico, Argentina).
// Si en Webflow el option value es distinto (ej. "México"), añade aquí: 'México': 'Mexico'
const COUNTRY_KEY_NORMALIZE = {};

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
    or: document.getElementById('or'),
    secondSection: document.getElementById('second-section'),
    secondCountry: document.getElementById('second-country'),
    compareSubmit: document.getElementById('compare-submit'),
    titleCalculator: document.getElementById('title-calculator'),
    container2Calculator: document.getElementById('container-2-calculator'),
    titleCountry1: document.getElementById('title-country-1'),
    titleCountry2: document.getElementById('title-country-2'),
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
      total2: document.getElementById('total-2')
    }
  };
}

/**
 * Flujo Webflow: cada vez que el usuario elige un valor en un select, se muestra el siguiente.
 * 1. Elige Grupo        → se muestra el contenedor de roles (ej. Development-Engineering).
 * 2. Elige Rol          → se muestra el select de País (group-country).
 * 3. Elige País         → se muestra el select de Nivel (select-level).
 * 4. Elige Nivel        → se muestra el botón Submit (submit).
 * 5. Clic en Submit     → setPrice() rellena la tabla de estimación de costos.
 */
function updateUI() {
  const el = getDOMElements();
  const containerElements = Object.values(el.containers).filter(Boolean);
    
  // Ocultar todos los contenedores de roles
  containerElements.forEach(function (node) {
    if (node) node.style.display = 'none';
  });

  // Paso 1: mostrar solo el contenedor del grupo seleccionado (roles)
  const activeId = GROUP_CONTAINER_IDS[data.group];
  if (activeId) {
    const active = document.getElementById(activeId);
    if (active) active.style.display = 'flex';
  }

  // Pasos 2–4: mostrar siguiente bloque solo cuando el anterior tiene valor
  const hasRole = getCurrentRole() !== '';
  const showCountry = data.group !== '' && hasRole;           // paso 2: mostrar país
  const showLevel = showCountry && data.country !== '';       // paso 3: mostrar nivel
  const showSubmit = showLevel && data.level !== '';          // paso 4: mostrar botón submit

  if (el.chooseCountry) el.chooseCountry.style.display = data.group === '' || !hasRole ? 'none' : 'flex';
  if (el.chooseTheExperience) el.chooseTheExperience.style.display = !showCountry || !data.country ? 'none' : 'flex';
  if (el.estimateCost) el.estimateCost.style.display = showSubmit ? 'flex' : 'none';
  if (el.or) el.or.style.display = showSubmit ? 'flex' : 'none';
  if (el.secondSection) el.secondSection.style.display = showSubmit ? 'flex' : 'none';
  if (el.secondCountry) el.secondCountry.style.display = showSubmit ? 'flex' : 'none';

  var hasSecondCountry = data.secondCountry !== '' && data.secondCountry != null;
  if (el.compareSubmit) el.compareSubmit.style.display = showSubmit && hasSecondCountry ? 'block' : 'none';

  // Título calculadora y columna de comparación (solo cuando se ha pulsado compare-submit)
  if (el.titleCalculator) {
    el.titleCalculator.textContent = compareActive ? 'price comparison' : 'Expected monthly cost';
  }
  if (el.container2Calculator) {
    el.container2Calculator.style.display = compareActive ? 'block' : 'none';
  }
  if (compareActive) {
    if (el.titleCountry1) {
      el.titleCountry1.textContent = data.country || '';
      el.titleCountry1.style.display = 'block';
    }
    if (el.titleCountry2) {
      el.titleCountry2.textContent = data.secondCountry || '';
    }
  }
}

/**
 * Rellena la tabla de precios desde PRICE_TABLE (2026) según grupo, rol, nivel y país seleccionado.
 */
function setPrice() {
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
 * Rellena la columna del segundo país (comparación) desde PRICE_TABLE.
 * Usa grupo, rol y nivel actuales; país = valor del select second-country.
 */
function setComparePrice() {
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

  const compareSubmitBtn = document.getElementById('compare-submit');
  if (compareSubmitBtn) {
    compareSubmitBtn.addEventListener('click', function () {
      compareActive = true;
      updateUI();
      setComparePrice();
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

console.log('Calculadora Teilur cargada (2026)', new Date().toISOString());
