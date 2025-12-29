import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { EmailSettingsService } from './email-settings.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { SidebarService } from 'src/app/core/core.index';

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrl: './email-settings.component.scss',
})
export class EmailSettingsComponent {
  // constructor(private sidebar: SidebarService) {}

  // isCollapsed: boolean = false;
  // toggleCollapse() {
  //   this.sidebar.toggleCollapse();
  //   this.isCollapsed = !this.isCollapsed;
  // }


  public addEmailForm!: FormGroup;
  public isLoading = false;
  public loginUser: any;
  public emailDetailsList: any;

  constructor(
    private fb: FormBuilder,
    private emailSettingsService: EmailSettingsService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    this.createForms();
    this.getEmailServiceDetailsList();
  }

  emailTypeOption: any = ['DONATION_RECEIPT'];
  

  createForms() {
    this.addEmailForm = this.fb.group({
      serviceProvider:[],
      emailType: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      host: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      port: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      emailUserid: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      emailPassword: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      emailFrom: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      subject: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      emailBody: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
    });
  }

  addUpdateEmailServiceDetails(){
    this.isLoading = true;
    this.emailSettingsService.addUpdateEmailServiceDetails(this.addEmailForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.addEmailForm.reset();
              this.isLoading = false;
            } else {
              
            }
          } else {
           
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),

      });
  }


  public getEmailServiceDetailsList() {
    this.emailSettingsService.getEmailServiceDetailsList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.emailDetailsList = JSON.parse(JSON.stringify(response['listPayload']));
            this.emailDetailsList = this.emailDetailsList[0];

            this.emailDetailsList['serviceProvider'] = "NIMBUZ";

            this.setEmailDetails();
          } else {
          }
        },
      });
  }

  setEmailDetails() {
    this.addEmailForm.patchValue({
      serviceProvider: this.emailDetailsList['serviceProvider'],
      emailType: this.emailDetailsList['emailType'],
      host: this.emailDetailsList['host'],
      port: this.emailDetailsList['port'],
      emailUserid: this.emailDetailsList['emailUserid'],
      emailPassword: this.emailDetailsList['emailPassword'],
      emailFrom: this.emailDetailsList['emailFrom'],
      subject: this.emailDetailsList['subject'],
      emailBody: this.emailDetailsList['emailBody'],
    });
  }

}
