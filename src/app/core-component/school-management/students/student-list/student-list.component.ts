import { Component, ElementRef, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SchoolManagementService } from '../../school-management.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { pageSelection, SidebarService } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { UserDetails } from '../../../interface/user-management';
import { MatDialog } from '@angular/material/dialog';
import { finalize, forkJoin, Subscription } from 'rxjs';

import { Constant } from 'src/app/core/constant/constants';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnDestroy {
  @ViewChild('editCameraVideo') editCameraVideo?: ElementRef<HTMLVideoElement>;

  public readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;

  public loginUser: any;
  public editStudentForm!: FormGroup;
  public assignClassForm!: FormGroup;
  public studentUpdateDialog: any;
  public assignClassDialog: any;
  public selectedStudent: any = null;
  public editingStudent: any = null;
  public gradeOptions: any[] = [];
  public isGradesLoading = false;
  public isAssigningClass = false;
  public isAcademicLoading = false;
  public academicLoadError = '';
  public academicRecords: any[] = [];
  public selectedAcademic: any = null;
  private academicLoadSubscription?: Subscription;

  get assignAcademicYearOptions(): string[] {
    return [...new Set([...this.academicYearOptions.map(year => year.value),
      this.getCurrentAcademicYear(), ...this.academicRecords.map(row => row.sessionName)])].sort().reverse();
  }
  public isUpdatingStudent = false;
  public fullData: any[] = [];
  public routes = routes;
  private studentImageRefreshToken = 0;
  public isEditCameraOpen = false;
  public editCapturedPhoto: string | null = null;
  public editCameraError = '';
  public editCameraFacingMode: 'user' | 'environment' = 'environment';
  public isSwitchingEditCamera = false;
  private editCameraStream: MediaStream | null = null;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 2;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';
  // pagination variables



  constructor(
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private schoolManagementService: SchoolManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private cookieService: CookieService,

    private pagination: PaginationService,
    private router: Router,
    private dialog: MatDialog,

  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    this.getStudentDetails();
    this.createForms();
    this.getGradeDetails();
  }

  studentImageUrl(student: any): string {
    const imageUrl = this.schoolManagementService.studentImageUrl(student);
    if (!this.studentImageRefreshToken
      || !imageUrl
      || imageUrl.startsWith('data:image/')
      || imageUrl.startsWith('assets/')) {
      return imageUrl;
    }
    return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${this.studentImageRefreshToken}`;
  }

  useDefaultStudentImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/img/profiles/avatar-02.jpg';
  }

  get editStudentImageUrl(): string {
    return this.studentImageUrl({
      studentPicture: this.editStudentForm?.get('studentPicture')?.value,
      superadminId: this.editingStudent?.superadminId
    });
  }

  onEditStudentImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type?.startsWith('image/')) {
      input.value = '';
      this.messageService.add({
        summary: 'Invalid image',
        detail: 'Please select a valid image file.',
        styleClass: 'danger-background-popover'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editStudentForm.patchValue({
        studentPicture: String(reader.result || '')
      });
      this.editStudentForm.get('studentPicture')?.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  async openEditCamera(): Promise<void> {
    this.editCameraError = '';
    this.editCapturedPhoto = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.editCameraError = 'Camera access is not supported by this browser.';
      this.isEditCameraOpen = true;
      return;
    }

    this.isEditCameraOpen = true;
    await this.startEditCamera();
  }

  async switchEditCamera(): Promise<void> {
    if (this.isSwitchingEditCamera) {
      return;
    }

    this.isSwitchingEditCamera = true;
    this.editCameraError = '';
    this.editCameraFacingMode = this.editCameraFacingMode === 'environment' ? 'user' : 'environment';
    this.stopEditCameraStream();

    try {
      await this.startEditCamera();
    } finally {
      this.isSwitchingEditCamera = false;
    }
  }

  captureEditPhoto(): void {
    const video = this.editCameraVideo?.nativeElement;
    if (!video || !video.videoWidth || !video.videoHeight) {
      this.editCameraError = 'Camera is still loading. Please try again.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      this.editCameraError = 'Unable to capture the photo.';
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.editCapturedPhoto = canvas.toDataURL('image/jpeg', 0.9);
    this.stopEditCameraStream();
  }

  useEditCapturedPhoto(): void {
    if (!this.editCapturedPhoto) {
      return;
    }

    this.editStudentForm.patchValue({ studentPicture: this.editCapturedPhoto });
    this.editStudentForm.get('studentPicture')?.markAsDirty();
    this.closeEditCamera();
  }

  retakeEditPhoto(): void {
    void this.openEditCamera();
  }

  closeEditCamera(): void {
    this.stopEditCameraStream();
    this.isEditCameraOpen = false;
    this.editCapturedPhoto = null;
    this.editCameraError = '';
  }

  ngOnDestroy(): void {
    this.academicLoadSubscription?.unsubscribe();
    this.stopEditCameraStream();
  }

  private async startEditCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.editCameraError = 'Camera access is not supported by this browser.';
      return;
    }

    try {
      this.editCameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: this.editCameraFacingMode } },
        audio: false
      });

      setTimeout(() => {
        const video = this.editCameraVideo?.nativeElement;
        if (video && this.editCameraStream) {
          video.srcObject = this.editCameraStream;
          void video.play();
        }
      });
    } catch (error) {
      this.stopEditCameraStream();
      this.editCameraError = this.getEditCameraErrorMessage(error);
    }
  }

  private stopEditCameraStream(): void {
    this.editCameraStream?.getTracks().forEach(track => track.stop());
    this.editCameraStream = null;

    if (this.editCameraVideo?.nativeElement) {
      this.editCameraVideo.nativeElement.srcObject = null;
    }
  }

  private getEditCameraErrorMessage(error: unknown): string {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return 'Camera permission was denied. Please allow camera access and try again.';
      }
      if (error.name === 'NotFoundError') {
        return 'No camera was found on this device.';
      }
      if (error.name === 'NotReadableError') {
        return 'The camera is already in use by another application.';
      }
    }

    return 'Unable to open the camera. Camera access requires HTTPS or localhost.';
  }

  createForms() {
    this.editStudentForm = this.fb.group({
      // Student Basic Details
      id: [''],
      admissionNo: ['', [Validators.required, Validators.pattern('[0-9A-Za-z ]{3,150}')]],
      admissionDate: [''],
      rollNumber: ['', [Validators.required, Validators.pattern('[0-9A-Za-z ]{1,100}')]],
      studentPicture: [''],
      grade: ['', Validators.required],
      gradeSection: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dob: [''],
      dobPlace: [''],
      gender: [''],
      bloodGroup: [''],
      nationality: [''],
      category: [''],
      religion: [''],
      aadharNumber: ['', Validators.pattern('[0-9]{12}')],
      birthCertificateNumber: [''],
      permanentEducationNumber: [''],
      eShikshaUniqueId: [''],
      sessionName: [''],
      siblingAdmissionNumber: [''],

      // Parent Details
      fatherName: ['', Validators.required],
      fatherMobileNo: ['', Validators.pattern('[0-9]{10}')],
      motherName: [''],
      motherMobileNo: ['', Validators.pattern('[0-9]{10}')],

      // Current Address
      currentAddress: [''],
      currentCity: [''],
      currentState: [''],
      currentPin: ['', Validators.pattern('[0-9]{6}')],

      // Permanent Address
      permanentAddress: [''],
      permanentCity: [''],
      permanentState: [''],
      permanentPin: ['', Validators.pattern('[0-9]{6}')],

      // Previous School Details
      previousSchool: [''],
      reasonForChange: [''],
      lastClassAttended: [''],

      // Audit (usually hidden / auto-filled)
      createdBy: [''],
      createdByName: [''],
      superadminId: ['']

    });

    this.assignClassForm = this.fb.group({
      studentId: [null, Validators.required],
      sessionName: [this.getCurrentAcademicYear(), Validators.required],
      gradeId: [null, Validators.required],
      gradeSection: ['', Validators.required],
      rollNumber: ['', Validators.required]
    });
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

  openAssignClassModal(templateRef: TemplateRef<any>, student: any): void {
    this.academicLoadSubscription?.unsubscribe();
    this.academicRecords = [];
    this.selectedAcademic = null;
    this.academicLoadError = '';
    this.selectedStudent = student;
    this.assignClassForm.reset({
      studentId: student?.id,
      sessionName: this.getCurrentAcademicYear(),
      gradeId: null,
      gradeSection: '',
      rollNumber: ''
    });
    this.assignClassDialog = this.dialog.open(templateRef, {
      width: '620px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      disableClose: true,
      panelClass: 'custom-modal'
    });
    this.assignClassDialog.afterClosed().subscribe(() => this.academicLoadSubscription?.unsubscribe());
    this.loadStudentAcademics();
  }

  loadStudentAcademics(): void {
    this.academicLoadSubscription?.unsubscribe();
    this.isAcademicLoading = true;
    this.academicLoadError = '';
    this.assignClassForm.disable();
    this.academicLoadSubscription = forkJoin({
      academics: this.schoolManagementService.getStudentAcademicByStudentId(this.selectedStudent.id),
      grades: this.schoolManagementService.getGradeDetails()
    }).subscribe({
      next: ({ academics, grades }) => {
        const gradeRows = grades?.listPayload ?? grades?.payload ?? grades?.data;
        if (Number(academics?.responseCode) !== 200 || !Array.isArray(academics?.listPayload)
          || !Array.isArray(gradeRows) || !gradeRows.length) {
          this.academicLoadError = Number(academics?.responseCode) !== 200
            ? academics?.responseMessage || 'Unable to load academic details. Please retry.'
            : 'Unable to load academic details or grades. Please retry.';
          this.isAcademicLoading = false;
          return;
        }
        this.gradeOptions = gradeRows;
        this.academicRecords = academics.listPayload;
        const current = this.academicRecords.find(row => row.sessionName === this.getCurrentAcademicYear());
        this.assignClassForm.patchValue({ sessionName: current?.sessionName
          || this.academicRecords[0]?.sessionName || this.getCurrentAcademicYear() });
        this.onAcademicSessionChange();
        this.assignClassForm.enable();
        this.isAcademicLoading = false;
      },
      error: () => {
        this.academicLoadError = 'Unable to load academic details. Please retry.';
        this.isAcademicLoading = false;
      }
    });
  }

  onAcademicSessionChange(): void {
    const session = this.assignClassForm.get('sessionName')?.value;
    this.selectedAcademic = this.academicRecords.find(row => row.sessionName === session) || null;
    const academic = this.selectedAcademic;
    const grade = this.gradeOptions.find(row => String(row.gradeName || row.name).trim().toLowerCase()
      === String(academic?.grade || '').trim().toLowerCase());
    this.assignClassForm.patchValue({
      gradeId: grade?.id ?? null,
      gradeSection: academic?.gradeSection || '',
      rollNumber: academic?.rollNumber || ''
    });
    this.assignClassForm.markAsPristine();
    this.assignClassForm.markAsUntouched();
  }

  assignClass(): void {
    if (this.isAssigningClass || this.isAcademicLoading || this.academicLoadError) return;
    if (this.assignClassForm.invalid) {
      this.assignClassForm.markAllAsTouched();
      return;
    }

    const formValue = this.assignClassForm.getRawValue();
    const selectedGrade = this.gradeOptions.find(
      grade => String(grade?.id) === String(formValue.gradeId));
    if (!selectedGrade) {
      this.assignClassForm.get('gradeId')?.setErrors({ required: true });
      return;
    }
    const request = {
      ...formValue,
      id: this.selectedAcademic?.id,
      status: this.selectedAcademic?.status,
      grade: selectedGrade.gradeName || selectedGrade.name || String(selectedGrade.id)
    };

    this.isAssigningClass = true;
    const save = this.selectedAcademic
      ? this.schoolManagementService.updateStudentAcademic(request)
      : this.schoolManagementService.addStudentAcademic(request);
    this.assignClassForm.disable();
    save.pipe(finalize(() => {
      this.isAssigningClass = false;
      this.assignClassForm.enable();
    })).subscribe({
      next: (response: any) => {
        const success = Number(response?.responseCode) === 200
          && Number(response?.payload?.respCode) === 200;
        this.messageService.add({
          summary: success ? 'Success' : 'Unable to save academic details',
          detail: response?.payload?.respMesg || response?.responseMessage || 'Academic details could not be saved.',
          styleClass: success ? 'success-background-popover' : 'danger-background-popover'
        });
        if (success) {
          this.assignClassDialog?.close();
          this.selectedStudent = null;
          this.getStudentDetails();
        }
        this.isAssigningClass = false;
      },
      error: (error: any) => {
        this.messageService.add({
          summary: 'Error',
          detail: error?.error?.responseMessage || 'Unable to save academic details.',
          styleClass: 'danger-background-popover'
        });
        this.isAssigningClass = false;
      }
    });
  }

  private getCurrentAcademicYear(): string {
    const today = new Date();
    const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  }

  public getStudentDetails(): void {
    this.serialNumberArray = []; // Clear serial number array before fetching new data

    this.schoolManagementService.getStudentDetails().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Set total data count
      this.fullData = apiRes.listPayload;  // Store the full dataset

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.studentsList) {
          this.pageSize = res.pageSize;
          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  prepareTableData(apiRes: any[], pageOption: pageSelection): void {
    this.tableData = []; // Reset table data
    this.serialNumberArray = []; // Reset serial numbers

    // Slice data based on pagination limits (skip, limit)
    const dataToDisplay = apiRes.slice(pageOption.skip, pageOption.limit);

    // Add serial numbers and prepare table data
    dataToDisplay.forEach((res: any, index: number) => {
      const serialNumber = index + 1;
      this.tableData.push(res);
      this.serialNumberArray.push(serialNumber);
    });

    // Update MatTableDataSource
    this.dataSource = new MatTableDataSource<any>(this.tableData);

    // Emit updated pagination data
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
  }


  public sortData(sort: Sort) {
    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public searchData(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    if (searchTerm) {
      // Filter the full dataset based on the search term
      const filteredData = this.fullData.filter((donation: UserDetails) =>
        Object.values(donation).some((field) =>
          String(field).toLowerCase().includes(searchTerm)
        )
      );

      this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
      this.totalData = filteredData.length; // Update total data count for pagination
    } else {
      // Reset to the full dataset when the search term is cleared
      this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });
      this.totalData = this.fullData.length; // Reset the total data count
    }

    // Reset to the first page after a search or clearing search
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
  }

  changeUserStatus(userId: string): void {
    const statusData = {
      userId: userId,
      
    };
  }

  confirmColor(userId: string) {

  }

  openEditModal(templateRef: TemplateRef<any>, rawData: any): void {

    this.editingStudent = rawData;
    this.closeEditCamera();

    this.editStudentForm.patchValue({

      // Basic Identifiers
      id: rawData['id'] ?? rawData['studentId'],
      admissionNo: rawData['admissionNo'],
      admissionDate: String(rawData['admissionDate'] || '').slice(0, 10),
      rollNumber: rawData['rollNumber'],

      // Student Basic Details
      studentPicture: rawData['studentPicture'],
      grade: rawData['grade'],
      gradeSection: rawData['gradeSection'],
      firstName: rawData['firstName'],
      middleName: rawData['middleName'],
      lastName: rawData['lastName'],
      dob: rawData['dob'],
      dobPlace: rawData['dobPlace'],
      gender: rawData['gender'],
      bloodGroup: rawData['bloodGroup'],
      nationality: rawData['nationality'],
      category: rawData['category'],
      religion: rawData['religion'],
      aadharNumber: rawData['aadharNumber'],
      birthCertificateNumber: rawData['birthCertificateNumber'],
      permanentEducationNumber: rawData['permanentEducationNumber'],
      eShikshaUniqueId: rawData['eShikshaUniqueId'],
      sessionName: rawData['sessionName'],
      siblingAdmissionNumber: rawData['siblingAdmissionNumber'],

      // Parent Details
      fatherName: rawData['fatherName'],
      fatherMobileNo: rawData['fatherMobileNo'],
      motherName: rawData['motherName'],
      motherMobileNo: rawData['motherMobileNo'],

      // Current Address
      currentAddress: rawData['currentAddress'],
      currentCity: rawData['currentCity'],
      currentState: rawData['currentState'],
      currentPin: rawData['currentPin'],

      // Permanent Address
      permanentAddress: rawData['permanentAddress'],
      permanentCity: rawData['permanentCity'],
      permanentState: rawData['permanentState'],
      permanentPin: rawData['permanentPin'],

      // Previous School Details
      previousSchool: rawData['previousSchool'],
      reasonForChange: rawData['reasonForChange'],
      lastClassAttended: rawData['lastClassAttended'],

      // Audit Fields (if editable / hidden)
      createdBy: rawData['createdBy'],
      createdByName: rawData['createdByName'],
      superadminId: rawData['superadminId']
    });


    this.studentUpdateDialog = this.dialog.open(templateRef, {
      width: '1400px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      disableClose: true,
      panelClass: 'custom-modal',
    });
  }


  updateStudentForm() {
    if (this.isUpdatingStudent || !this.editStudentForm.get('id')?.value) return;
    this.isUpdatingStudent = true;
    this.schoolManagementService.updateStudent(this.editStudentForm.value)
      .pipe(finalize(() => { this.isUpdatingStudent = false; }))
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response?.payload?.respCode == '200') {

              this.messageService.add({
                summary: String(response?.payload?.respCode || response?.responseCode || 'Error'),
                detail: response?.payload?.respMesg || response?.responseMessage || 'Could not update student.',
                styleClass: 'success-background-popover',
              });
              this.studentUpdateDialog?.close();
              this.closeEditCamera();
              this.studentImageRefreshToken = Date.now();
              this.getStudentDetails();
              this.editStudentForm.reset();
              this.createForms();

            } else if (response?.payload?.respCode == '401') {

              this.cookieService.delete('loginDetails');
              window.location.href = "/login";
              window.location.reload();

              this.messageService.add({
                summary: String(response?.payload?.respCode || response?.responseCode || 'Error'),
                detail: response?.payload?.respMesg || response?.responseMessage || 'Could not update student.',
                styleClass: 'danger-background-popover',
              });
          } else {

              this.messageService.add({
              summary: String(response?.payload?.respCode || response?.responseCode || 'Error'),
              detail: response?.payload?.respMesg || response?.responseMessage || 'Could not update student.',
                styleClass: 'danger-background-popover',
              });
            }
          } else {

            this.messageService.add({
              summary: String(response?.payload?.respCode || response?.responseCode || 'Error'),
              detail: response?.payload?.respMesg || response?.responseMessage || 'Could not update student.',
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: (error: any) => this.messageService.add({
          summary: '500', detail: 'Server Error', styleClass: 'danger-background-popover',
        })
      });
  }

    downloadAdmissionDetails(id: number) {
      this.schoolManagementService.downloadAdmissionDetails(id).subscribe({
        next: (pdfBlob: Blob) => {
          const fileUrl = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = `Admission_Details_${id}.pdf`;
          link.click();
          window.URL.revokeObjectURL(fileUrl);
        },
        error: () => {
          this.messageService.add({
            summary: 'Error',
            detail: 'Unable to download admission details. Please try again.',
            styleClass: 'danger-background-popover',
          });
        }
      });
    }

}
