import { Component, HostListener, OnInit } from '@angular/core';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';

interface AssignmentFeeComponent {
  name: string;
  amount: number;
  discount: number;
  removable: boolean;
}

// Student fee assignment and exception editor.
@Component({
  selector: 'app-fee-assignment',
  templateUrl: './fee-assignment.component.html',
  styleUrl: './fee-assignment.component.scss'
})
export class FeeAssignmentComponent implements OnInit {
  sessionName = '2026-27';
  grade = '';
  gradeSection = '';
  classFilter = '';
  feeStructure = 'Annual Fee Structure 25-26';
  searchTerm = '';
  students: any[] = [];
  selectedStudent: any = null;
  isLoading = false;
  errorMessage = '';
  page = 1;
  readonly pageSize = 8;
  reason = '';
  splitPercent = 43;
  isResizing = false;
  private resizeContainer?: DOMRect;
  readonly studentImageBaseUrl = Constant.Site_Url + 'studentImage/';
  readonly feeComponents: AssignmentFeeComponent[] = [
    { name: 'Tuition Fee', amount: 25000, discount: 0, removable: false },
    { name: 'Transport Fee', amount: 12000, discount: 2000, removable: true },
    { name: 'Library Fee', amount: 2000, discount: 0, removable: false },
    { name: 'Activity Fee', amount: 1500, discount: 0, removable: false }
  ];

  constructor(private schoolManagementService: SchoolManagementService) {}

  ngOnInit(): void { this.getStudentAcademicDetails(); }

  get filteredStudents(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return term ? this.students.filter(student => [this.studentName(student), student?.rollNumber,
      student?.admissionNumber, student?.admissionNo, student?.studentId]
      .some(value => String(value ?? '').toLowerCase().includes(term))) : this.students;
  }

  get visibleStudents(): any[] {
    return this.filteredStudents.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize)); }
  get totalFee(): number { return this.feeComponents.reduce((sum, item) => sum + Number(item.amount || 0), 0); }
  get totalDiscount(): number { return this.feeComponents.reduce((sum, item) => sum + Number(item.discount || 0), 0); }
  get totalPayable(): number { return this.totalFee - this.totalDiscount; }
  get availableClasses(): { value: string; label: string }[] {
    const classes = new Map<string, string>();
    this.students.forEach(student => {
      const grade = String(student?.grade || '').trim();
      const section = String(student?.gradeSection || '').trim();
      if (grade) classes.set(`${grade}|${section}`, section ? `Class ${grade} - ${section}` : `Class ${grade}`);
    });
    return [...classes].map(([value, label]) => ({ value, label }));
  }

  getStudentAcademicDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.schoolManagementService.getStudentAcademicDetails({
      sessionName: this.sessionName,
      grade: this.grade,
      gradeSection: this.gradeSection,
      status: ''
    }).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.students = Array.isArray(rows) ? rows : [];
        this.errorMessage = Array.isArray(rows) ? '' : (response?.responseMessage || 'No students were returned.');
        this.page = 1;
        this.selectedStudent = this.students[0] || null;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.students = [];
        this.selectedStudent = null;
        this.errorMessage = error?.error?.responseMessage || 'Unable to load students.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const [grade = '', section = ''] = this.classFilter.split('|');
    this.grade = grade;
    this.gradeSection = section;
    this.getStudentAcademicDetails();
  }
  searchStudents(): void { this.page = 1; }
  selectStudent(student: any): void { this.selectedStudent = student; }
  clearSelection(): void { this.selectedStudent = null; }
  setPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.page = page; }
  resetAssignment(): void { this.reason = ''; this.feeComponents.forEach(item => item.discount = 0); }
  removeFee(index: number): void { if (this.feeComponents[index]?.removable) this.feeComponents.splice(index, 1); }
  addOtherFee(): void { this.feeComponents.push({ name: 'Additional Fee', amount: 0, discount: 0, removable: true }); }
  studentName(student: any): string {
    return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(' ') || student?.studentName || 'Student';
  }
  admissionNumber(student: any): string { return student?.admissionNumber || student?.admissionNo || student?.studentId || '—'; }
  className(student: any): string {
    const grade = student?.grade || '—';
    return student?.gradeSection ? `${grade} - ${student.gradeSection}` : grade;
  }
  studentImage(student: any): string {
    const picture = student?.studentPicture || student?.profilePicture;
    return picture ? this.studentImageBaseUrl + picture : 'assets/img/profiles/avatar-01.jpg';
  }
  trackByStudent(index: number, student: any): any { return student?.studentId || student?.id || index; }

  startResize(event: PointerEvent): void {
    const grid = (event.currentTarget as HTMLElement).parentElement;
    if (!grid) return;
    event.preventDefault();
    this.resizeContainer = grid.getBoundingClientRect();
    this.isResizing = true;
  }

  @HostListener('document:pointermove', ['$event'])
  resizePanels(event: PointerEvent): void {
    if (!this.isResizing || !this.resizeContainer) return;
    const position = ((event.clientX - this.resizeContainer.left) / this.resizeContainer.width) * 100;
    this.splitPercent = Math.min(65, Math.max(30, position));
  }

  @HostListener('document:pointerup')
  stopResize(): void {
    this.isResizing = false;
    this.resizeContainer = undefined;
  }

}
