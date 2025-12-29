import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/core/core.index';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { WebsiteSettingService } from '../website-setting.service';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss'],
  providers: [MessageService,ToastModule]
})
export class CompanySettingsComponent implements OnInit {
  constructor(
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private websiteSettingService: WebsiteSettingService
  ) {}

  // show() {
  //   this.messageService.add({
  //     summary: 'Toast',
  //     detail: 'Hello, world! This is a toast message.',
  //     styleClass: 'danger-background-popover',
      
  //   });
  // }

  public applicationDetailsList: any;

  public comapany = {
    loginPageWallpaper: '',
    loginPageLogo: '',
    ipAddress: '',
    displayLogo: '',
    displayName: '',
    emailId: '',
    website: '',
    phoneNumber: ''
  };

  ngOnInit() {
    this.getApplicationDetailsList();
  }

  loginPageWallpaperBase64(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part
        this.comapany.loginPageLogo = "data:image/jpeg;base64," + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  loginPageLogoBase64(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part
        this.comapany.displayLogo = "data:image/jpeg;base64," + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  displayLogoBase64(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part
        this.comapany.loginPageWallpaper = "data:image/jpeg;base64," + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  submitCompanyForm() {
    this.websiteSettingService.saveCompanyDetails(this.comapany).subscribe({
      next: (response: any) => {
        if (response.responseCode == '200') {
          if (response.payload.respCode == '200') {
            this.messageService.add({
              summary: response.payload.respCode,
              detail: response.payload.respMesg,
              styleClass: 'success-background-popover',
            });
          } else {
            this.messageService.add({
              summary: response.payload.respCode,
              detail: response.payload.respMesg,
              styleClass: 'danger-background-popover',
            });
          }
        } else {
          this.messageService.add({
            summary: response.payload.responseCode,
            detail: response.payload.responseMesg,
            styleClass: 'danger-background-popover',
          });
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
      }),
    });
  }

  public getApplicationDetailsList() {
    this.websiteSettingService.getApplicationDetailsList().subscribe({
      next: (response: any) => {
        if (response.responseCode == '200') {
          this.applicationDetailsList = JSON.parse(JSON.stringify(response.listPayload));
          this.applicationDetailsList = this.applicationDetailsList[0];
          this.setApplicationDetails();
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public setApplicationDetails() {
    this.comapany.loginPageWallpaper = this.applicationDetailsList.loginPageWallpaper;
    this.comapany.loginPageLogo = this.applicationDetailsList.loginPageLogo;
    this.comapany.ipAddress = this.applicationDetailsList.ipAddress;
    this.comapany.displayLogo = this.applicationDetailsList.displayLogo;
    this.comapany.displayName = this.applicationDetailsList.displayName;
    this.comapany.emailId = this.applicationDetailsList.emailId;
    this.comapany.website = this.applicationDetailsList.website;
    this.comapany.phoneNumber = this.applicationDetailsList.phoneNumber;
  }

  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
}