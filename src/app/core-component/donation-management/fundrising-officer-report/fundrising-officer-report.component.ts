import { Component } from '@angular/core';
import { CommonService, SidebarService, routes } from 'src/app/core/core.index';
import { DashboardService } from '../../main/dashboard/dashboard.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-fundrising-officer-report',
  templateUrl: './fundrising-officer-report.component.html',
  styleUrl: './fundrising-officer-report.component.scss'
})
export class FundrisingOfficerReportComponent {

  public loginUser: any;
  public FRToday: any = {};

  constructor(
    private sidebar: SidebarService,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {

    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    // this.getDonationCountAndAmountGroupByNameCustom('','');
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // getDonationCountAndAmountGroupByNameCustom(firstDate:any, lastDate:any) {
  //   this.FRToday = {};
  //   this.dashboardService.getDonationCountAndAmountGroupByNameCustom(firstDate, lastDate).subscribe({
  //     next: (response: any) => {
  //       if (response['responseCode'] === 200) {
  //         const listPayload = response['listPayload'];

  //         const groupedData = listPayload.reduce((acc: any, row: any[]) => {
  //           const key = row[0];
  //           if (!acc[key]) {
  //             acc[key] = [];
  //           }
  //           acc[key].push(row);
  //           return acc;
  //         }, {});

  //         this.FRToday = groupedData;
  //       } else {
  //         console.error("Error: Response code is not 200");
  //       }
  //     },
  //     error: (err) => {
  //       console.error("Error while fetching data:", err);
  //     }
  //   });
  // }


totalCount: number = 0;
totalAmount: number = 0;

getDonationCountAndAmountGroupByNameCustom(firstDate: any, lastDate: any) {
  this.FRToday = {};
  this.totalCount = 0;
  this.totalAmount = 0;

  this.dashboardService.getDonationCountAndAmountGroupByNameCustom(firstDate, lastDate).subscribe({
    next: (response: any) => {
      if (response['responseCode'] === 200) {

        const listPayload = response['listPayload'];

        listPayload.forEach((row: any[]) => {

          // Count
          this.totalCount += Number(row[2]) || 0;

          // Amount
          this.totalAmount += Number(row[3]) || 0;

        });

        const groupedData = listPayload.reduce((acc: any, row: any[]) => {
          const key = row[0];

          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(row);

          return acc;
        }, {});

        this.FRToday = groupedData;

        console.log('Total Count : ', this.totalCount);
        console.log('Total Amount : ', this.totalAmount);
      }
    },
    error: (err) => {
      console.error('Error while fetching data:', err);
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
