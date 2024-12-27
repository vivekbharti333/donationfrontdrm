import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
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

  public addUserForm!: FormGroup;

  public currentAddressType: string = 'CURRENT';
  public parmanentAddressType: string = 'PERMANENT';

  public userList: any;
  // public loginUser: any;
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
    
  ) // private toastr: ToastrService
  {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {

    this.createForms();
    // this.checkRoleType();
    this.getUserRoleType();
    this.getTeamleaderList();
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
  };


  createForms() {
    this.addUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      lastName: ['', [Validators.required, Validators.pattern("[1-9]{1}[0-9]{9}")]],
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
      permissions: [''],

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
    'create-lead',
    'lead-list',
    'general-setting',
    'company-setting',
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
        this.user.userPicture = 'data:image/jpeg;base64,' + base64String;
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
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              this.addUserForm.reset();
              this.createForms();
              // this.isLoading = false;
            } else if (response['payload']['respCode'] == '401') {

              this.cookieService.delete('loginDetails');
              window.location.href = "/login";
              window.location.reload();
              this.messageService.add({ severity: 'danger', summary: 'Failed', detail: response['payload']['respMesg'] });
              // this.isLoading = false;
            } else {
              this.messageService.add({ severity: 'danger', summary: 'Failed', detail: response['payload']['respMesg'] });
              // this.isLoading = false;
            }
          } else {
            this.messageService.add({ severity: 'danger', summary: 'Failed', detail: response['payload']['respMesg'] });
            // this.isLoading = false;
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
        // this.messageService.add({ severity: 'danger', summary: 'Server Error', detail: 500 });
      });
      // this.isLoading = false;
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
