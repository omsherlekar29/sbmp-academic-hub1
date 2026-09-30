/* SBMP Academic Hub · Om Sherlekar (B053) · CSE-B · (c) 2026 */

// Diploma rule: 75% minimum attendance required to appear for exams
export const ATTENDANCE_RULES = {
  minimum: 75,
  warning: 70,
  critical: 60
};

// Subject → which types of classes are held (TH = Theory, PR = Practical, TU = Tutorial)
// Matches the official college attendance report format
export const SUBJECT_TYPES = {
  ASC268902: ['TH', 'PR'],
  CMS268903: ['TH', 'TU'],
  EMT268901: ['TH', 'TU'],
  ENG268904: ['PR', 'TH'],
  FCS260801: ['PR', 'TH'],
  UHV268905: ['TH', 'TU'],
  WSD260802: ['PR', 'TH']
};

// Friendly labels for each class type
export const TYPE_LABELS = {
  TH: 'Theory',
  PR: 'Practical',
  TU: 'Tutorial',
  CL: 'Class'
};

// Get status label + CSS class from a percentage
export function getAttendanceStatus(percent) {
  if (percent === null || isNaN(percent)) return { label: 'No data', cls: 'att-neutral' };
  if (percent >= ATTENDANCE_RULES.minimum) return { label: 'Safe', cls: 'att-safe' };
  if (percent >= ATTENDANCE_RULES.warning) return { label: 'Warning', cls: 'att-warning' };
  if (percent >= ATTENDANCE_RULES.critical) return { label: 'Low', cls: 'att-low' };
  return { label: 'Critical', cls: 'att-critical' };
}