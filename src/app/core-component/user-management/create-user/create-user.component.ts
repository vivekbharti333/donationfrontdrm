import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { UserManagementService } from '../user-management.service';
import { MessageService } from 'primeng/api';
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

  public addUserForm!: FormGroup;

  public currentAddressType: string = 'CURRENT';
  public parmanentAddressType: string = 'PERMANENT';

  public userList: any;
  public userRoleList: any;
  public isMainAdmin: boolean = false;
  public isSuperadmin: boolean = false;
  public isAdmin: boolean = false;
  public isTeamLeader: boolean = false;


  roleTypeForMainAdmin: any = [{value: Constant.superAdmin, name: 'Superadmin'}, {value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}, { value: Constant.donorExecutive, name: 'Donation Executive'}];
  roleTypeForSuperadmin: any  = [{value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}, { value: Constant.donorExecutive, name: 'Donation Executive'}];
  roleTypeForAdmin: any = [Constant.teamLeader, Constant.fundraisingOfficer];
  roleTypeFoManager: any = [Constant.fundraisingOfficer];

  constructor(
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private userManagementService: UserManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private cookieService: CookieService,
  ) 
  {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {

    this.createForms();
    // this.checkRoleType();
    this.getUserRoleType();
    this.getTeamleaderList();
  }


  createForms() {
    this.addUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+(?:[ .][A-Za-z]+)*$')]],
      astName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+(?:[ .][A-Za-z]+)*$')]],
      roleType: [''],
      createdBy: [''],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      alternateMobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      emailId: ['', [Validators.required, Validators.email]],
      userPicture: [''],
      service: ['DONATION'],
      dob: [''],
      gender: [''],
      adminId: [''],
      teamleaderId: [''],
      permissions: [[]],

      addressList: this.fb.array([
        this.addressForm(),
        this.addressForm()]),
    });
  }

  get addressList(): FormArray {
    return this.addUserForm.get("addressList") as FormArray
  }

  addressForm() {
    return this.fb.group({
      addressType: [''],
      addressLine: [''],
      landmark: [''],
      district: [''],
      city: [''],
      state: [''],
      country: ['INDIA'],
      pincode: ['']
    });
  }

  addItem() {
    this.addressList.push(this.addressForm());
  }
  removeItem(i: number) {
    this.addressList.removeAt(i);
  }

onPermissionChange(event: any) {
  this.addUserForm.get('permissions')?.setValue(event.value);

  const permissions = this.addUserForm.get('permissions')?.value;
  console.log('permissions : ', permissions);

}


  getUserRoleType(){
    if( this.cookieService.get('roleType') === Constant.mainAdmin){
      this.userRoleList = [{value: Constant.superAdmin, name: 'Superadmin'}, {value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];

    }else if( this.cookieService.get('roleType') === Constant.superAdmin){
      this.userRoleList = [{value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}, { value: Constant.donorExecutive, name: 'Donation Executive'}];

    }else if( this.cookieService.get('roleType') === Constant.admin){
      this.userRoleList = [{value: Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
    }else if( this.cookieService.get('roleType') === Constant.teamLeader){
      this.userRoleList = [{ value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
    }
  }


  checkRoleType(){  
    if( this.cookieService.get('roleType') === Constant.mainAdmin){
      this.isMainAdmin = true;
      // this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.superAdmin){
      this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.admin){
      this.isAdmin = true;
      this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.teamLeader){
      this.isTeamLeader = true;
    }
  }

  show() {
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

  permissionsList: data[] =[
    { value: 'admin-dashboard', name: 'Lead Dashboard' },
    { value: 'sale-dashboard', name: 'Donation Dashboard' },
    { value: 'create-user', name: 'Create User' },
    { value: 'user-list', name: 'User List' },
    { value: 'create-lead', name: 'Create Lead' },
    { value: 'lead-list', name: 'Lead List' },
    { value: 'general-setting', name: 'General Setting' },
    { value: 'company-setting', name: 'Company Setting' }
  ];

  public isTeamLeaderFielsShow() {
    if (this.loginUser['roleType'] == Constant.admin) {
      this.teamLeaderFielShow = true;
    }
  }

  public getTeamleaderList() {
    this.userManagementService.getTeamleaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
            console.log(this.userList)
          } else {
            
          }
        },
      });
  }


  public getUserListForDropDown() {
    this.userManagementService.getUserListForDropDown().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userForDropDown = JSON.parse( JSON.stringify(response.listPayload)
          );
        }
      },
      // error: (error: any) =>
      //   this.messageService.add({
      //     summary: '500',
      //     detail: 'Server Error',
      //     styleClass: 'danger-background-popover',
      //   }),
    });
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        this.addUserForm.patchValue({
          userPicture: base64String
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  saveUserDetails() {
    this.userManagementService.saveUserDetails(this.addUserForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
             
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.addUserForm.reset();
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

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
}
