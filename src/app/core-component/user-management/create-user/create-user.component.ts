import { Component } from '@angular/core';
// import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { UserManagementService } from '../user-management.service';
import { MessageService } from 'primeng/api';
import { routes } from 'src/app/core/helpers/routes';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';

interface data {
  value: string;
  name: string;
}

interface dropDownUser {
  firstName: string;
  lastName: string;
  loginId: string;
}

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
  providers: [MessageService, ToastModule],
})
export class CreateUserComponent {
  public loginUser: any;
  public userForDropDown: any[] = [];
  public teamLeaderFielShow: boolean = false;

  constructor(
    private sidebar: SidebarService,
    private userManagementService: UserManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) // private toastr: ToastrService
  {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  public user = {
    userPicture: '',
    firstName: '',
    lastName: '',
    emailId: '',
    gender: '',
    adminId: '',
    teamleaderId: '',
    permissions: '',
    roleType: '',
    mobileNo: '',
    alternateMobile: '',
    userCode: '',
    idDocumentType: '',
    idDocumentPicture: '',
    panNumber: '',
    dob: '',
    emergencyContactRelation1: '',
    emergencyContactName1: '',
    emergencyContactNo1: '',
    emergencyContactRelation2: '',
    emergencyContactName2: '',
    emergencyContactNo2: '',
    // addressList: [
    //   this.createAddress(),
    //   this.createAddress()
    // ]
    addressList: [
      {
        addressType: 'CURRENT',
        addressLine: '',
        landmark: '',
        district: '',
        city: '',
        state: '',
        country: 'INDIA',
        pincode: '',
      },
      {
        addressType: 'PARMANENT',
        addressLine: '',
        landmark: '',
        district: '',
        city: '',
        state: '',
        country: 'INDIA',
        pincode: '',
      },
    ],
    // addressList: [
    //   this.createAddress('CURRENT'),
    //   this.createAddress('PERMANENT')
    // ]
  };

  show() {
    // this.messageService.add({
    //   summary: 'Toast',
    //   detail: 'Hello, world! This is a toast message.',
    // });

    this.messageService.add({
      summary: 'test',
      detail: 'uiyiyuui',
      styleClass: 'success-background-popover',
    });
  }

  public password: boolean[] = [false];

  genderType: data[] = [
    { value: 'MALE', name: 'MALE' },
    { value: 'FEMALE', name: 'FEMALE' },
    { value: 'OTHER', name: 'OTHER' },
  ];
  userType: data[] = [
    { value: 'ADMIN', name: 'ADMIN' },
    { value: 'TEAM_LEADER', name: 'TEAM LEADER' },
    { value: 'SALE_EXECUTIVE', name: 'SALE EXECUTIVE' },
  ];
  // permissionsList: data[] = [{ value: '1', name: 'admindb'}, {value: '2', name: 'admindbn'}, {value: '3', name: 'usermang'},{value: '3', name: 'usermang1'}];
  permissionsList: string[] = [
    'admin-dashboard',
    'sale-dashboard',
    'create-user',
    'user-list',
    'general-setting',
    'company-setting',
  ];

  public isTeamLeaderFielsShow() {
    if (this.loginUser['roleType'] == Constant.admin) {
      this.teamLeaderFielShow = true;
    }
  }

  public getUserListForDropDown() {
    this.userManagementService.getUserListForDropDown().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userForDropDown = JSON.parse(
            JSON.stringify(response.listPayload)
          );
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        this.user.userPicture = 'data:image/jpeg;base64,' + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  submitUserForm(form: NgForm) {
    this.userManagementService.saveUserDetails(this.user).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            form.reset();
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
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
      error: () =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
        }),
    });
    // this.isLoading = false;
  }

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
}
