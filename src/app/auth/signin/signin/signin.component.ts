import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { MessageService } from 'primeng/api';
import { CommonComponentService } from 'src/app/common-component/common-component.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],  // Corrected property name
  providers: [MessageService],
})

export class SigninComponent {
  public routes = routes;
  constructor(
    private router: Router,
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private commonComponentService: CommonComponentService,
    private cookieService: CookieService
  ) { }


  public password: boolean[] = [false];  // Ensure sufficient elements in the array

  public togglePassword(index: number) {
    this.password[index] = !this.password[index];
  }

  public login = {
    loginId: '',
    password: '',
  };

  validateUser() {
    this.userManagementService.doLogin(this.login)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              localStorage.clear();
              localStorage.setItem('authorized', 'true');
              const permission = this.parsePermissions(response['payload']['permissions']);
              localStorage.setItem('menuPermission', JSON.stringify(permission));
              localStorage.setItem('userPicture', (response['payload']['userPicture']));

              // Get a cookie
              let expiredDate = new Date();
              expiredDate.setDate(expiredDate.getDate() + 1);
              this.cookieService.set('loginDetails', JSON.stringify(response['payload']), expiredDate);

              this.cookieService.set('loginId', response['payload']['loginId'], expiredDate);
              this.cookieService.set('firstName', response['payload']['firstName'], expiredDate);
              this.cookieService.set('lastName', response['payload']['lastName'], expiredDate);
              this.cookieService.set('roleType', response['payload']['roleType'], expiredDate);
              this.cookieService.set('teamLeaderId', response['payload']['teamLeaderId'], expiredDate);
              this.cookieService.set('superadminId', response['payload']['superadminId'], expiredDate);
              this.cookieService.set('token', response['payload']['token'], expiredDate);
              this.cookieService.set('service', this.serviceName(response['payload']['service']), expiredDate);

              this.getApplicaionHeaderDetails(response['payload']['superadminId']);

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              if (this.isSchoolService(response['payload']['service'])) {
                this.router.navigate([routes.schoolDashboard]);
              } else if (response['payload']['roleType'] == Constant.donorExecutive) {
                this.router.navigate([routes.adminDashboard]);
              } else if (response['payload']['roleType'] == Constant.superAdmin) {
                this.router.navigate([routes.donationDashboard]);
              } else {
                this.router.navigate([routes.donationDashboard]);
              } 
            } else {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['responseCode'],
              detail: response['payload']['responseMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: (error: any) => this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
      });
  }

  private parsePermissions(permissions: unknown): string[] {
    if (Array.isArray(permissions)) {
      return permissions.filter((permission): permission is string =>
        typeof permission === 'string'
      );
    }

    if (typeof permissions !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(permissions.replace(/'/g, '"'));
      return Array.isArray(parsed)
        ? parsed.filter((permission): permission is string =>
            typeof permission === 'string'
          )
        : [];
    } catch {
      return [];
    }
  }

  private isSchoolService(service: unknown): boolean {
    return this.serviceValues(service).includes('SCHOOL');
  }

  private serviceName(service: unknown): string {
    return this.serviceValues(service).join(',');
  }

  private serviceValues(service: unknown): string[] {
    if (Array.isArray(service)) {
      return service.flatMap((value) => this.serviceValues(value));
    }

    if (service && typeof service === 'object') {
      const value = service as Record<string, unknown>;
      return this.serviceValues(value['name'] ?? value['value'] ?? value['service']);
    }

    if (typeof service !== 'string') {
      return [];
    }

    const normalized = service.trim();
    if (!normalized) {
      return [];
    }

    try {
      const parsed = JSON.parse(normalized.replace(/'/g, '"'));
      if (parsed !== normalized) {
        return this.serviceValues(parsed);
      }
    } catch {
      // Plain service names such as SCHOOL and DONATION are expected here.
    }

    return normalized
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
  }

  public getApplicaionHeaderDetails(superadminId: any) {
    this.commonComponentService.getApplicaionHeaderDetails(superadminId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let headerDetails = JSON.parse(JSON.stringify(response['payload']));
            let base = headerDetails['displayLogo'];
            console.log("base : " + base);
            localStorage.setItem('displayLogo', base);
          } else {
          }
        },
      });
  }

}
