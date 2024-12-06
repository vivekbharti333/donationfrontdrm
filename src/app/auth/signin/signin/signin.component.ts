import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { MessageService } from 'primeng/api';
import { CommonComponentService } from 'src/app/common-component/common-component.service'; 
import { CookieService } from 'ngx-cookie-service';

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
  ) {}

  // navigation() {
  //   localStorage.setItem('menuPermission', JSON.stringify(['admindb', 'admindbn', 'usermang', 'usermang1']));
  //   this.router.navigate([routes.adminDashboard])
  // }
  
  public password: boolean[] = [false];  // Ensure sufficient elements in the array

  public togglePassword(index: number){
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
            // alert(" response['responseCode'] "+response['responseCode']);
            if (response['payload']['respCode'] == '200') {
              // alert("response['payload']['respCode'] "+response['payload']['respCode']);
              this.getApplicaionHeaderDetails();
              let permission = response['payload']['permissions'];
              localStorage.setItem('menuPermission', JSON.stringify(permission));
              localStorage.setItem('userPicture', JSON.stringify(response['payload']['userPicture']));
              
              // Get a cookie
              let expiredDate = new Date();
              expiredDate.setDate(expiredDate.getDate() + 1);
              this.cookieService.set('loginDetails', JSON.stringify(response['payload']), expiredDate);

              this.cookieService.set('loginId', response['payload']['loginId'], expiredDate);
              this.cookieService.set('firstName', response['payload']['firstName'], expiredDate);
              this.cookieService.set('lastName', response['payload']['lastName'], expiredDate);
              this.cookieService.set('roleType', response['payload']['roleType'], expiredDate);
              this.cookieService.set('teamleaderId', response['payload']['teamleaderId'], expiredDate);
              this.cookieService.set('superadminId', response['payload']['superadminId'], expiredDate);
              this.cookieService.set('token', response['payload']['token'], expiredDate);
              

             
              
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.router.navigate([routes.adminDashboard]);
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
        error: (error: any) =>  this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
      });
  }

  public getApplicaionHeaderDetails() {
    this.commonComponentService.getApplicaionHeaderDetails()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let headerDetails = JSON.parse(JSON.stringify(response['payload']));
            let base = headerDetails['displayLogo'];
            console.log("base : "+base);
            localStorage.setItem('displayLogo', base);
          } else {
          }
        },
      });
  }

}