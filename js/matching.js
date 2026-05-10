// matching.js — Core matching engine (pure functions, no DOM)
// All logic is computed from data; no results are hard-coded.

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pipeList(str) {
  return (str || '').split('|').map(s => s.trim()).filter(Boolean);
}

/** Does the ticket's process cover the required process? */
function processCovers(ticketProcess, required) {
  // e.g. "GTAW+SMAW" covers "SMAW"
  const parts = (ticketProcess || '').split(/[+\/]/).map(s => s.trim());
  return parts.includes(required) || ticketProcess === required;
}

/** Does the ticket's position_coverage include the required position? */
function positionCovers(coverageField, required) {
  const positions = pipeList(coverageField);
  return positions.includes(required) || coverageField === 'All';
}

/** Does the WPS cover the required position? */
function wpsPositionCovers(wpsPositions, required) {
  if (!wpsPositions || wpsPositions === 'All') return true;
  return pipeList(wpsPositions).includes(required);
}

/** Do any required fillers overlap with ticket allowed fillers? */
function fillerCompatible(allowedFiller, requiredFiller) {
  if (!allowedFiller || !requiredFiller) return true; // no constraint
  const allowed = pipeList(allowedFiller);
  const required = pipeList(requiredFiller);
  return required.some(r => allowed.some(a => a === r || a.replace('-','') === r.replace('-','')));
}

// ─── Step 1: Job → WPS Validation ────────────────────────────────────────────

function validateJobAgainstWPS(job, wps, pqrs) {
  const checks = [];
  let hardFail = false;

  const fail = (name, req, actual, detail, source) => {
    checks.push({ name, required: req, actual, status: 'fail', detail: detail || '', source });
    hardFail = true;
  };
  const pass = (name, req, actual, source) =>
    checks.push({ name, required: req, actual, status: 'pass', detail: '', source });
  const warn = (name, req, actual, detail, source) =>
    checks.push({ name, required: req, actual, status: 'warning', detail, source });

  if (!wps) {
    fail('WPS Exists', `WPS ${job.wps_id}`, 'Not found', 'No WPS record matches job.wps_id', 'wps_extracted_parameters.csv');
    return { checks, hardFail };
  }

  pass('WPS Exists', `WPS ${job.wps_id}`, `Found: ${wps.source_wps_no}`, 'wps_extracted_parameters.csv');

  const isQualified = wps.qualification_status === 'Qualified';
  if (isQualified) {
    pass('WPS Qualification Status', 'Qualified', wps.qualification_status, 'wps_extracted_parameters.csv → qualification_status');
  } else {
    fail('WPS Qualification Status', 'Qualified', wps.qualification_status,
      `WPS status is "${wps.qualification_status}" — cannot be used automatically`, 'wps_extracted_parameters.csv → qualification_status');
  }

  // PQR support
  const pqrId = wps.supporting_pqr_no;
  const pqrRecord = pqrs.find(p => p.linked_wps_id === wps.wps_id);
  if (pqrId && pqrId !== 'To be made by user organization' && pqrId !== '') {
    if (pqrRecord && pqrRecord.qualified_status === 'Acceptable') {
      pass('PQR Support', `PQR ${pqrId}`, `PQR ${pqrRecord.pqr_no} — ${pqrRecord.qualified_status}`, 'pqr_reference.csv');
    } else if (pqrRecord) {
      warn('PQR Support', `PQR ${pqrId}`, `PQR ${pqrRecord.pqr_no} — ${pqrRecord.qualified_status}`,
        'PQR exists but may need review', 'pqr_reference.csv');
    } else {
      warn('PQR Support', `PQR ${pqrId}`, 'Record not found in reference', 'Verify PQR with engineering', 'pqr_reference.csv');
    }
  } else if (pqrId === 'To be made by user organization') {
    warn('PQR Support', 'User organization must produce PQR', pqrId,
      'WPS cannot be used until PQR is completed by user organization', 'wps_extracted_parameters.csv');
  }

  // Material group
  const matFrom = job.base_material_from === wps.base_material_from;
  const matTo = job.base_material_to === wps.base_material_to;
  if (matFrom && matTo) {
    pass('Base Material Group',
      `${wps.base_material_from} → ${wps.base_material_to}`,
      `${job.base_material_from} → ${job.base_material_to}`,
      'jobs.csv + wps_extracted_parameters.csv');
  } else {
    fail('Base Material Group',
      `${wps.base_material_from} → ${wps.base_material_to}`,
      `${job.base_material_from} → ${job.base_material_to}`,
      `Job material (${job.base_material_from}→${job.base_material_to}) does not match WPS (${wps.base_material_from}→${wps.base_material_to})`,
      'jobs.csv + wps_extracted_parameters.csv');
  }

  // Thickness
  const thOk = job.thickness_mm >= wps.groove_thickness_min_mm && job.thickness_mm <= wps.groove_thickness_max_mm;
  if (thOk) {
    pass('Thickness Range',
      `${wps.groove_thickness_min_mm}–${wps.groove_thickness_max_mm} mm`,
      `${job.thickness_mm} mm`,
      'wps_extracted_parameters.csv → groove_thickness_min/max_mm');
  } else {
    fail('Thickness Range',
      `${wps.groove_thickness_min_mm}–${wps.groove_thickness_max_mm} mm`,
      `${job.thickness_mm} mm`,
      `Job thickness ${job.thickness_mm} mm exceeds WPS allowed range ${wps.groove_thickness_min_mm}–${wps.groove_thickness_max_mm} mm`,
      'wps_extracted_parameters.csv → groove_thickness_min/max_mm');
  }

  // Position
  const posOk = wpsPositionCovers(wps.positions_groove, job.required_position);
  if (posOk) {
    pass('Position Coverage', job.required_position, `WPS: ${wps.positions_groove}`, 'wps_extracted_parameters.csv → positions_groove');
  } else {
    fail('Position Coverage', job.required_position, `WPS: ${wps.positions_groove}`,
      `Required position ${job.required_position} not in WPS coverage (${wps.positions_groove})`,
      'wps_extracted_parameters.csv → positions_groove');
  }

  // Progression
  const progOk = !wps.weld_progression || wps.weld_progression === job.required_progression ||
                 wps.weld_progression === 'Vertical Uphill';
  if (progOk) {
    pass('Weld Progression', job.required_progression, wps.weld_progression, 'wps_extracted_parameters.csv → weld_progression');
  } else {
    warn('Weld Progression', job.required_progression, wps.weld_progression,
      'Progression differs from WPS — verify with engineering', 'wps_extracted_parameters.csv → weld_progression');
  }

  // PWHT
  if (!wps.pwht_required) {
    pass('PWHT Requirement', 'Not required', 'Not required by WPS', 'wps_extracted_parameters.csv → pwht_required');
  } else {
    warn('PWHT Requirement', 'Not required', 'WPS requires PWHT — check job specification',
      'Confirm PWHT temp range and hold time are documented in job traveler', 'wps_extracted_parameters.csv → pwht_required');
  }

  // Extraction confidence
  if (wps.extraction_review_required) {
    warn('Extraction Review', 'High confidence', `${(wps.extraction_confidence * 100).toFixed(0)}% — review required`,
      'Some fields were extracted with reduced confidence. Human review recommended before production use.',
      'wps_extracted_parameters.csv → extraction_review_required');
  }

  // Notch toughness caution
  if (job.requires_notch_toughness === 'True') {
    warn('Notch Toughness', 'Special coupon qualification required',
      'Job flagged: notch toughness required',
      'Ensure welder qualification used a vertical uphill coupon position (3G, 5G, or 6G) for all-position qualification.',
      'jobs.csv → requires_notch_toughness');
  }

  // WPS Restriction (contradiction) detection
  if (wps.wps_restrictions && wps.wps_restrictions.length > 0) {
    for (const restriction of wps.wps_restrictions) {
      if (restriction.parameter === 'thickness' && restriction.condition) {
        const condApplies = job.required_progression && 
          job.required_progression.toLowerCase().includes(restriction.condition.toLowerCase());
        if (condApplies && job.thickness_mm > restriction.max_mm) {
          // This is the contradiction: WPS range covers it, but restriction note limits it
          const contradictionDetail = `CONTRADICTION DETECTED: WPS general range covers ${job.thickness_mm} mm ` +
            `(${wps.groove_thickness_min_mm}–${wps.groove_thickness_max_mm} mm), but WPS notes state ` +
            `"${restriction.note}". Job thickness ${job.thickness_mm} mm exceeds restriction limit of ${restriction.max_mm} mm ` +
            `for ${restriction.condition} progression.`;
          warn('WPS Notes Restriction', 
            `≤${restriction.max_mm} mm for ${restriction.condition}`,
            `${job.thickness_mm} mm · ${restriction.condition}`,
            contradictionDetail,
            restriction.source || 'WPS Notes');
          // Mark this as a contradiction for UI display
          checks[checks.length - 1].isContradiction = true;
          checks[checks.length - 1].contradictionType = 'thickness_vs_notes';
        } else if (condApplies && job.thickness_mm <= restriction.max_mm) {
          pass('WPS Notes Restriction', 
            `≤${restriction.max_mm} mm for ${restriction.condition}`,
            `${job.thickness_mm} mm — within restriction limit`,
            restriction.source || 'WPS Notes');
        }
      }
    }
  }

  return { checks, hardFail };
}

// ─── Step 2: Qualification Mapping ───────────────────────────────────────────

function findQualificationMappings(wpsId, qualMapping) {
  const mappings = qualMapping.filter(m => m.wps_id === wpsId);
  const missing = mappings.length === 0 || mappings.every(m => m.mapping_status === 'missing');
  return { mappings, missing };
}

// ─── Step 3: Ticket Evaluation ───────────────────────────────────────────────

function evaluateTicket(ticket, job, mapping) {
  const passes = [];
  const failures = [];
  const warnings = [];

  if (!ticket) return { hardFail: true, failures: ['Ticket not found in matrix'], passes, warnings, score: -999 };

  // Active status
  if (ticket.active_status !== 'Active') {
    failures.push(`Ticket inactive (status: ${ticket.active_status})`);
  } else { passes.push('Ticket active'); }

  // Process
  const reqProcess = mapping ? mapping.required_process : '';
  if (reqProcess && !processCovers(ticket.process, reqProcess)) {
    failures.push(`Process mismatch: ticket is ${ticket.process}, required ${reqProcess}`);
  } else if (reqProcess) {
    passes.push(`Process: ${ticket.process} covers ${reqProcess}`);
  }

  // Material
  if (mapping) {
    const mf = ticket.base_material_from === mapping.required_material_from;
    const mt = ticket.base_material_to === mapping.required_material_to;
    if (!mf || !mt) {
      failures.push(`Material mismatch: ticket ${ticket.base_material_from}→${ticket.base_material_to}, required ${mapping.required_material_from}→${mapping.required_material_to}`);
    } else { passes.push(`Material: ${ticket.base_material_from} → ${ticket.base_material_to}`); }
  }

  // Thickness
  const th = job.thickness_mm;
  if (th < ticket.min_thickness_mm || th > ticket.max_thickness_mm) {
    failures.push(`Thickness out of range: job ${th} mm vs ticket ${ticket.min_thickness_mm}–${ticket.max_thickness_mm} mm`);
  } else { passes.push(`Thickness: ${th} mm within ${ticket.min_thickness_mm}–${ticket.max_thickness_mm} mm`); }

  // Position
  if (!positionCovers(ticket.position_coverage, job.required_position)) {
    failures.push(`Position not covered: job requires ${job.required_position}, ticket covers ${ticket.position_coverage}`);
  } else { passes.push(`Position: ${job.required_position} covered`); }

  // Progression
  const reqProg = mapping ? mapping.required_progression : job.required_progression;
  if (reqProg && ticket.weld_progression_coverage && ticket.weld_progression_coverage !== 'Any') {
    const progOk = ticket.weld_progression_coverage === reqProg ||
                   ticket.weld_progression_coverage.includes(reqProg);
    if (!progOk) {
      failures.push(`Progression not covered: ${ticket.weld_progression_coverage} vs required ${reqProg}`);
    } else { passes.push(`Progression: ${ticket.weld_progression_coverage}`); }
  }

  // Filler
  const reqFiller = mapping ? mapping.required_filler : '';
  if (reqFiller && !fillerCompatible(ticket.allowed_filler_class, reqFiller)) {
    warnings.push(`Filler class mismatch: ticket allows ${ticket.allowed_filler_class}, required ${reqFiller}`);
  } else if (reqFiller) {
    passes.push(`Filler: ${ticket.allowed_filler_class} compatible`);
  }

  // PWHT
  const reqPWHT = mapping ? mapping.required_pwht === 'True' : false;
  if (reqPWHT && !ticket.pwht_capable) {
    failures.push('PWHT required but ticket not PWHT capable');
  } else {
    passes.push(`PWHT: ${ticket.pwht_capable ? 'capable' : 'not required'}`);
  }

  // Limited vs full range
  if (ticket.full_or_limited_range !== 'Full range') {
    warnings.push(`Limited ticket: ${ticket.full_or_limited_range}`);
  }

  const hardFail = failures.length > 0;
  // Score: higher = better (used to pick best ticket for a welder)
  const score = hardFail ? (-100 + passes.length) : (100 + passes.length - warnings.length * 3);
  return { hardFail, failures, passes, warnings, score };
}

// ─── Step 4: Welder Evaluation ───────────────────────────────────────────────

function evaluateWelder(welder, job, mapping, qualMatrix) {
  const hardRejections = [];
  const warnings = [];
  const welderId = welder.welder_id;

  // Employment
  if (welder.employment_status !== 'Active') {
    hardRejections.push(`Employment status: ${welder.employment_status} (not Active)`);
  }

  // Availability
  const unavailable = welder.availability_status &&
    (welder.availability_status.toLowerCase().includes('unavailable') ||
     welder.availability_status.toLowerCase() === 'on leave' ||
     welder.availability_status.toLowerCase() === 'training');
  if (unavailable) {
    hardRejections.push(`Availability: ${welder.availability_status}`);
  }

  // Shift
  const shiftMatch = welder.shift === job.shift;
  if (!shiftMatch) {
    hardRejections.push(`Shift mismatch: welder on Shift ${welder.shift}, job requires Shift ${job.shift}`);
  }

  // Expiry
  if (welder.days_until_expiry < 0) {
    hardRejections.push(`Qualification expired on ${welder.qualification_expiry_date} (${Math.abs(welder.days_until_expiry)} days ago)`);
  } else if (welder.days_until_expiry <= 30) {
    warnings.push(`Qualification expires in ${welder.days_until_expiry} days (${welder.qualification_expiry_date})`);
  }

  // Continuity
  if (welder.continuity_status === 'Expired') {
    hardRejections.push('Continuity record expired — requalification required');
  } else if (welder.continuity_status === 'At risk') {
    warnings.push('Continuity at risk — verify recent weld log');
  }

  // Quality flags
  if (welder.recent_ncr_count > 0) {
    warnings.push(`Recent NCR count: ${welder.recent_ncr_count}`);
  }
  if (welder.recent_quality_flag && welder.recent_quality_flag !== 'None') {
    warnings.push(`Quality flag: ${welder.recent_quality_flag}`);
  }

  // Data completeness checks
  if (welder.data_completeness) {
    const dc = welder.data_completeness;
    if (dc.last_weld_log === 'missing') {
      warnings.push(`Incomplete data: Last weld log missing — continuity cannot be independently verified`);
    }
    if (dc.qualification_ticket === 'missing_certificate') {
      warnings.push(`Incomplete data: Qualification certificate copy not located in document system`);
    }
    if (dc.qualification_ticket === 'missing') {
      hardRejections.push(`Incomplete data: Qualification ticket not found in system`);
    }
  }

  // Ticket evaluation — find best valid ticket
  const ticketIds = pipeList(welder.active_ticket_ids.replace(/\|/g, '|'));
  let bestTicket = null;
  let bestResult = null;

  for (const tid of ticketIds) {
    const ticket = qualMatrix.find(q => q.ticket_id === tid);
    const result = evaluateTicket(ticket, job, mapping);
    if (!bestResult || result.score > bestResult.score) {
      bestTicket = ticket;
      bestResult = result;
    }
  }

  if (!bestTicket) {
    hardRejections.push('No qualification ticket found in matrix');
  } else if (bestResult && bestResult.hardFail) {
    hardRejections.push(...bestResult.failures);
    if (bestResult.warnings.length) warnings.push(...bestResult.warnings);
  } else if (bestResult) {
    if (bestResult.warnings.length) warnings.push(...bestResult.warnings);
  }

  // Determine status
  let status;
  if (hardRejections.length > 0) {
    const isUnavail = hardRejections.some(r => r.startsWith('Shift mismatch') || r.startsWith('Availability'));
    const isExpired = hardRejections.some(r => r.startsWith('Qualification expired') || r.startsWith('Continuity record expired'));
    if (isUnavail && !isExpired) status = 'Unavailable';
    else if (isExpired) status = 'Expired';
    else status = 'Rejected';
  } else if (warnings.length === 0) {
    const isPreferred = bestTicket && mapping &&
      (bestTicket.ticket_id === mapping.preferred_ticket_id) &&
      bestTicket.full_or_limited_range === 'Full range';
    status = isPreferred ? 'Recommended' : 'Eligible';
  } else {
    // Has warnings but no hard rejections
    const majorWarning = warnings.some(w => w.includes('Continuity') || w.includes('expires in'));
    status = majorWarning ? 'Backup' : 'Eligible';
  }

  // Constraint checks for reasoning drawer
  const constraints = buildConstraints(welder, job, mapping, bestTicket, bestResult);

  // Ranking score (lower = higher rank; eligible ranks 0-999, rejected 1000+)
  const passCount = (bestResult ? bestResult.passes.length : 0) +
    (welder.employment_status === 'Active' ? 1 : 0) +
    (shiftMatch ? 1 : 0) +
    (welder.days_until_expiry >= 0 ? 1 : 0) +
    (welder.continuity_status === 'Active' ? 1 : 0);

  let rankScore;
  const statusOrder = { Recommended: 0, Eligible: 10, Backup: 20, Conditional: 30, 'Engineering Review': 40, Unavailable: 50, Expired: 60, Rejected: 70 };
  const base = statusOrder[status] ?? 70;
  const warnPenalty = warnings.length * 2;
  const ncrPenalty = welder.recent_ncr_count * 5;
  const expiryBonus = welder.days_until_expiry > 90 ? 0 : (welder.days_until_expiry > 30 ? 1 : 3);
  // Limited or alternate ticket costs more in ranking than a quality flag
  const limitedPenalty = (bestTicket && bestTicket.full_or_limited_range !== 'Full range') ? 10 : 0;
  rankScore = base * 10 + warnPenalty + ncrPenalty + expiryBonus + limitedPenalty - passCount;

  return { welder, status, hardRejections, warnings, bestTicket, bestResult, constraints, rankScore };
}

function buildConstraints(welder, job, mapping, ticket, ticketResult) {
  const rows = [];
  const r = (name, required, candidate, result, source) =>
    rows.push({ name, required, candidate, result, source });

  r('Employment Status', 'Active', welder.employment_status,
    welder.employment_status === 'Active' ? 'pass' : 'fail',
    'welders.csv → employment_status');

  r('Availability', 'Available', welder.availability_status,
    !welder.availability_status?.toLowerCase().includes('unavailable') &&
    !['on leave','training'].includes(welder.availability_status?.toLowerCase()) ? 'pass' : 'fail',
    'welders.csv → availability_status');

  r('Shift', `Shift ${job.shift}`, `Shift ${welder.shift}`,
    welder.shift === job.shift ? 'pass' : 'fail',
    'welders.csv → shift');

  r('Process', mapping ? mapping.required_process : 'SMAW',
    ticket ? ticket.process : '—',
    ticket && processCovers(ticket.process, mapping?.required_process || '') ? 'pass' : 'fail',
    'qualification_matrix.csv → process');

  r('Base Material', mapping ? `${mapping.required_material_from} → ${mapping.required_material_to}` : '—',
    ticket ? `${ticket.base_material_from} → ${ticket.base_material_to}` : '—',
    ticket && mapping && ticket.base_material_from === mapping.required_material_from && ticket.base_material_to === mapping.required_material_to ? 'pass' : 'fail',
    'qualification_matrix.csv → base_material');

  r('Thickness', `${job.thickness_mm} mm must be in range`,
    ticket ? `${ticket.min_thickness_mm}–${ticket.max_thickness_mm} mm` : '—',
    ticket && job.thickness_mm >= ticket.min_thickness_mm && job.thickness_mm <= ticket.max_thickness_mm ? 'pass' : 'fail',
    'qualification_matrix.csv → min/max_thickness_mm');

  r('Position', job.required_position,
    ticket ? ticket.position_coverage : '—',
    ticket && positionCovers(ticket.position_coverage, job.required_position) ? 'pass' : 'fail',
    'qualification_matrix.csv → position_coverage');

  r('Progression', job.required_progression,
    ticket ? ticket.weld_progression_coverage : '—',
    ticket && (ticket.weld_progression_coverage === job.required_progression || ticket.weld_progression_coverage === 'Any' || ticket.weld_progression_coverage?.includes(job.required_progression)) ? 'pass' : 'warn',
    'qualification_matrix.csv → weld_progression_coverage');

  r('PWHT Capability', mapping?.required_pwht === 'True' ? 'Required' : 'Not required',
    ticket ? (ticket.pwht_capable ? 'PWHT capable' : 'Not PWHT capable') : '—',
    mapping?.required_pwht !== 'True' ? 'pass' : (ticket?.pwht_capable ? 'pass' : 'fail'),
    'qualification_matrix.csv → pwht_capable');

  r('Ticket Status', 'Active',
    ticket ? ticket.active_status : '—',
    ticket?.active_status === 'Active' ? 'pass' : 'fail',
    'qualification_matrix.csv → active_status');

  r('Continuity', 'Active', welder.continuity_status,
    welder.continuity_status === 'Active' ? 'pass' : welder.continuity_status === 'Expired' ? 'fail' : 'warn',
    'welders.csv → continuity_status');

  r('Qualification Expiry', '≥ 0 days remaining',
    `${welder.days_until_expiry >= 0 ? '+' : ''}${welder.days_until_expiry} days (${welder.qualification_expiry_date})`,
    welder.days_until_expiry < 0 ? 'fail' : welder.days_until_expiry <= 30 ? 'warn' : 'pass',
    'welders.csv → days_until_expiry');

  r('Recent NCR Count', '0',
    String(welder.recent_ncr_count),
    welder.recent_ncr_count === 0 ? 'pass' : 'warn',
    'welders.csv → recent_ncr_count');

  r('Quality Flag', 'None',
    welder.recent_quality_flag || 'None',
    (!welder.recent_quality_flag || welder.recent_quality_flag === 'None') ? 'pass' : 'warn',
    'welders.csv → recent_quality_flag');

  // Data completeness
  if (welder.data_completeness) {
    const dc = welder.data_completeness;
    const dcOk = dc.last_weld_log !== 'missing' && dc.qualification_ticket !== 'missing_certificate' && dc.qualification_ticket !== 'missing';
    r('Data Completeness', 'All records on file',
      dcOk ? 'Complete' : (dc.note || 'Incomplete — records missing'),
      dcOk ? 'pass' : 'warn',
      'welders.csv → data_completeness');
  }

  return rows;
}

// ─── Step 5: Full Welder Match ────────────────────────────────────────────────

function matchWelders(job, wps, qualMapping, qualMatrix, welders, pqrs) {
  const { mappings, missing } = findQualificationMappings(wps?.wps_id, qualMapping);

  if (!wps || missing) return { error: 'missing_mapping', results: [], mappings: [] };

  // Use the primary (first) mapping row
  const primaryMapping = mappings[0];

  const results = welders.map(w => evaluateWelder(w, job, primaryMapping, qualMatrix));

  // Sort by rankScore, then by welder_id for stability
  results.sort((a, b) => a.rankScore - b.rankScore || a.welder.welder_id.localeCompare(b.welder.welder_id));

  return { results, mappings, primaryMapping, error: null };
}

// ─── Exception detection ──────────────────────────────────────────────────────

/** Find the best alternate WPS for a job when the referenced WPS doesn't match */
function findCorrectWPS(job, allWps) {
  const candidates = allWps.filter(w => {
    // Must match material group
    if (w.base_material_from !== job.base_material_from || w.base_material_to !== job.base_material_to) return false;
    // Must be qualified
    if (w.qualification_status !== 'Qualified') return false;
    // Must cover thickness
    if (job.thickness_mm < w.groove_thickness_min_mm || job.thickness_mm > w.groove_thickness_max_mm) return false;
    // Must not be the same broken WPS
    if (w.wps_id === job.wps_id) return false;
    return true;
  });
  // Check for restriction violations on candidates too
  return candidates.filter(w => {
    if (w.wps_restrictions) {
      for (const r of w.wps_restrictions) {
        if (r.parameter === 'thickness' && r.condition) {
          const condApplies = job.required_progression &&
            job.required_progression.toLowerCase().includes(r.condition.toLowerCase());
          if (condApplies && job.thickness_mm > r.max_mm) return false;
        }
      }
    }
    return true;
  });
}

function detectExceptions(jobs, wps, qualMapping, pqrs) {
  const exceptions = [];

  for (const job of jobs) {
    const jobWps = wps.find(w => w.wps_id === job.wps_id);
    if (!jobWps) {
      exceptions.push({ job, reason: 'No WPS found', type: 'missing_wps', owner: 'Welding Engineering', action: 'Identify or create applicable WPS for this job' });
      continue;
    }

    const { missing: mapMissing } = findQualificationMappings(jobWps.wps_id, qualMapping);
    if (mapMissing) {
      exceptions.push({ job, wps: jobWps, reason: 'Qualification mapping missing — no valid ticket mapping found for this WPS', type: 'missing_mapping', owner: 'Welding Engineering', action: 'Create qualification mapping for WPS and submit for QC review' });
      continue;
    }

    const { checks, hardFail } = validateJobAgainstWPS(job, jobWps, pqrs);
    if (hardFail) {
      const failedChecks = checks.filter(c => c.status === 'fail');
      failedChecks.forEach(fc => {
        const isMaterial = fc.name === 'Base Material Group';
        const isThickness = fc.name === 'Thickness Range';
        const isQualStatus = fc.name === 'WPS Qualification Status';

        // For material mismatches and thickness issues, try to find the correct WPS
        const suggestedWps = (isMaterial || isThickness) ? findCorrectWPS(job, wps) : [];
        const suggestion = suggestedWps.length > 0
          ? `AI found ${suggestedWps.length} applicable WPS: ${suggestedWps.map(w => w.wps_id + ' (' + w.source_wps_no + ', ' + w.welding_process_root + ', ' + w.base_material_from + '→' + w.base_material_to + ', ' + w.groove_thickness_min_mm + '–' + w.groove_thickness_max_mm + ' mm)').join('; ')}`
          : null;

        let action;
        if (isThickness) {
          action = suggestion
            ? `Job references incorrect WPS for ${job.thickness_mm} mm. ${suggestion}`
            : `No qualified WPS found covering ${job.thickness_mm} mm. Obtain qualified WPS or redesign joint.`;
        } else if (isMaterial) {
          action = suggestion
            ? `Job references incorrect WPS (${jobWps.source_wps_no} covers ${jobWps.base_material_from}→${jobWps.base_material_to}). ${suggestion}`
            : `Assign a WPS qualified for ${job.base_material_from} → ${job.base_material_to}.`;
        } else {
          action = 'Review with welding engineering.';
        }

        exceptions.push({
          job, wps: jobWps,
          reason: fc.detail || `${fc.name} failed: ${fc.actual}`,
          type: isThickness ? 'thickness_exceeded' : isMaterial ? 'material_mismatch' : isQualStatus ? 'unqualified_wps' : 'validation_fail',
          owner: isMaterial ? 'Welding Engineering' : isThickness ? 'Welding Engineering / Planning' : 'Welding Engineering',
          action: action,
          check: fc,
          suggestedWps: suggestedWps
        });
      });
    }
  }

  // Also include contradiction exceptions — WPS notes that conflict with general ranges
  for (const job of jobs) {
    const jobWps = wps.find(w => w.wps_id === job.wps_id);
    if (jobWps && jobWps.wps_restrictions) {
      for (const restriction of jobWps.wps_restrictions) {
        if (restriction.parameter === 'thickness' && restriction.condition) {
          const condApplies = job.required_progression &&
            job.required_progression.toLowerCase().includes(restriction.condition.toLowerCase());
          if (condApplies && job.thickness_mm > restriction.max_mm) {
            // For contradictions, also suggest alternate WPS without the restriction
            const altWps = findCorrectWPS(job, wps);
            const suggestion = altWps.length > 0
              ? `AI found ${altWps.length} alternate WPS without this restriction: ${altWps.map(w => w.wps_id + ' (' + w.source_wps_no + ')').join(', ')}`
              : 'No alternate WPS found without this restriction.';

            exceptions.push({
              job, wps: jobWps,
              reason: `WPS CONTRADICTION: General thickness range covers ${job.thickness_mm} mm (${jobWps.groove_thickness_min_mm}–${jobWps.groove_thickness_max_mm} mm), but WPS notes restrict ${restriction.condition} to max ${restriction.max_mm} mm`,
              type: 'wps_contradiction',
              owner: 'Welding Engineering',
              action: `Review WPS notes restriction for ${restriction.condition}. ${suggestion}`,
              contradictionDetail: restriction.note,
              suggestedWps: altWps
            });
          }
        }
      }
    }
  }

  // Include all exceptions — no demo-only filtering
  // De-duplicate by job_id + type
  const seen = new Set();
  return exceptions.filter(e => {
    const key = `${e.job.job_id}-${e.type}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

/** Update job statuses based on detected exceptions */
function applyExceptionStatuses(jobs, exceptions) {
  const exceptionJobIds = new Set(exceptions.map(e => e.job.job_id));
  for (const job of jobs) {
    if (exceptionJobIds.has(job.job_id) && job.status === 'Needs assignment') {
      job.status = 'Needs review';
    }
  }
}
