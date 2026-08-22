import XLSX from 'xlsx';
import fs from 'node:fs';

const wb = XLSX.readFile('C:\\Users\\danni\\Downloads\\Art_by_Des_Green_Website_Copy_Master.xlsx', {
  cellDates: true,
});

function sheetToObjects(name) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c !== null && c !== ''))
    .map((r) => {
      const obj = {};
      header.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });
}

const artworkCopy = sheetToObjects('Artwork Copy');
const changeTracker = sheetToObjects('Website Change Tracker');

fs.writeFileSync(
  'C:\\Users\\danni\\Documents\\Moms website\\Art-by-Des-Green-website\\scripts\\output\\copy-master.json',
  JSON.stringify({ artworkCopy, changeTracker }, null, 2)
);

console.log('artworkCopy rows:', artworkCopy.length);
console.log('changeTracker rows:', changeTracker.length);
console.log('\n--- full change tracker ---');
for (const row of changeTracker) console.log(JSON.stringify(row));

console.log('\n--- read me sheet ---');
const readMe = XLSX.utils.sheet_to_json(wb.Sheets['Read Me'], { header: 1, defval: null });
for (const row of readMe) console.log(JSON.stringify(row));

console.log('\n--- title/category changes summary ---');
for (const r of artworkCopy) {
  const titleChanged = r['Current Title'] !== r['Recommended Title'];
  const catChanged = r['Current Category'] !== r['Recommended Public Category'];
  if (titleChanged || catChanged) {
    console.log(
      `Rank ${r['Rank']}: title "${r['Current Title']}" -> "${r['Recommended Title']}" (${titleChanged ? 'CHANGED' : 'same'}); category "${r['Current Category']}" -> "${r['Recommended Public Category']}" (${catChanged ? 'CHANGED' : 'same'}); needsApproval=${r['Title Approval Needed']}`
    );
  }
}
