import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/core/core.index';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { WebsiteSettingService } from '../website-setting.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';
import { CookieService } from 'ngx-cookie-service';

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
    private websiteSettingService: WebsiteSettingService,
    private authenticationService: AuthenticationService,
    private mediaUrl: TenantMediaUrlService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  // show() {
  //   this.messageService.add({
  //     summary: 'Toast',
  //     detail: 'Hello, world! This is a toast message.',
  //     styleClass: 'danger-background-popover',
      
  //   });
  // }

  public applicationDetailsList: any;
  public loginUser: any;
  public userOptions: any[] = [];
  public selectedUserLoginId = '';
  public isUsersLoading = false;
  public isSuperadmin = false;
  public isMainadmin = false;
  public loggedInRoleType = '';

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
    this.loggedInRoleType = String(
      this.loginUser?.roleType || this.cookieService.get('roleType') || ''
    ).toUpperCase();
    this.isSuperadmin = this.loggedInRoleType === 'SUPERADMIN';
    this.isMainadmin = this.loggedInRoleType === 'MAINADMIN';
    this.selectedUserLoginId = this.loginUser?.superadminId || this.loginUser?.loginId || '';
    this.getUserDetails();
    if (!this.isMainadmin) this.getApplicationDetailsList(this.selectedUserLoginId);
  }

  public getUserDetails(): void {
    this.isUsersLoading = true;
    this.websiteSettingService.getUserDetailsForCompanySettings().subscribe({
      next: (response: any) => {
        const users = response?.listPayload ?? response?.payload ?? response?.data;
        this.userOptions = Array.isArray(users) ? users : [];
        this.isUsersLoading = false;
      },
      error: () => {
        this.userOptions = [];
        this.isUsersLoading = false;
        this.messageService.add({
          summary: 'Unable to load users',
          detail: 'The user dropdown could not be loaded.',
          styleClass: 'danger-background-popover'
        });
      }
    });
  }

  public userOptionLabel(user: any): string {
    const name = [user?.firstName, user?.lastName]
      .map(value => String(value || '').trim())
      .filter(Boolean)
      .join(' ');
    const loginId = String(user?.loginId || '').trim();
    return name && loginId ? `${name} (${loginId})` : name || loginId || 'Unnamed user';
  }

  public onSuperadminSelected(superadminId: string): void {
    this.selectedUserLoginId = superadminId;
    this.clearApplicationDetails();
    if (superadminId) this.getApplicationDetailsList(superadminId);
  }

  loginPageWallpaperBase64(event: any) {
    this.readImage(event, 'loginPageWallpaper');
  }

  loginPageLogoBase64(event: any) {
    this.readImage(event, 'loginPageLogo');
  }

  displayLogoBase64(event: any) {
    this.readImage(event, 'displayLogo');
  }

  private readImage(event: Event, field: 'loginPageWallpaper' | 'loginPageLogo' | 'displayLogo'): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      this.messageService.add({ summary: 'Invalid file', detail: 'Please select an image file.', styleClass: 'danger-background-popover' });
      input.value = '';
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      this.messageService.add({ summary: 'File too large', detail: 'Image size must be 5 MB or less.', styleClass: 'danger-background-popover' });
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.comapany[field] = String(reader.result || '');
    reader.readAsDataURL(selectedFile);
  }

  public imageUrl(value: string): string {
    if (!value || value.startsWith('data:') || /^https?:/i.test(value)) return value;
    return this.mediaUrl.applicationImage(
      this.loginUser?.service || this.cookieService.get('service'),
      this.selectedUserLoginId || this.loginUser?.superadminId,
      value
    );
  }

  submitCompanyForm() {
    if (this.isMainadmin && !this.selectedUserLoginId) {
      this.messageService.add({ summary: 'Select Superadmin', detail: 'Please select a Superadmin before saving.', styleClass: 'danger-background-popover' });
      return;
    }
    this.websiteSettingService.saveCompanyDetails(this.comapany, this.selectedUserLoginId).subscribe({
      next: (response: any) => {
        if (response.responseCode == '200') {
          if (response.payload.respCode == '200') {
            this.messageService.add({
              summary: response.payload.respCode,
              detail: response.payload.respMesg,
              styleClass: 'success-background-popover',
            });
            localStorage.setItem('displayLogo', response.payload.displayLogo || this.comapany.displayLogo);
            this.getApplicationDetailsList(this.selectedUserLoginId);
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

  public getApplicationDetailsList(superadminId?: string) {
    this.websiteSettingService.getApplicationDetailsList(superadminId).subscribe({
      next: (response: any) => {
        if (response.responseCode == '200') {
          this.applicationDetailsList = JSON.parse(JSON.stringify(response.listPayload));
          this.applicationDetailsList = this.applicationDetailsList[0];
          if (this.applicationDetailsList) this.setApplicationDetails();
          else this.clearApplicationDetails();
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

  private clearApplicationDetails(): void {
    this.applicationDetailsList = null;
    this.comapany = {
      loginPageWallpaper: '', loginPageLogo: '', ipAddress: '', displayLogo: '',
      displayName: '', emailId: '', website: '', phoneNumber: ''
    };
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
