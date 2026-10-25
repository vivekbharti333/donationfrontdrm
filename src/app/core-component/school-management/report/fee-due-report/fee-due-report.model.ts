import { DueFeeRow } from './fee-due-report.service';

export interface DueFeeDisplayRow extends DueFeeRow {
  installmentNames: string;
}

export interface DueStudentGroup {
  key: number;
  studentName: string;
  fatherName?: string;
  admissionNo: string;
  rollNumber: string;
  grade: string;
  gradeSection: string;
  fees: DueFeeDisplayRow[];
}

export function groupDueFeeRows(rows: DueFeeRow[], mergeSessions = false): DueStudentGroup[] {
  const students = new Map<number, DueStudentGroup>();
  for (const row of rows) {
    const studentKey = mergeSessions ? row.studentId : row.studentAcademicId;
    let group = students.get(studentKey);
    if (!group) {
      group = {
        key: studentKey,
        studentName: row.studentName,
        fatherName: row.fatherName,
        admissionNo: row.admissionNo,
        rollNumber: row.rollNumber,
        grade: row.grade,
        gradeSection: row.gradeSection,
        fees: []
      };
      students.set(studentKey, group);
    }
    // Never display a missing or malformed balance as a zero balance.
    const invalidAmount = row.totalDue == null || !Number.isFinite(Number(row.totalDue)) || Number(row.totalDue) < 0;
    group.fees.push({
      ...row,
      totalDue: invalidAmount || row.requiresReview ? null : Number(row.totalDue),
      requiresReview: row.requiresReview || invalidAmount,
      reviewMessage: row.reviewMessage || (invalidAmount ? 'The balance needs review before it can be included in the total.' : ''),
      installmentNames: (row.dueInstallments || []).map(item => item.installmentName).join(', ')
    });
  }
  return Array.from(students.values());
}
