/*
 * Lists frontend files below a given coverage threshold.
 *
 * Usage:
 *   node tools/coverage/list-low-files.js
 *   node tools/coverage/list-low-files.js --min=80
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const minArg = args.find(a => a.startsWith('--min='));
const min = minArg ? Number(minArg.split('=')[1]) : 80;

const coveragePath = path.resolve(__dirname, '..', '..', 'coverage', 'coverage-final.json');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function toRelativeFromFrontend(absoluteFile) {
  const normalized = path.resolve(absoluteFile);
  const srcIdx = normalized.toLowerCase().lastIndexOf(`${path.sep}src${path.sep}`.toLowerCase());
  if (srcIdx === -1) return null;
  return toPosix(normalized.slice(srcIdx + 1)); // strip leading separator
}

function isExcluded(relPath) {
  if (!relPath) return true;

  // Root CRA bootstraps / service worker: excluded in Sonar config used in this project.
  if (relPath === 'src/index.js') return true;
  if (relPath === 'src/registerServiceWorker.js') return true;

  // Common Sonar exclusions used here.
  if (/^src\/modules\/.*\/actions\.js$/.test(relPath)) return true;
  if (/^src\/modules\/.*\/actionTypes\.js$/.test(relPath)) return true;
  if (/^src\/modules\/.*\/index\.js$/.test(relPath)) return true;

  // Often excluded “barrel” files.
  if (relPath === 'src/backend/index.js') return true;
  if (relPath === 'src/i18n/messages/index.js') return true;

  return false;
}

function pct(covered, total) {
  if (total === 0) return 100;
  return (covered / total) * 100;
}

function computeLinePct(entry) {
  const lineHits = entry.l || {};
  const keys = Object.keys(lineHits);
  const total = keys.length;
  const covered = keys.reduce((acc, k) => acc + (lineHits[k] > 0 ? 1 : 0), 0);
  return { covered, total, pct: pct(covered, total) };
}

function computeStmtPct(entry) {
  const stmtMap = entry.s || {};
  const keys = Object.keys(stmtMap);
  const total = keys.length;
  const covered = keys.reduce((acc, k) => acc + (stmtMap[k] > 0 ? 1 : 0), 0);
  return { covered, total, pct: pct(covered, total) };
}

function main() {
  if (!fs.existsSync(coveragePath)) {
    console.error(`No existe ${coveragePath}. Ejecuta primero jest con --coverage.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(coveragePath, 'utf8');
  const json = JSON.parse(raw);

  const rows = [];

  for (const absoluteFile of Object.keys(json)) {
    const rel = toRelativeFromFrontend(absoluteFile);
    if (!rel) continue;
    if (isExcluded(rel)) continue;

    const line = computeLinePct(json[absoluteFile]);
    const stmt = computeStmtPct(json[absoluteFile]);

    rows.push({
      file: rel,
      linePct: line.pct,
      stmtPct: stmt.pct,
      lines: `${line.covered}/${line.total}`,
      stmts: `${stmt.covered}/${stmt.total}`,
    });
  }

  const low = rows
    .filter(r => r.linePct < min)
    .sort((a, b) => a.linePct - b.linePct || a.file.localeCompare(b.file));

  if (low.length === 0) {
    console.log(`OK: no hay ficheros (no excluidos) con <${min}% de líneas.`);
    return;
  }

  console.log(`Ficheros (no excluidos) con <${min}% cobertura de líneas: ${low.length}`);
  for (const r of low) {
    console.log(
      `${r.linePct.toFixed(2).padStart(6)}% lines (${r.lines.padStart(9)}), ` +
        `${r.stmtPct.toFixed(2).padStart(6)}% stmts (${r.stmts.padStart(9)})  ${r.file}`
    );
  }
}

main();
