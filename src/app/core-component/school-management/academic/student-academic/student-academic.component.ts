import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { pageSelection } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { SchoolManagementService } from '../../school-management.service';
import { MessageService } from 'primeng/api';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Component({
  selector: 'app-student-academic',
  templateUrl: './student-academic.component.html',
  styleUrls: ['./student-academic.component.scss']
})
export class StudentAcademicComponent implements OnInit, OnDestroy {
  public readonly routes = routes;
  public fullData: any[] = [];
  public tableData: any[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public pageSize = 10;
  public searchDataValue = '';
  public isLoading = false;
  public errorMessage = '';
  public editAcademicForm!: FormGroup;
  public promoteAcademicForm!: FormGroup;
  public isUpdating = false;
  public isPromoting = false;
  public selectedStudentName = '';
  public selectedStudentPicture = '';
  public selectedStudentSuperadminId = '';
  public loginUser: any;
  public readonly studentImageBaseUrl = Constant.Site_Url + 'studentImage/';
  public readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  public readonly sectionOptions = Constant.SECTION_OPTIONS;
  public gradeOptions: any[] = [];
  public isGradesLoading = false;

  public sessionName = this.getCurrentAcademicSession();
  public grade = '';
  public gradeSection = '';
  public status = '';

  private currentSkip = 0;
  private editDialog?: MatDialogRef<any>;
  private promoteDialog?: MatDialogRef<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private schoolManagementService: SchoolManagementService,
    private pagination: PaginationService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit(): void {
    this.createEditForm();
    this.createPromoteForm();
    this.getGradeDetails();
    this.pagination.tablePageSize
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: tablePageSize) => {
        if (this.router.url.includes('student-academic')) {
          this.pageSize = page.pageSize;
          this.currentSkip = page.skip;
          this.applySearchAndPagination();
        }
      });
    this.getStudentAcademicDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getStudentAcademicDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.schoolManagementService.getStudentAcademicDetails({
      sessionName: this.sessionName,
      grade: this.grade,
      gradeSection: this.gradeSection,
      status: this.status
    }).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        if (Array.isArray(rows)) {
          this.fullData = rows;
          this.errorMessage = '';
        } else {
          this.fullData = [];
          this.errorMessage = response?.responseMessage || 'No student academic details were returned.';
        }
        this.currentSkip = 0;
        this.applySearchAndPagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.applySearchAndPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load student academic details.';
        this.isLoading = false;
      }
    });
  }

  public getGradeDetails(): void {
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

  public gradeValue(grade: any): string {
    return String(grade?.gradeName ?? grade?.name ?? grade?.gradeCode ?? '').trim();
  }

  public gradeLabel(grade: any): string {
    return String(grade?.gradeName ?? grade?.name ?? grade?.gradeCode ?? ('Grade ' + grade?.id));
  }

  public applyFilters(): void {
    this.getStudentAcademicDetails();
  }

  public clearFilters(): void {
    this.sessionName = this.getCurrentAcademicSession();
    this.grade = '';
    this.gradeSection = '';
    this.status = '';
    this.searchDataValue = '';
    this.getStudentAcademicDetails();
  }

  public searchData(value: string): void {
    this.searchDataValue = value;
    this.currentSkip = 0;
    this.applySearchAndPagination();
  }

  public sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return;
    const direction = sort.direction === 'asc' ? 1 : -1;
    this.fullData = [...this.fullData].sort((a, b) => {
      const first = String(a?.[sort.active] ?? '').toLowerCase();
      const second = String(b?.[sort.active] ?? '').toLowerCase();
      return first.localeCompare(second, undefined, { numeric: true }) * direction;
    });
    this.applySearchAndPagination();
  }

  public studentName(student: any): string {
    return [student?.firstName, student?.middleName, student?.lastName]
      .filter(Boolean).join(' ');
  }

  public studentImageUrl(student: any): string {
    const picture = String(student?.studentPicture || student?.profilePicture || '').trim();
    if (!picture) return 'assets/img/profiles/avatar-02.jpg';
    if (/^(data:image\/|blob:|https?:)/i.test(picture)) return picture;
    if (picture.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(picture)) {
      return 'data:image/png;base64,' + picture;
    }
    const superadminId = String(
      student?.superadminId || this.selectedStudentSuperadminId ||
      this.loginUser?.superadminId || this.loginUser?.loginId || ''
    ).trim();
    const imageUrl = this.studentImageBaseUrl + encodeURIComponent(picture);
    return superadminId
      ? imageUrl + '?superadminId=' + encodeURIComponent(superadminId)
      : imageUrl;
  }

  public useDefaultStudentImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/img/profiles/avatar-02.jpg';
  }

  public openEditAcademic(template: TemplateRef<any>, student: any): void {
    this.selectedStudentName = this.studentName(student);
    this.selectedStudentPicture = student?.studentPicture || '';
    this.selectedStudentSuperadminId = String(student?.superadminId || '');
    this.editAcademicForm.reset({
      studentId: student.studentId,
      sessionName: student.sessionName,
      grade: student.grade,
      gradeSection: student.gradeSection,
      rollNumber: student.rollNumber,
      status: student.status
    });
    this.editDialog = this.dialog.open(template, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public updateStudentAcademic(): void {
    if (this.editAcademicForm.invalid || this.isUpdating) {
      this.editAcademicForm.markAllAsTouched();
      return;
    }
    this.isUpdating = true;
    this.schoolManagementService.updateStudentAcademic(this.editAcademicForm.getRawValue())
      .subscribe({
        next: (response: any) => {
          this.isUpdating = false;
          const payload = response?.payload;
          if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
            this.messageService.add({
              summary: String(payload?.respCode || response?.responseCode || 'Error'),
              detail: payload?.respMesg || response?.responseMessage || 'Academic details could not be updated.',
              severity: 'error'
            });
            return;
          }
          this.editDialog?.close();
          this.messageService.add({
            summary: 'Updated',
            detail: payload?.respMesg || 'Student academic details updated successfully.',
            severity: 'success'
          });
          this.getStudentAcademicDetails();
        },
        error: (error: any) => {
          this.isUpdating = false;
          this.messageService.add({
            summary: 'Error',
            detail: error?.error?.responseMessage || 'Academic details could not be updated.',
            severity: 'error'
          });
        }
      });
  }

  public openPromoteAcademic(template: TemplateRef<any>, student: any): void {
    this.selectedStudentName = this.studentName(student);
    this.selectedStudentPicture = student?.studentPicture || '';
    this.selectedStudentSuperadminId = String(student?.superadminId || '');
    this.promoteAcademicForm.reset({
      studentId: student.studentId,
      sessionName: this.getNextAcademicSession(student.sessionName),
      grade: this.getNextGrade(student.grade),
      gradeSection: student.gradeSection || '',
      rollNumber: student.rollNumber || ''
    });
    this.promoteDialog = this.dialog.open(template, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public promoteStudent(): void {
    if (this.promoteAcademicForm.invalid || this.isPromoting) {
      this.promoteAcademicForm.markAllAsTouched();
      return;
    }

    const promotion = this.promoteAcademicForm.getRawValue();
    this.isPromoting = true;
    this.schoolManagementService.addStudentAcademic(promotion).subscribe({
      next: (response: any) => {
        this.isPromoting = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.messageService.add({
            summary: 'Unable to promote student',
            detail: payload?.respMesg || response?.responseMessage || 'Student could not be promoted.',
            severity: 'error'
          });
          return;
        }

        this.promoteDialog?.close();
        this.messageService.add({
          summary: 'Promoted',
          detail: payload?.respMesg || 'Student promoted successfully.',
          severity: 'success'
        });
        this.sessionName = promotion.sessionName;
        this.grade = '';
        this.gradeSection = '';
        this.status = '';
        this.getStudentAcademicDetails();
      },
      error: (error: any) => {
        this.isPromoting = false;
        this.messageService.add({
          summary: 'Unable to promote student',
          detail: error?.error?.responseMessage || 'Student could not be promoted.',
          severity: 'error'
        });
      }
    });
  }

  private createEditForm(): void {
    this.editAcademicForm = this.fb.group({
      studentId: [{ value: null, disabled: true }, Validators.required],
      sessionName: [{ value: '', disabled: true }, Validators.required],
      grade: ['', Validators.required],
      gradeSection: [''],
      rollNumber: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  private createPromoteForm(): void {
    this.promoteAcademicForm = this.fb.group({
      studentId: [{ value: null, disabled: true }, Validators.required],
      sessionName: ['', Validators.required],
      grade: ['', Validators.required],
      gradeSection: [''],
      rollNumber: ['', Validators.required]
    });
  }

  private getNextAcademicSession(sessionName: string): string {
    const match = String(sessionName || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return this.getCurrentAcademicSession();
    const nextStartYear = Number(match[1]) + 1;
    return `${nextStartYear}-${String(nextStartYear + 1).slice(-2)}`;
  }

  private getNextGrade(grade: string): string {
    const numericGrade = Number(String(grade || '').trim());
    return Number.isFinite(numericGrade) && String(grade).trim() !== ''
      ? String(numericGrade + 1)
      : String(grade || '');
  }

  private getCurrentAcademicSession(date: Date = new Date()): string {
    const year = date.getFullYear();
    const academicStartYear = date.getMonth() >= 3 ? year : year - 1;
    const nextYear = String(academicStartYear + 1).slice(-2);
    return `${academicStartYear}-${nextYear}`;
  }

  private applySearchAndPagination(): void {
    const term = this.searchDataValue.trim().toLowerCase();
    const filtered = term
      ? this.fullData.filter(item => Object.values(item || {}).some(value =>
          String(value ?? '').toLowerCase().includes(term)))
      : [...this.fullData];

    this.totalData = filtered.length;
    if (this.currentSkip >= this.totalData) this.currentSkip = 0;
    this.tableData = filtered.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.dataSource = new MatTableDataSource<any>(this.tableData);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray
    });
  }

}
