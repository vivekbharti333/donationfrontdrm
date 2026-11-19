const schoolPermissions = [
  { value: 'school-dashboard', name: 'School Dashboard' },
  { value: 'create-user', name: 'Create User' },
  { value: 'user-list', name: 'User List' },
  { value: 'add-student', name: 'Add Student' },
  { value: 'student-list', name: 'Student List' },
  { value: 'generate-school-receipt', name: 'Generate School Receipt' },
  { value: 'school-receipt-list', name: 'School Receipt List' },
  { value: 'student-academic', name: 'Student Academic' },
  { value: 'fee-type', name: 'Fee Type' },
  { value: 'fee-structure', name: 'Fee Structure' },
  { value: 'fee-assignment', name: 'Fee Assignment' },
  { value: 'attendance-mark', name: 'Mark Attendance' },
  { value: 'attendance-list', name: 'Attendance List' },
  { value: 'attendance-report', name: 'Attendance Report' },
  { value: 'grade', name: 'Grade' },
];

const donationPermissions = [
  { value: 'donation-dashboard', name: 'Donation Dashboard' },
  { value: 'create-user', name: 'Create User' },
  { value: 'user-list', name: 'User List' },
  { value: 'add-donation', name: 'Add Donation' },
  { value: 'all-donation-list', name: 'Donation List' },
  { value: 'pay-mode-report', name: 'Donation Report' },
  { value: 'fundrising-officer-report', name: 'Fundraising Officer Report' },
  { value: 'program', name: 'Donation Program' },
];

export function userPermissionsForService(service: unknown) {
  switch (String(service ?? '').trim().toUpperCase()) {
    case 'SCHOOL':
      return schoolPermissions;
    case 'DONATION':
      return donationPermissions;
    default:
      return [];
  }
}
