import { Component } from '@angular/core';
import { UserManagementService } from '../../user-management/user-management.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  public userDetails: any;
  public password : boolean[] = [false];

  public togglePassword(index: number){
    this.password[index] = !this.password[index]
  }

  ngOnInit() {
    this.getUserByLoginId();
  }

  constructor(
    private userManagementService: UserManagementService,
  ){

  }

  public getUserByLoginId() {
    this.userManagementService.getUserDetailsByLoginId()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userDetails = JSON.parse(JSON.stringify(response['payload']));
            console.log("hghkg : "+this.userDetails['mobileNo']);
            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


}
