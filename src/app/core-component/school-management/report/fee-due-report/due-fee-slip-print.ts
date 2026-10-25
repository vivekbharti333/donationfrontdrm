import type { DueStudentGroup } from './fee-due-report.model';
import type { DueSchoolHeader } from './fee-due-report.service';

export const DUE_SLIP_PRINT_STYLES = `
  @page { size: A4 portrait; margin: 10mm; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; color: #1d304b; font-family: Arial, sans-serif; }
  * { box-sizing: border-box; }
  .due-print-report { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .due-slip-page { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(auto, 1fr)); gap: 6mm; min-height: 276mm; align-items: stretch; }
  .due-slip-page::before, .due-slip-page::after { content: ''; position: absolute; pointer-events: none; }
  .due-slip-page::before { left: 50%; top: 0; bottom: 0; border-left: 1px dashed #8996a8; }
  .due-slip-page::after { top: 50%; left: 0; right: 0; border-top: 1px dashed #8996a8; }
  .due-slip-page:not(:last-child) { break-after: page; page-break-after: always; }
  .due-student-slip { display: flex; flex-direction: column; min-width: 0; padding: 5mm; break-inside: avoid; page-break-inside: avoid; }
  .due-school-heading { display: grid; grid-template-columns: 52px minmax(0, 1fr) 52px; min-height: 66px; align-items: center; gap: 7px; padding-bottom: 11px; border-bottom: 1px solid #e1e7ef; break-inside: avoid; }
  .due-school-heading img { grid-column: 1; width: 52px; height: 54px; object-fit: contain; }
  .due-school-titles { grid-column: 2; text-align: center; }
  .due-school-heading h2 { margin: 0; font-size: 13px; line-height: 1.35; font-weight: 700; color: #1d304b; overflow-wrap: anywhere; }
  .due-school-heading h1 { margin: 6px 0 0; font-size: 10px; line-height: 1.3; letter-spacing: 1.5px; text-transform: uppercase; color: #9b5b29; }
  .due-slip-student { padding: 11px 0 10px; }
  .due-slip-student-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
  .due-slip-student-name { margin: 0; min-width: 0; font-size: 15px; line-height: 1.3; font-weight: 700; overflow-wrap: anywhere; }
  .due-slip-date { flex-shrink: 0; font-size: 10px; line-height: 1.4; color: #52637b; white-space: nowrap; }
  .due-slip-father { margin: 0 0 8px; font-size: 10px; line-height: 1.4; color: #52637b; overflow-wrap: anywhere; }
  .due-slip-identifiers { display: grid; grid-template-columns: 1.25fr 1fr .7fr; gap: 8px; margin: 0; }
  .due-slip-identifiers div { min-width: 0; }
  .due-slip-identifiers dt { font-size: 9px; line-height: 1.4; color: #758195; margin: 0 0 2px; }
  .due-slip-identifiers dd { font-size: 11px; line-height: 1.4; font-weight: 600; color: #334660; margin: 0; overflow-wrap: anywhere; }
  .due-slip-fees { border-collapse: collapse; table-layout: fixed; width: 100%; font-size: 11px; line-height: 1.45; margin-bottom: 11px; }
  .due-slip-fees th { border-top: 1px solid #e1e7ef; border-bottom: 1px solid #dce3ec; padding: 6px 4px; background: #f4f6f9; font-size: 9px; font-weight: 700; text-align: left; color: #52637b; }
  .due-slip-fees td { padding: 7px 4px; border-bottom: 1px solid #e9edf3; vertical-align: top; overflow-wrap: anywhere; }
  .due-slip-fees th:first-child { width: 30%; }
  .due-slip-fees th:last-child { width: 25%; }
  .due-slip-fees .due-slip-amount { text-align: right; font-weight: 600; white-space: nowrap; }
  .due-slip-fee-year { display: block; margin-top: 2px; color: #7b8798; font-size: 9px; }
  .due-slip-review { color: #9b682c; font-size: 9px; line-height: 1.5; }
  .due-slip-total { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding: 9px 10px; border: 1px solid #eddfca; border-radius: 4px; background: #fcf8f1; }
  .due-slip-total span { font-size: 10px; line-height: 1.4; font-weight: 600; color: #69563e; }
  .due-slip-total strong { font-size: 18px; line-height: 1.3; color: #263c58; white-space: nowrap; }
  .due-slip-footer { margin: 10px 0 0; padding-top: 8px; border-top: 1px solid #edf0f4; font-size: 9px; line-height: 1.5; color: #788496; }
  .due-slip-fees tr, .due-slip-total { break-inside: avoid; }
`;

/** Use DOM text nodes for all API data, preserving student isolation and safe escaping. */
export function appendStudentDueSlips(target: Document, students: DueStudentGroup[], school: DueSchoolHeader): HTMLElement {
  const report = target.createElement('article'); report.className = 'due-print-report';
  const addText = (parent: HTMLElement, tag: string, text: string, className = ''): HTMLElement => {
    const node = target.createElement(tag); node.textContent = text; node.className = className; parent.appendChild(node); return node;
  };
  const amount = (value: number): string => `₹ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
  const today = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date());
  let page: HTMLElement;
  for (const [index, student] of students.entries()) {
    if (index % 4 === 0) {
      page = target.createElement('div'); page.className = 'due-slip-page'; report.appendChild(page);
    }
    const slip = target.createElement('section'); slip.className = 'due-student-slip';
    const card = slip;
    const heading = target.createElement('header'); heading.className = 'due-school-heading'; card.appendChild(heading);
    if (school.logo) {
      const logo = target.createElement('img'); logo.src = school.logo; logo.alt = `${school.name} logo`; heading.appendChild(logo);
    }
    const titles = target.createElement('div'); titles.className = 'due-school-titles'; heading.appendChild(titles);
    addText(titles, 'h2', school.name); addText(titles, 'h1', 'Due Slip');
    const identity = target.createElement('section'); identity.className = 'due-slip-student'; card.appendChild(identity);
    const studentRow = target.createElement('div'); studentRow.className = 'due-slip-student-row'; identity.appendChild(studentRow);
    addText(studentRow, 'h3', student.studentName || '—', 'due-slip-student-name');
    addText(studentRow, 'span', today, 'due-slip-date');
    addText(identity, 'p', `Father: ${student.fatherName || '—'}`, 'due-slip-father');
    const identifiers = target.createElement('dl'); identifiers.className = 'due-slip-identifiers'; identity.appendChild(identifiers);
    for (const [label, value] of [
      ['Class / Section', [student.grade, student.gradeSection].filter(Boolean).join(' / ')],
      ['Admission No.', student.admissionNo], ['Roll No.', student.rollNumber]
    ]) {
      const field = target.createElement('div'); addText(field, 'dt', label); addText(field, 'dd', value || '—'); identifiers.appendChild(field);
    }
    const table = target.createElement('table'); table.className = 'due-slip-fees'; card.appendChild(table);
    const header = table.createTHead().insertRow();
    for (const label of ['Fee Type', 'Due Installments', 'Amount']) {
      const cell = target.createElement('th'); cell.scope = 'col'; cell.textContent = label;
      if (label === 'Amount') cell.className = 'due-slip-amount'; header.appendChild(cell);
    }
    const body = table.createTBody();
    let totalCents = 0; let reviews = 0;
    for (const fee of student.fees) {
      const row = body.insertRow(); const type = row.insertCell();
      addText(type, 'span', fee.feeTypeName || '—');
      if (fee.sessionName) addText(type, 'small', fee.sessionName, 'due-slip-fee-year');
      const periods = row.insertCell(); addText(periods, 'span', fee.installmentNames || '—');
      const balance = row.insertCell(); balance.className = 'due-slip-amount';
      if (fee.requiresReview || fee.totalDue == null) {
        reviews++; addText(periods, 'small', fee.reviewMessage || 'Please check this fee with the school.', 'due-slip-review');
        balance.textContent = 'Review'; balance.classList.add('due-slip-review');
      } else {
        totalCents += Math.round(fee.totalDue * 100); balance.textContent = amount(fee.totalDue);
      }
    }
    const total = target.createElement('div'); total.className = 'due-slip-total'; card.appendChild(total);
    addText(total, 'span', reviews ? 'Confirmed total due' : 'Total due'); addText(total, 'strong', amount(totalCents / 100));
    if (reviews) addText(card, 'p', `${reviews} fee ${reviews === 1 ? 'entry needs' : 'entries need'} school review and ${reviews === 1 ? 'is' : 'are'} excluded from this total.`, 'due-slip-review');
    addText(card, 'p', 'Dear Parent / Guardian, please clear the outstanding fees at the school office.', 'due-slip-footer');
    page!.appendChild(slip);
  }
  target.body.appendChild(report); return report;
}
