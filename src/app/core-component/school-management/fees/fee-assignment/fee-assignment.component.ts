import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';

interface AssignmentFeeComponent {
  id?: number;
  studentAcademicId?: number;
  feeStructureId?: number;
  name: string;
  amount: number;
  discount: number;
  fine?: number;
  payable?: number;
  paid?: number;
  balance?: number;
  status?: string;
  removable: boolean;
  isUpdating?: boolean;
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
  searchTerm = '';
  students: any[] = [];
  gradeOptions: any[] = [];
  isGradesLoading = false;
  selectedStudent: any = null;
  isLoading = false;
  isAssignedFeesLoading = false;
  assignedFeesError = '';
  feeUpdateMessage = '';
  errorMessage = '';
  page = 1;
  readonly pageSize = 8;
  splitPercent = 43;
  isResizing = false;
  private resizeContainer?: DOMRect;
  private assignedFeesRequestId = 0;
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  feeComponents: AssignmentFeeComponent[] = [];

  constructor(
    private schoolManagementService: SchoolManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getGradeDetails();
    this.getStudentAcademicDetails();
  }

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
  get totalPayable(): number {
    return this.feeComponents.reduce(
      (sum, item) => sum + this.calculatePayable(item), 0);
  }
  get totalPaid(): number {
    return this.feeComponents.reduce((sum, item) => sum + Number(item.paid || 0), 0);
  }
  get totalBalance(): number {
    return this.feeComponents.reduce((sum, item) => sum + this.calculateBalance(item), 0);
  }

  calculatePayable(fee: AssignmentFeeComponent): number {
    return Math.max(0, Number(fee.amount || 0) - Number(fee.discount || 0) + Number(fee.fine || 0));
  }

  calculateBalance(fee: AssignmentFeeComponent): number {
    return Math.max(0, this.calculatePayable(fee) - Number(fee.paid || 0));
  }

  calculatedStatus(fee: AssignmentFeeComponent): string {
    const balance = this.calculateBalance(fee);
    if (balance === 0) return 'PAID';
    return Number(fee.paid || 0) > 0 ? 'PARTIAL' : 'PENDING';
  }
  getGradeDetails(): void {
    this.isGradesLoading = true;
    this.schoolManagementService.getGradeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.gradeOptions = Array.isArray(rows) ? rows : [];
        this.isGradesLoading = false;
      },
      error: () => {
        this.gradeOptions = [];
        this.isGradesLoading = false;
      }
    });
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
        if (this.selectedStudent) this.loadAssignedFees(this.selectedStudent);
        else this.feeComponents = [];
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
    this.getStudentAcademicDetails();
  }
  searchStudents(): void { this.page = 1; }
  selectStudent(student: any): void {
    this.selectedStudent = student;
    this.loadAssignedFees(student);
  }
  clearSelection(): void {
    this.assignedFeesRequestId++;
    this.selectedStudent = null;
    this.feeComponents = [];
    this.assignedFeesError = '';
  }

  loadAssignedFees(student: any): void {
    const studentId = Number(student?.studentId ?? student?.id);
    const sessionName = String(student?.sessionName || this.sessionName || '').trim();
    const selectedGrade = this.normalizeGrade(student?.grade);
    if (!studentId || !sessionName) {
      this.feeComponents = [];
      this.assignedFeesError = 'Student academic details are incomplete.';
      return;
    }

    this.isAssignedFeesLoading = true;
    this.assignedFeesError = '';
    this.feeComponents = [];
    const requestId = ++this.assignedFeesRequestId;
    this.schoolManagementService.getAssignedFeeToStudentDetails(studentId, sessionName).subscribe({
      next: (response: any) => {
        if (requestId !== this.assignedFeesRequestId || this.selectedStudent !== student) return;
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        const matchingRows = (Array.isArray(rows) ? rows : []).filter((fee: any) => {
          const sameStudent = Number(fee?.studentId) === studentId;
          const sameSession = String(fee?.sessionName ?? '').trim() === sessionName;
          const sameGrade = !selectedGrade || this.normalizeGrade(fee?.grade) === selectedGrade;
          return sameStudent && sameSession && sameGrade;
        });
        const assignedFees = [...new Map<string, any>(matchingRows.map((fee: any) => [
          String(fee?.feeStructureId ?? fee?.id), fee
        ] as [string, any])).values()];
        this.feeComponents = assignedFees.map((fee: any) => ({
          id: fee.id,
          studentAcademicId: fee.studentAcademicId,
          feeStructureId: fee.feeStructureId,
          name: fee.feeTypeName || `Fee Structure ${fee.feeStructureId}`,
          amount: Number(fee.assignedAmount || 0),
          discount: Number(fee.discountAmount || 0),
          fine: Number(fee.fineAmount || 0),
          payable: Number(fee.payableAmount || 0),
          paid: Number(fee.paidAmount || 0),
          balance: Number(fee.balanceAmount || 0),
          status: fee.status || 'PENDING',
          removable: false
        }));
        this.assignedFeesError = this.feeComponents.length ? '' : 'No fee structure is assigned to this student.';
        this.isAssignedFeesLoading = false;
      },
      error: (error: any) => {
        if (requestId !== this.assignedFeesRequestId || this.selectedStudent !== student) return;
        this.feeComponents = [];
        this.assignedFeesError = error?.error?.responseMessage || 'Unable to load assigned fee structures.';
        this.isAssignedFeesLoading = false;
      }
    });
  }

  updateDiscount(fee: AssignmentFeeComponent): void {
    if (fee.isUpdating) return;
    const discount = Number(fee.discount || 0);
    if (discount < 0 || discount > Number(fee.amount || 0) + Number(fee.fine || 0)) {
      this.assignedFeesError = 'Discount must be between zero and the assigned amount.';
      return;
    }

    fee.isUpdating = true;
    this.assignedFeesError = '';
    this.feeUpdateMessage = '';
    this.schoolManagementService.updateAssignedFeeToStudent(fee).subscribe({
      next: (response: any) => {
        const payload = response?.payload;
        const success = Number(response?.responseCode) === 200 && Number(payload?.respCode) === 200;
        if (success) {
          fee.payable = Number(payload?.payableAmount ?? this.calculatePayable(fee));
          fee.balance = Number(payload?.balanceAmount ?? this.calculateBalance(fee));
          fee.status = payload?.status || this.calculatedStatus(fee);
          this.feeUpdateMessage = `${fee.name} discount updated successfully.`;
        } else {
          this.assignedFeesError = payload?.respMesg || response?.responseMessage || 'Unable to update discount.';
        }
        fee.isUpdating = false;
      },
      error: (error: any) => {
        this.assignedFeesError = error?.error?.responseMessage || 'Unable to update discount.';
        fee.isUpdating = false;
      }
    });
  }

  viewAssignedFee(template: TemplateRef<any>): void {
    this.dialog.open(template, {
      width: '340px',
      maxWidth: '90vw',
      panelClass: 'custom-modal'
    });
  }

  private normalizeGrade(value: any): string {
    return String(value ?? '').trim().toLowerCase().replace(/^(grade|class)\s*/i, '');
  }
  setPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.page = page; }
  resetAssignment(): void { this.feeComponents.forEach(item => item.discount = 0); }
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
    return this.schoolManagementService.studentImageUrl(student, 'assets/img/profiles/avatar-01.jpg');
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
