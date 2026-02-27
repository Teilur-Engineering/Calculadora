const XLSX = require('xlsx');
const path = 'C:\\Users\\LENOVO\\Downloads\\B2B Pricing Calculator 2023 - Hirarchy and Logic.xlsx';
const workbook = XLSX.readFile(path);
const sheet = workbook.Sheets['2026 Master Hierarchy'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('Total rows:', data.length);
// Log all rows to see group boundaries and role names
data.forEach((row, i) => {
  if (row && (row[1] || row[0])) console.log(i, row[1] || row[0], row[2], row[3], row[4]);
});
