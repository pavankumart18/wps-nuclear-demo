// data.js — CSV loading and parsing utilities
// All CSVs are in npcil_sm11_demo_input_data/

const DATA_DIR = './npcil_sm11_demo_input_data/';

/** Parse a CSV string into an array of row objects keyed by header. */
export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

/** Split a CSV line respecting quoted fields. */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function fetchCSV(filename) {
  const res = await fetch(DATA_DIR + filename);
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
  return parseCSV(await res.text());
}

export async function loadAllData() {
  const [jobs, wps, qualMapping, qualMatrix, welders,
         consumables, pqr, inspection] = await Promise.all([
    fetchCSV('jobs.csv'),
    fetchCSV('wps_extracted_parameters.csv'),
    fetchCSV('qualification_mapping.csv'),
    fetchCSV('qualification_matrix.csv'),
    fetchCSV('welders.csv'),
    fetchCSV('consumables_reference.csv'),
    fetchCSV('pqr_reference.csv'),
    fetchCSV('inspection_requirements.csv'),
  ]);

  // Coerce numeric fields
  jobs.forEach(j => { j.thickness_mm = parseFloat(j.thickness_mm) || 0; });
  wps.forEach(w => {
    w.groove_thickness_min_mm = parseFloat(w.groove_thickness_min_mm) || 0;
    w.groove_thickness_max_mm = parseFloat(w.groove_thickness_max_mm) || 0;
    w.pwht_required = w.pwht_required === 'True';
    w.extraction_review_required = w.extraction_review_required === 'True';
    w.extraction_confidence = parseFloat(w.extraction_confidence) || 0;
  });
  qualMatrix.forEach(q => {
    q.min_thickness_mm = parseFloat(q.min_thickness_mm) || 0;
    q.max_thickness_mm = parseFloat(q.max_thickness_mm) || 999;
    q.pwht_capable = q.pwht_capable === 'True';
    q.requires_special_endorsement = q.requires_special_endorsement === 'True';
  });
  welders.forEach(w => {
    w.days_until_expiry = parseInt(w.days_until_expiry) || 0;
    w.recent_ncr_count = parseInt(w.recent_ncr_count) || 0;
  });

  return { jobs, wps, qualMapping, qualMatrix, welders, consumables, pqr, inspection };
}
