/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Renderer2, ViewChild } from '@angular/core';
import { CommonService, SidebarService, routes } from 'src/app/core/core.index';
import { DashboardService } from '../dashboard.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
  ApexLegend,
  ApexResponsive,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;

  chart: ApexChart | any;

  xaxis: ApexXAxis | any;

  stroke: ApexStroke | any;

  tooltip: ApexTooltip | any;

  dataLabels: ApexDataLabels | any;

  plotOptions: ApexPlotOptions | any;

  yaxis: ApexYAxis | any;

  fill: ApexFill | any;

  legend: ApexLegend | any;

  labels: any;

  responsive: ApexResponsive[] | any;

  colors: any;
};
@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss',
})
export class SalesDashboardComponent {
  public base = '';
  public page = '';
  public last = '';
  public routes = routes;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptionsOne: Partial<ChartOptions>;


  public username!:string;
  public loginUser: any;
  public activeUserCount: any;
  public inactiveUserCount: any;
  public todaysCount: any;
  public todaysAmount: any;
  public yesterdayCount: any;
  public yesterdayAmount: any;
  public monthCount: any;
  public monthAmount: any;

  public currentMonthName!: string;
  public FRToday: any = {};
  public objectKeys = Object.keys;

  public objectKeys1 = Object.keys;
  public PaymentModeCountAmount: any = {};
  public currencyType: any;

  constructor(
    private sidebar: SidebarService,
    private common: CommonService,
    private renderer: Renderer2,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
  ) {

    this.loginUser = this.authenticationService.getLoginUser();

    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
    this.chartOptionsOne = {
      series: [
        {
          name: 'Donation Analysis',
          // data: [25, 30, 18, 15, 22, 20, 30, 20, 22, 18, 15, 20],
          data: [25, 30, 18, 15, 22, 20, 30, 0, 0, 0, 0, 0],
        },
      ],
      chart: {
        height: 273,
        type: 'area',
        zoom: {
          enabled: false,
        },
      },
      colors: ['#FF9F43'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      xaxis: {
        categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec', ],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => {
            return val / 1 + 'K';
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
    if (this.page == 'sales-dashboard') {
      this.renderer.addClass(document.body, 'date-picker-dashboard');
    }
  }


  ngOnInit() {
    console.log("this.loginUser "+this.loginUser['lastName'] );
    this.username = this.loginUser['firstName']+" "+this.loginUser['lastName']
    this.getCountAndSum();
    this.getDonationCountAndAmountGroupByCurrency('TODAY');
    this.getDonationCountAndAmountGroupByName('TODAY');
    this.getDonationPaymentModeCountAndAmountGroupByName('TODAY');
    // this.getDonationList('TODAY');
    // this.getInvoiceTypeList();
    // this.getDonationTypeList();
    // this.getCurrencyDetailBySuperadmin();
    // this.getPaymentModeList();
    // this.getFundrisingOfficerByTeamLeaderId();
    // this.checkRoleType();

    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.currentMonthName = months[currentDate.getMonth()];
    
  }




  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }


  getCountAndSum() {
    this.dashboardService.getCountAndSum()
      .subscribe({
        next: (response: any) => {
          console.log("Response : "+response['payload']['todaysCount'])
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
               
              this.activeUserCount = response['payload']['activeUserCount'];
              this.inactiveUserCount = response['payload']['inactiveUserCount'];
              this.todaysCount = response['payload']['todaysCount'];
              this.todaysAmount = response['payload']['todaysAmount'];
              this.yesterdayCount = response['payload']['yesterdayCount'];
              this.yesterdayAmount = response['payload']['yesterdayAmount'];
              this.monthCount = response['payload']['monthCount'];
              this.monthAmount = response['payload']['monthAmount'];
            } else {
            }
          } else {
           // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  getDonationCountAndAmountGroupByCurrency(tabName: string) {
    this.currencyType= null;
    this.dashboardService.getDonationCountAndAmountGroupByCurrency(tabName)
      .subscribe({
        next: (response: any) => {
            if (response['responseCode'] == '200') {
              let currency = response['listPayload'];
              for(var i=0; i< currency.length; i++){
                this.currencyType = currency;
              }
              // this.drawChart();
            } else {
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
            }
          // } else {
          //   this.toastr.error(response['responseMessage'], response['responseCode']);
          // }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  // getDonationCountAndAmountGroupByName(tabName: string) {
  //   this.FRToday= null;
  //   this.dashboardService.getDonationCountAndAmountGroupByName(tabName)
  //     .subscribe({
  //       next: (response: any) => {
  //           if (response['responseCode'] == '200') {
              
  //             let frtoday = response['listPayload'];
  //             for(var i=0; i< frtoday.length; i++){
  //               this.FRToday = frtoday;
  //             }
  //           } else {  
  //           }
  //       },
  //     });
  // }

  getDonationCountAndAmountGroupByName(tabName: string) {
    this.FRToday= {};
    this.dashboardService.getDonationCountAndAmountGroupByName(tabName).subscribe({
      next: (response: any) => {
        if (response['responseCode'] === 200) {
          const listPayload = response['listPayload'];
  
          // Group the data by the first element (name)
          const groupedData = listPayload.reduce((acc: any, row: any[]) => {
            const key = row[0]; // Extract the name (first element)
            if (!acc[key]) {
              acc[key] = []; // Initialize array for this name if it doesn't exist
            }
            acc[key].push(row); // Add the row to the corresponding group
            return acc;
          }, {});
  
          // Assign grouped data to FRToday for display in the template
          this.FRToday = groupedData;
        } else {
          console.error("Error: Response code is not 200");
        }
      },
      error: (err) => {
        console.error("Error while fetching data:", err);
      }
    });
  }


  // getDonationPaymentModeCountAndAmountGroupByName(tabName: string) {
  //   this.PaymentModeCountAmount = null;
  //   this.dashboardService.getDonationPaymentModeCountAndAmountGroupByName(tabName)
  //     .subscribe({
  //       next: (response: any) => {
  //           if (response['responseCode'] == '200') {
  //             let paymentDetails = response['listPayload'];
  //             for(var i=0; i< paymentDetails.length; i++){
  //               this.PaymentModeCountAmount = paymentDetails;
  //             }
  //           } else {
  //             // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
  //           }
  //         // } else {
  //         //   this.toastr.error(response['responseMessage'], response['responseCode']);
  //         // }
  //       },
  //      // error: (error: any) => this.toastr.error('Server Error', '500'),
  //     });
  // }

  getDonationPaymentModeCountAndAmountGroupByName(tabName: string) {
    this.PaymentModeCountAmount = {}; // Initialize as an empty object
    this.dashboardService.getDonationPaymentModeCountAndAmountGroupByName(tabName)
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

  

}
