import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { SchoolManagementService } from '../../school-management.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
   providers: [MessageService, ToastModule],
})
export class AddStudentComponent implements OnDestroy {
 @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;
 public isCameraOpen = false;
 public capturedPhoto: string | null = null;
 public cameraError = '';
 public cameraFacingMode: 'user' | 'environment' = 'environment';
 public isSwitchingCamera = false;
 private cameraStream: MediaStream | null = null;
 public readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
 public gradeOptions: any[] = [];
 public isGradesLoading = false;
public loginUser: any;
 public addStudentForm!: FormGroup;
 public sameAsCurrentAddress = false;


    constructor(
      private fb: FormBuilder,
      private sidebar: SidebarService,
      private schoolManagementService: SchoolManagementService,
      private authenticationService: AuthenticationService,
      private messageService: MessageService,
      private cookieService: CookieService,
    ) 
    {
      this.loginUser = this.authenticationService.getLoginUser();
    }

      ngOnInit() {

    this.createForms();
    this.getGradeDetails();
   
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

  createForms() {
  this.sameAsCurrentAddress = false;
  this.addStudentForm = this.fb.group({

    // Student Basic Details
    admissionNo: ['', [Validators.required, Validators.pattern('[0-9A-Za-z ]{3,150}')]],
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

  ['currentAddress', 'currentCity', 'currentState', 'currentPin'].forEach(controlName => {
    this.addStudentForm.get(controlName)?.valueChanges.subscribe(() => {
      if (this.sameAsCurrentAddress) {
        this.copyCurrentAddressToPermanent();
      }
    });
  });
}

onSameAddressChange(checked: boolean): void {
  this.sameAsCurrentAddress = checked;
  if (checked) {
    this.copyCurrentAddressToPermanent();
  }
}

copyCurrentAddressToPermanent(): void {
  this.addStudentForm.patchValue({
    permanentAddress: this.addStudentForm.get('currentAddress')?.value || '',
    permanentCity: this.addStudentForm.get('currentCity')?.value || '',
    permanentState: this.addStudentForm.get('currentState')?.value || '',
    permanentPin: this.addStudentForm.get('currentPin')?.value || ''
  }, { emitEvent: false });

  ['permanentAddress', 'permanentCity', 'permanentState', 'permanentPin'].forEach(controlName => {
    this.addStudentForm.get(controlName)?.markAsDirty();
    this.addStudentForm.get(controlName)?.markAsTouched();
  });
}


onFileSelected(event: any): void {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      this.addStudentForm.patchValue({
        studentPicture: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
}

async openCamera(): Promise<void> {
  this.cameraError = '';
  this.capturedPhoto = null;

  if (!navigator.mediaDevices?.getUserMedia) {
    this.cameraError = 'Camera access is not supported by this browser.';
    this.isCameraOpen = true;
    return;
  }

  this.isCameraOpen = true;

  await this.startCamera();
}

async switchCamera(): Promise<void> {
  if (this.isSwitchingCamera) {
    return;
  }

  this.isSwitchingCamera = true;
  this.cameraError = '';
  this.cameraFacingMode = this.cameraFacingMode === 'environment' ? 'user' : 'environment';
  this.stopCameraStream();

  try {
    await this.startCamera();
  } finally {
    this.isSwitchingCamera = false;
  }
}

private async startCamera(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    this.cameraError = 'Camera access is not supported by this browser.';
    return;
  }

  try {
    this.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: this.cameraFacingMode } },
      audio: false
    });

    // Wait until Angular has rendered the video element in the dialog.
    setTimeout(() => {
      const video = this.cameraVideo?.nativeElement;
      if (video && this.cameraStream) {
        video.srcObject = this.cameraStream;
        void video.play();
      }
    });
  } catch (error) {
    this.stopCameraStream();
    this.cameraError = this.getCameraErrorMessage(error);
  }
}

capturePhoto(): void {
  const video = this.cameraVideo?.nativeElement;
  if (!video || !video.videoWidth || !video.videoHeight) {
    this.cameraError = 'Camera is still loading. Please try again.';
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    this.cameraError = 'Unable to capture the photo.';
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.9);
  this.stopCameraStream();
}

useCapturedPhoto(): void {
  if (!this.capturedPhoto) {
    return;
  }

  this.addStudentForm.patchValue({ studentPicture: this.capturedPhoto });
  this.addStudentForm.get('studentPicture')?.markAsDirty();
  this.closeCamera();
}

retakePhoto(): void {
  void this.openCamera();
}

closeCamera(): void {
  this.stopCameraStream();
  this.isCameraOpen = false;
  this.capturedPhoto = null;
  this.cameraError = '';
}

ngOnDestroy(): void {
  this.stopCameraStream();
}

private stopCameraStream(): void {
  this.cameraStream?.getTracks().forEach(track => track.stop());
  this.cameraStream = null;

  if (this.cameraVideo?.nativeElement) {
    this.cameraVideo.nativeElement.srcObject = null;
  }
}

private getCameraErrorMessage(error: unknown): string {
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
  submitStudentForm() {
    this.schoolManagementService.addStudent(this.addStudentForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.addStudentForm.reset();
              this.createForms();

            } else if (response['payload']['respCode'] == '401') {

              this.cookieService.delete('loginDetails');
              window.location.href = "/login";
              window.location.reload();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            } else {

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {

            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: (error: any) => this.messageService.add({
          summary: '500', detail: 'Server Error', styleClass: 'danger-background-popover',
        })
      });
  }



}
