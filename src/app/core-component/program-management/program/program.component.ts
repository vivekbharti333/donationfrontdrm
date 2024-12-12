import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { ProgramManagementService } from '../program-management.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrl: './program.component.scss'
})
export class ProgramComponent {


  public loginUser: any;
  public programList: any;
  public isLoading = true;
  public visible = false;
  public addPopupVisible = false;
  public editProgramForm!: FormGroup;
  public addProgramForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private programManagementService: ProgramManagementService,
    // private toastr: ToastrService,
    // private authenticationService: AuthenticationService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    // this.getProgramDetailsList();
    // this.getUserDetails();
    // this.createForms();
    // this.checkRoleType();
  }

  // createForms() {
  //   this.addProgramForm = this.fb.group({
  //     programName: ['', [Validators.required]], // Example of adding required validator
  //     programAmount: ['', [Validators.required]], // Example of adding required validator
  //   });
  //   this.editProgramForm = this.fb.group({
  //     id: [''],
  //     programName: ['', [Validators.required]], // Example of adding required validator
  //     programAmount: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //   });
  // }


  // public getProgramDetailsList() {
  //   this.programManagementService.getProgramDetailsList()
  //     .subscribe({
  //       next: (response: any) => {
         
  //         if (response['responseCode'] == '200') {
  //           this.programList = JSON.parse(JSON.stringify(response['listPayload']));
  //           this.isLoading = false;
  //           // this.toastr.success(response['responseMessage']);
  //         } else {
  //           this.isLoading = false;
  //           // this.toastr.error(response['responseMessage'], response['responseCode']);
  //         }
  //         this.isLoading = false;
  //       },
  //       // error: (error: any) => this.toastr.error('Server Error', '500'),
  //     });
  // }

}
