import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
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
  isSaving = false;
  isAssignedFeesLoading = false;
  feeAssignmentStatus: 'Assigned' | 'Not assigned' | null = null;
  private savedFeeStructureIds = new Set<number>();
  assignedFeesError = '';
  feeUpdateMessage = '';
  errorMessage = '';
  page = 1;
  readonly pageSize = 8;
  splitPercent = 43;
  isResizing = false;
  private resizeContainer?: DOMRect;
  private assignedFeesRequestId = 0;
  private excludedFeeStructureIds = new Set<number>();
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  feeComponents: AssignmentFeeComponent[] = [];
  pendingRemovals: AssignmentFeeComponent[] = [];

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
    this.pendingRemovals = [];
    this.excludedFeeStructureIds.clear();
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
    this.pendingRemovals = [];
    this.excludedFeeStructureIds.clear();
    this.selectedStudent = student;
    this.loadAssignedFees(student);
  }
  clearSelection(): void {
    this.pendingRemovals = [];
    this.excludedFeeStructureIds.clear();
    this.assignedFeesRequestId++;
    this.selectedStudent = null;
    this.feeComponents = [];
    this.assignedFeesError = '';
  }

  loadAssignedFees(student: any, message = ''): void {
    this.feeAssignmentStatus = null;
    this.savedFeeStructureIds.clear();
    this.feeUpdateMessage = message;
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
        if (Number(response?.responseCode) >= 400) {
          this.assignedFeesError = response?.responseMessage || 'Unable to load assigned fees.';
          this.isAssignedFeesLoading = false;
          return;
        }
        const matchingRows = (Array.isArray(rows) ? rows : []).filter((fee: any) => {
          const sameStudent = Number(fee?.studentId) === studentId;
          const sameSession = String(fee?.sessionName ?? '').trim() === sessionName;
          const sameGrade = !selectedGrade || this.normalizeGrade(fee?.grade) === selectedGrade;
          return sameStudent && sameSession && sameGrade;
        });
        matchingRows.filter((fee: any) => fee.status === 'CANCELLED').forEach((fee: any) =>
          this.excludedFeeStructureIds.add(Number(fee.feeStructureId)));
        this.savedFeeStructureIds = new Set<number>(matchingRows
          .filter((fee: any) => fee.status !== 'CANCELLED')
          .map((fee: any) => Number(fee.feeStructureId)));
        this.refreshAssignmentStatus();
        const activeRows = matchingRows.filter((fee: any) => fee.status !== 'CANCELLED' &&
          !this.pendingRemovals.some(removed => Number(removed.id) === Number(fee.id)));
        const assignedFees = [...new Map<string, any>(activeRows.map((fee: any) => [
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
          removable: Number(fee.paidAmount || 0) === 0
        }));
        this.loadAvailableFees(student, requestId);
      },
      error: (error: any) => {
        if (requestId !== this.assignedFeesRequestId || this.selectedStudent !== student) return;
        this.feeComponents = [];
        this.assignedFeesError = error?.error?.responseMessage || 'Unable to load assigned fee structures.';
        this.isAssignedFeesLoading = false;
      }
    });
  }

  private loadAvailableFees(student: any, requestId: number): void {
    const sessionName = String(student.sessionName || this.sessionName).trim();
    forkJoin({
      academics: this.schoolManagementService.getStudentAcademicByStudentId(Number(student.studentId ?? student.id)),
      grades: this.gradeOptions.length ? of({ listPayload: this.gradeOptions }) : this.schoolManagementService.getGradeDetails(),
      structures: this.schoolManagementService.getFeeStructure({ academicYearId: sessionName }),
      types: this.schoolManagementService.getFeeTypeDetails()
    }).subscribe({
      next: ({ academics, grades, structures, types }: any) => {
        if (requestId !== this.assignedFeesRequestId || this.selectedStudent !== student) return;
        const responses = [academics, grades, structures, types];
        const failed = responses.find(response => Number(response?.responseCode) >= 400);
        const rows = (response: any): any[] => {
          const data = response?.listPayload ?? response?.payload ?? response?.data;
          return Array.isArray(data) ? data : [];
        };
        const academic = rows(academics).find(item =>
          String(item.sessionName).trim() === sessionName &&
          this.normalizeGrade(item.grade) === this.normalizeGrade(student.grade));
        const grade = rows(grades).find(item =>
          this.normalizeGrade(item.gradeName ?? item.name) === this.normalizeGrade(student.grade) ||
          String(item.id) === String(student.grade));
        if (failed || !academic?.id || !grade?.id) {
          this.assignedFeesError = failed?.responseMessage || 'Unable to match the student academic record and grade. Check the student academic details.';
          this.isAssignedFeesLoading = false;
          return;
        }
        const assignedIds = new Set(this.feeComponents.map(fee => Number(fee.feeStructureId)));
        const availableFees: AssignmentFeeComponent[] = rows(structures)
          .filter(item => Number(item.gradeId) === Number(grade.id) &&
            !assignedIds.has(Number(item.id)) &&
            !this.excludedFeeStructureIds.has(Number(item.id)) &&
            String(item.academicYearId).trim() === sessionName &&
            (!item.status || String(item.status).toUpperCase() === 'ACTIVE'))
          .map(item => ({
            studentAcademicId: Number(academic.id), feeStructureId: Number(item.id),
            name: rows(types).find(type => Number(type.id) === Number(item.feeTypeId))?.feeTypeName || `Fee Structure ${item.id}`,
            amount: Number(item.amount || 0), discount: 0, fine: 0, paid: 0,
            status: 'PENDING', removable: true
          }));
        this.feeComponents = [...this.feeComponents, ...availableFees];
        this.assignedFeesError = this.feeComponents.length ? '' :
          this.excludedFeeStructureIds.size ? 'No fees selected for this student.' :
            `No active fee structure exists for ${student.grade} in ${sessionName}. Create one in Fee Structure first.`;
        if (availableFees.length && !this.feeUpdateMessage) {
          this.feeUpdateMessage = 'Class fees are ready to assign. Click Save Assignment to assign them to this student.';
        }
        this.isAssignedFeesLoading = false;
      },
      error: (error: any) => {
        if (requestId !== this.assignedFeesRequestId || this.selectedStudent !== student) return;
        this.assignedFeesError = error?.error?.responseMessage || 'Unable to load available class fees.';
        this.isAssignedFeesLoading = false;
      }
    });
  }

  async saveAssignment(): Promise<void> {
    if (!this.selectedStudent || this.isLoading || this.isAssignedFeesLoading || this.isSaving ||
        this.feeComponents.some(fee => fee.isUpdating)) return;
    this.feeUpdateMessage = '';
    this.assignedFeesError = '';
    if (!this.feeComponents.length && !this.pendingRemovals.length) {
      this.assignedFeesError = 'No assigned fees to save.';
      return;
    }
    if (this.feeComponents.some(fee => !this.isValidDiscount(fee))) {
      this.assignedFeesError = 'Discounts must be valid non-negative numbers and cannot reduce payable below the amount already paid.';
      return;
    }
    const student = this.selectedStudent;
    const fees = [...this.feeComponents, ...this.pendingRemovals];
    const hasNewFees = fees.some(fee => !fee.id);
    this.isSaving = true;
    try {
      const results = await Promise.all(fees.map(fee => this.updateDiscount(fee)));
      if (this.selectedStudent !== student) return;
      this.pendingRemovals = this.pendingRemovals.filter(fee => !results[fees.indexOf(fee)]);
      this.feeUpdateMessage = results.every(Boolean) ? 'Assignment saved successfully.' : '';
      if (hasNewFees && results.some(Boolean)) {
        this.loadAssignedFees(student, results.every(Boolean) ? 'Assignment saved successfully.' :
          'Some fees could not be saved. Reloaded assignments show the fees that were saved.');
      }
    } finally {
      this.isSaving = false;
    }
  }

  private isValidDiscount(fee: AssignmentFeeComponent): boolean {
    const discount = Number(fee.discount ?? 0);
    return Number.isFinite(discount) && discount >= 0 &&
      discount <= Number(fee.amount || 0) + Number(fee.fine || 0) - Number(fee.paid || 0);
  }

  updateDiscount(fee: AssignmentFeeComponent): Promise<boolean> {
    if (fee.isUpdating) return Promise.resolve(false);
    if (fee.status !== 'CANCELLED' && !this.isValidDiscount(fee)) {
      this.assignedFeesError = 'Discount must be a valid non-negative number and cannot reduce payable below the amount already paid.';
      return Promise.resolve(false);
    }

    fee.isUpdating = true;
    const student = this.selectedStudent;
    if (!this.isSaving) {
      this.assignedFeesError = '';
      this.feeUpdateMessage = '';
    }
    return new Promise<boolean>(resolve => {
      const request = fee.id
        ? this.schoolManagementService.updateAssignedFeeToStudent(fee)
        : this.schoolManagementService.assignFeeToStudent(fee);
      request.subscribe({
        next: (response: any) => {
          const payload = response?.payload;
          const removal = fee.status === 'CANCELLED';
          const removalConfirmed = !removal || String(payload?.status ?? '').trim().toUpperCase() === 'CANCELLED';
          const success = Number(response?.responseCode) === 200 && Number(payload?.respCode) === 200 && removalConfirmed;
          if (this.selectedStudent !== student) {
            fee.isUpdating = false;
            resolve(success);
            return;
          }
          if (success) {
            if (removal) this.savedFeeStructureIds.delete(Number(fee.feeStructureId));
            else this.savedFeeStructureIds.add(Number(fee.feeStructureId));
            this.refreshAssignmentStatus();
            if (fee.status === 'CANCELLED') {
              fee.isUpdating = false;
              resolve(true);
              return;
            }
            if (!fee.id && !this.isSaving) this.loadAssignedFees(student, `${fee.name} assigned successfully.`);
            fee.payable = Number(payload?.payableAmount ?? this.calculatePayable(fee));
            fee.balance = Number(payload?.balanceAmount ?? this.calculateBalance(fee));
            fee.status = payload?.status || this.calculatedStatus(fee);
            if (!this.isSaving) this.feeUpdateMessage = `${fee.name} discount updated successfully.`;
          } else {
            this.assignedFeesError = !removalConfirmed && Number(payload?.respCode) === 200
              ? 'The server did not save the fee removal. The backend must be updated before retrying.'
              : payload?.respMesg || response?.responseMessage || 'Unable to save fee changes.';
          }
          fee.isUpdating = false;
          resolve(success);
        },
        error: (error: any) => {
          if (this.selectedStudent === student) {
            this.assignedFeesError = error?.error?.responseMessage || 'Unable to update discount.';
          }
          fee.isUpdating = false;
          resolve(false);
        }
      });
    });
  }

  viewAssignedFee(template: TemplateRef<any>): void {
    this.dialog.open(template, {
      width: '340px',
      maxWidth: '90vw',
      panelClass: 'custom-modal'
    });
  }

  private refreshAssignmentStatus(): void {
    this.feeAssignmentStatus = this.savedFeeStructureIds.size ? 'Assigned' : 'Not assigned';
  }

  private normalizeGrade(value: any): string {
    return String(value ?? '').trim().toLowerCase().replace(/^(grade|class)\s*/i, '');
  }
  setPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.page = page; }
  resetAssignment(): void {
    this.pendingRemovals.forEach(fee => {
      this.excludedFeeStructureIds.delete(Number(fee.feeStructureId));
      fee.status = this.calculatedStatus(fee);
    });
    this.feeComponents.push(...this.pendingRemovals);
    this.pendingRemovals = [];
    this.feeComponents.forEach(item => item.discount = 0);
    this.feeUpdateMessage = '';
  }
  removeFee(index: number): void {
    const fee = this.feeComponents[index];
    if (!fee || this.isSaving || fee.isUpdating) return;
    if (Number(fee.paid || 0) > 0) {
      this.assignedFeesError = 'Fees with recorded payments cannot be removed.';
      return;
    }
    if (fee.feeStructureId) this.excludedFeeStructureIds.add(Number(fee.feeStructureId));
    this.pendingRemovals.push({ ...fee, status: 'CANCELLED' });
    this.feeComponents.splice(index, 1);
    this.feeUpdateMessage = 'Fee removed from the list. Click Save Assignment to save your changes.';
  }
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
