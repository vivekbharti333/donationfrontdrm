import { Component } from '@angular/core';
import { CommonService, SidebarService, routes } from 'src/app/core/core.index';
import { DashboardService } from '../../main/dashboard/dashboard.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { UserManagementService } from '../../user-management/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';


@Component({
  selector: 'app-payment-mode-report',
  templateUrl: './payment-mode-report.component.html',
  styleUrl: './payment-mode-report.component.scss'
})
export class PaymentModeReportComponent {

  public userList: any;
  public loginUser: any;
  public objectKeys1 = Object.keys;
  public PaymentModeCountAmount: any = {};

  public isMainAdmin: boolean = false;
  public isSuperadmin: boolean = false;
  public isAdmin: boolean = false;
  public isTeamLeader: boolean = false;
  public isDonationExecutive: boolean = false;
  public showExcelReport: boolean = false;
  public teamLeaderList: any;

  constructor(
    private sidebar: SidebarService,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
     private userManagementService: UserManagementService,
    private cookieService: CookieService
  ) {

    this.loginUser = this.authenticationService.getLoginUser();
  }

  
  ngOnInit() {
    this.getDonationPaymentModeCountAndAmountGroupByNameCustom('', '', '');
    this.getUserDetailsList();
    this.checkRoleType();
  }

    checkRoleType() {
      if (this.loginUser['roleType'] == Constant.mainAdmin) {
        this.isMainAdmin = true;
      } else if (this.loginUser['roleType'] == Constant.superAdmin) {
        this.isSuperadmin = true;
        this.isAdmin = true;
      } else if (this.loginUser['roleType'] == Constant.admin) {
        this.isAdmin = true;
        this.isSuperadmin = true;
      } else if (this.loginUser['roleType'] == Constant.teamLeader) {
        this.isTeamLeader = true;
        this.isSuperadmin = true;
      } else if (this.loginUser['roleType'] == Constant.donorExecutive) {
        this.isDonationExecutive = true;
      }
    }

    public getUserDetailsList() {
    this.userManagementService.getUserDetailsList()
      .subscribe({
        next: (response: any) => {
         
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
            
          } else {
           
          }
         
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getDonationPaymentModeCountAndAmountGroupByNameCustom(loginId:any, firstDate:any, lastDate:any) {
    this.PaymentModeCountAmount = {}; // Initialize as an empty object
    this.dashboardService.getDonationPaymentModeCountAndAmountGroupByNameCustom(loginId, firstDate, lastDate)
      .subscribe({
        next: (response: any) => {

          // if (response['responseCode'] === 200) {
          const listPayload = response['listPayload'];

          // Grouping data by the first element (payment mode)
          const groupedData = listPayload.reduce((acc: any, row: any[]) => {
            const key = row[0]; // Extract the payment mode (first element)

            if (!acc[key]) {
              acc[key] = []; // Initialize array for this payment mode if it doesn't exist
            }

            // Push the remaining data (starting from index 1) to the respective group
            acc[key].push(row.slice(1));

            return acc;
          }, {});

          // Now assign the grouped data to PaymentModeCountAmount
          this.PaymentModeCountAmount = groupedData;

          // For debugging, check the structure of grouped data

          // } else {
          //     alert('Error: ' + response['responseMessage']);
          // }
        },
        error: (error: any) => {
          console.error('Server Error', error);
        }
      });
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
