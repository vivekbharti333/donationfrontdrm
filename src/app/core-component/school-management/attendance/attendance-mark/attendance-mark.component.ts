import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';
import { AttendanceService } from '../attendance.service';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | '';
interface AttendanceStudent {
  studentAcademicId: number;
  rollNumber?: string;
  admissionNo?: string;
  studentPicture?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  status: AttendanceStatus;
}

@Component({
  selector: 'app-attendance-mark',
  templateUrl: './attendance-mark.component.html',
  styleUrls: ['./attendance-mark.component.scss', './attendance-mark-theme.scss']
})
export class AttendanceMarkComponent implements OnInit {
  readonly statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT'];
  readonly academicSessions = Constant.ACADEMIC_YEAR_OPTIONS;
  readonly sections = Constant.SECTION_OPTIONS;
  readonly studentImageBaseUrl = Constant.Site_Url + 'studentImage/';
  readonly filterForm = this.formBuilder.group({
    sessionName: [this.currentAcademicSession()],
    attendanceDate: [this.today()], grade: [''], gradeSection: ['']
  });
  students: AttendanceStudent[] = [];
  selectedStudentIds = new Set<number>();
  grades: any[] = [];
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private formBuilder: FormBuilder, private schoolManagementService: SchoolManagementService,
    private attendanceService: AttendanceService) { }

  ngOnInit(): void { this.getGradeDetails(); }
  get filteredStudents(): AttendanceStudent[] {
    const search = this.searchTerm.trim().toLowerCase();
    return !search ? this.students : this.students.filter(student => this.studentName(student).toLowerCase().includes(search)
      || String(student.rollNumber || '').includes(search) || String(student.admissionNo || '').toLowerCase().includes(search));
  }
  get totalStudents(): number { return this.students.length; }
  get presentCount(): number { return this.count('PRESENT'); }
  get absentCount(): number { return this.count('ABSENT'); }
  get presentPercentage(): number { return this.totalStudents ? Math.round(this.presentCount / this.totalStudents * 100) : 0; }

  getGradeDetails(): void {
    this.schoolManagementService.getGradeDetails().subscribe({
      next: response => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.grades = Array.isArray(rows) ? rows : [];
        if (!this.filterForm.controls.grade.value && this.grades.length) {
          this.filterForm.controls.grade.setValue(this.gradeValue(this.grades[0]));
        }
      }, error: () => { this.grades = []; }
    });
  }
  loadStudents(): void {
    this.successMessage = ''; this.errorMessage = '';
    const filters = this.filterForm.getRawValue();
    if (!filters.sessionName || !filters.grade || !filters.gradeSection || !filters.attendanceDate) {
      this.errorMessage = 'Academic session, date, grade, and section are required.'; return;
    }
    this.isLoading = true;
    this.schoolManagementService.getStudentAcademicDetails({
      sessionName: filters.sessionName, grade: filters.grade,
      gradeSection: filters.gradeSection
    }).subscribe({
      next: response => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.students = (Array.isArray(rows) ? rows : []).map((student: any) => ({
          studentAcademicId: Number(student.studentAcademicId || student.academicId || student.id),
          rollNumber: student.rollNumber, admissionNo: student.admissionNo, studentPicture: student.studentPicture,
          firstName: student.firstName, middleName: student.middleName, lastName: student.lastName,
          status: '' as AttendanceStatus
        })).filter((student: AttendanceStudent) => student.studentAcademicId > 0);
        this.selectedStudentIds.clear();
        this.isLoading = false;
      },
      error: error => { this.students = []; this.errorMessage = error?.error?.responseMessage || 'Unable to load students.'; this.isLoading = false; }
    });
  }
  markAll(status: AttendanceStatus): void { this.students = this.students.map(student => ({ ...student, status })); }
  toggleAll(checked: boolean): void { this.selectedStudentIds = checked ? new Set(this.students.map(student => student.studentAcademicId)) : new Set(); }
  toggleStudent(id: number, checked: boolean): void { checked ? this.selectedStudentIds.add(id) : this.selectedStudentIds.delete(id); this.selectedStudentIds = new Set(this.selectedStudentIds); }
  setStatus(student: AttendanceStudent, status: AttendanceStatus): void { student.status = status; }
  saveAttendance(): void {
    const attendanceDate = this.filterForm.controls.attendanceDate.value;
    if (!attendanceDate || !this.students.length || this.isSaving) return;
    const markedStudents = this.students.filter(student => student.status === 'PRESENT' || student.status === 'ABSENT');
    if (!markedStudents.length) {
      this.errorMessage = 'Please mark at least one student as Present or Absent.';
      this.successMessage = '';
      return;
    }
    this.isSaving = true; this.successMessage = ''; this.errorMessage = '';
    forkJoin(markedStudents.map(student => this.attendanceService.markStudentAttendance({
      studentAcademicId: student.studentAcademicId,
      attendanceDate, status: student.status
    }).pipe(map(response => Number(response?.responseCode) === 200), catchError(() => of(false)))))
      .subscribe(results => {
        this.isSaving = false; const saved = results.filter(Boolean).length;
        if (saved === markedStudents.length) this.successMessage = `Attendance saved for ${saved} student${saved === 1 ? '' : 's'}.`;
        else this.errorMessage = `Attendance saved for ${saved} of ${markedStudents.length} marked students. Please retry the remaining records.`;
      });
  }
  reset(): void { this.filterForm.reset({ sessionName: this.currentAcademicSession(), attendanceDate: this.today(), grade: this.grades.length ? this.gradeValue(this.grades[0]) : '', gradeSection: 'A' }); this.students = []; this.selectedStudentIds.clear(); this.searchTerm = ''; this.successMessage = ''; this.errorMessage = ''; }
  studentName(student: AttendanceStudent): string { return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Unnamed student'; }
  studentImage(path?: string): string { return !path ? 'assets/img/profiles/avatar-02.jpg' : /^(https?:|data:|blob:)/i.test(path) ? path : this.studentImageBaseUrl + path; }
  gradeValue(grade: any): string { return String(grade?.gradeName ?? grade?.name ?? grade?.gradeCode ?? grade?.grade ?? '').trim(); }
  gradeLabel(grade: any): string { const value = this.gradeValue(grade); return value.toLowerCase().startsWith('grade') ? value : 'Grade ' + (value || grade?.id || ''); }
  isAllSelected(): boolean { return !!this.students.length && this.selectedStudentIds.size === this.students.length; }
  private count(status: AttendanceStatus): number { return this.students.filter(student => student.status === status).length; }
  private today(): string { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  private currentAcademicSession(): string { const date = new Date(); const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1; return `${start}-${String(start + 1).slice(-2)}`; }
}
