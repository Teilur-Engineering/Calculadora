/**
 * Genera la tabla de precios desde "2026 Master Hierarchy" por país.
 * Excel: Brazil 2-4, Colombia 5-7, Mexico 8-10, Argentina 11-13, Estados Unidos 14-16 (Lower, Median, Upper).
 * Clave: group|role|level|country (ej. "Development & Engineering|Software Engineer|Mid Level|Brazil").
 */
const XLSX = require('xlsx');
const path = 'C:\\Users\\LENOVO\\Downloads\\B2B Pricing Calculator 2023 - Hirarchy and Logic.xlsx';
const workbook = XLSX.readFile(path);
const sheet = workbook.Sheets['2026 Master Hierarchy'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const LEVEL_MAP = {
  'Mid-Level': 'Mid Level',
  'Senior': 'Senior Level',
  'Manager or Director': 'Manager/Director Level'
};

const LEVEL_NAMES = new Set(['Mid-Level', 'Senior', 'Manager or Director']);

// País → índices [lower, median, upper] en la fila del Excel
const COUNTRY_COLUMNS = {
  'Brazil': [2, 3, 4],
  'Colombia': [5, 6, 7],
  'Mexico': [8, 9, 10],
  'Argentina': [11, 12, 13],
  'Estados Unidos': [14, 15, 16]
};

function formatNum(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

let currentGroup = '';
let currentRole = '';
const table = {};

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  const col1 = row[1] != null ? String(row[1]).trim() : '';

  if (!col1) continue;

  if (LEVEL_NAMES.has(col1)) {
    const level = LEVEL_MAP[col1];
    if (currentGroup && currentRole) {
      for (const [country, cols] of Object.entries(COUNTRY_COLUMNS)) {
        const lower = row[cols[0]] != null ? Number(row[cols[0]]) : NaN;
        const median = row[cols[1]] != null ? Number(row[cols[1]]) : NaN;
        const upper = row[cols[2]] != null ? Number(row[cols[2]]) : NaN;
        if (isNaN(median)) continue;
        const key = `${currentGroup}|${currentRole}|${level}|${country}`;
        const salary = Math.round(median * 0.8);
        const fee = median - salary;
        table[key] = {
          price: formatNum(median),
          total: formatNum(median),
          median: formatNum(median),
          min: formatNum(lower),
          max: formatNum(upper),
          candidatesSalary: formatNum(salary),
          teilursFee: formatNum(fee)
        };
      }
    }
    continue;
  }

  if (row[2] !== undefined && row[2] !== null && typeof row[2] === 'number') {
    continue;
  }

  const isGroup = col1.includes('&') || col1 === 'Development & Engineering' || col1 === 'Sales & Business Dev' || col1 === 'Finance & Accounting' || col1 === 'Product Dev & Design' || col1 === 'HR & Internal Ops' || col1 === 'Marketing & Branding' || col1 === 'Data & Analytics';
  if (isGroup) {
    currentGroup = col1;
    currentRole = '';
  } else {
    currentRole = col1;
  }
}

console.log('// PRICE_TABLE 2026 Master Hierarchy (Brazil, Colombia, Mexico, Argentina, Estados Unidos) - build-price-table.js');
console.log('const PRICE_TABLE = ' + JSON.stringify(table, null, 0) + ';');
console.log('const PRICE_KEYS = Object.keys(PRICE_TABLE).length;');
console.log('// ' + Object.keys(table).length + ' entries');
