/**
 * Genera la tabla de precios desde "2026 Master Hierarchy" por país.
 * Excel: Brazil 2-4, Colombia 5-7, Mexico 8-10, Argentina 11-13, Estados Unidos 14-16 (Lower, Median, Upper).
 * Clave: group|role|level|country (ej. "Development & Engineering|Software Engineer|Mid Level|Brazil").
 */
/*
 * Uso:
 *   node build-price-table.js > price-table-2026.js
 *   node build-price-table.js "ruta/al.xlsx" "Nombre de la hoja" > price-table-2026.js
 *
 * La ruta y la hoja se pueden pasar por argumento o por las variables de entorno
 * PRICING_XLSX y PRICING_SHEET. Por defecto se busca el Excel en la carpeta de
 * Descargas del usuario actual, para no depender de la maquina de una persona.
 */
const os = require('os');
const nodePath = require('path');
const XLSX = require('xlsx');

const DEFAULT_FILE = 'Teilur_LATAM_vs_US_salarios_2026.xlsx';
const DEFAULT_SHEET = 'Precios 2026';

const path =
  process.argv[2] ||
  process.env.PRICING_XLSX ||
  nodePath.join(os.homedir(), 'Downloads', DEFAULT_FILE);
const sheetName = process.argv[3] || process.env.PRICING_SHEET || DEFAULT_SHEET;

const workbook = XLSX.readFile(path);
const sheet = workbook.Sheets[sheetName];
if (!sheet) {
  console.error(`No se encontro la hoja "${sheetName}" en ${path}.`);
  console.error(`Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
  process.exit(1);
}
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
