// import { Component } from '@angular/core';
import { AfterViewInit, Component } from '@angular/core';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler
} from 'chart.js';

Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler
);

import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexResponsive,
  ApexLegend,
  ApexFill,
} from 'ng-apexcharts';
import { apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { CommonService } from 'src/app/core/service/common/common.service';
import { DataService } from 'src/app/core/service/data/data.service';
import { SettingsService } from 'src/app/core/service/settings/settings.service';
import { expiredproduct } from 'src/app/shared/model/page.model';
import { DashboardService } from '../dashboard.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-donation-dashboard',
  templateUrl: './donation-dashboard.component.html',
  styleUrl: './donation-dashboard.component.scss'
})
export class DonationDashboardComponent implements AfterViewInit {

  public username!: string;
  public loginUser: any;
  public activeUserCount: any;
  public inactiveUserCount: any;
  public todaysCount: any;
  public todaysAmount: any;
  public yesterdayCount: any;
  public yesterdayAmount: any;
  public monthCount: any;
  public monthAmount: any;

  donationTrendList: any[] = [];
  donationTrendChart: any;

  totalDonationCount: number = 0;
  totalDonationAmount: number = 0;
  avgDonationAmount: number = 0;
  selectedTrendFilter: string = 'THIS_MONTH';

  topDonors: any[] = [];
  selectedTopDonorTab: string = 'Today';

  paymentModes: any[] = [];
  selectedPaymentTab: string = 'Today';
  paymentTotalAmount: number = 0;
  paymentCurrencySymbol: string = '₹';
  paymentChart: any;

  public currentMonthName!: string;
  public FRToday: any = {};
  public objectKeys = Object.keys;

  public objectKeys1 = Object.keys;
  public PaymentModeCountAmount: any = {};
  public currencyType: any;

  ngAfterViewInit(): void {
    this.initPaymentChart();
    this.initDonationTrendChart();
    this.initTotalAmountChart();
    this.getDonationCountAndAmountGroupByDate('THIS_MONTH');
    this.getDonationCountAndAmountGroupByCurrency('TODAY');
    this.getPaymentModeData('TODAY');
    this.getDonationCountAndAmountGroupByName('TODAY');
    this.getCountAndSum();

  }

  constructor(
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) { }

  destroyPaymentChart(): void {
    if (this.paymentChart) {
      this.paymentChart.destroy();
      this.paymentChart = null;
    }
  }

  initPaymentChart(): void {
    const canvas = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.destroyPaymentChart();

    const labels = this.paymentModes.map((item: any) => item.mode);
    const amounts = this.paymentModes.map((item: any) => item.amount);
    const colors = this.paymentModes.map((item: any) => item.color);

    this.paymentChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${this.paymentCurrencySymbol} ${Number(value).toLocaleString('en-IN')}`;
              }
            }
          }
        }
      }
    });
  }

  // initDonationTrendChart(): void {
  //   const canvas = document.getElementById('donationTrendChart') as HTMLCanvasElement;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   // destroy old chart before creating new one
  //   if (this.donationTrendChart) {
  //     this.donationTrendChart.destroy();
  //   }

  //   const labels = this.donationTrendList.map(item => item.donationDate);
  //   const amountData = this.donationTrendList.map(item => item.donationAmount);

  //   const maxAmount = Math.max(...amountData, 0);

  //   const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  //   gradient.addColorStop(0, 'rgba(255, 123, 33, 0.22)');
  //   gradient.addColorStop(1, 'rgba(255, 123, 33, 0.02)');

  //   this.donationTrendChart = new Chart(canvas, {
  //     type: 'line',
  //     data: {
  //       labels: labels,
  //       datasets: [
  //         {
  //           label: 'Donation Amount',
  //           data: amountData,
  //           borderColor: '#ff7b21',
  //           backgroundColor: gradient,
  //           fill: true,
  //           tension: 0.42,
  //           pointRadius: 3,
  //           pointHoverRadius: 4,
  //           pointBackgroundColor: '#ff7b21',
  //           pointBorderWidth: 0
  //         }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: {
  //         legend: { display: false }
  //       },
  //       scales: {
  //         x: {
  //           grid: {
  //             display: false
  //           },
  //           ticks: {
  //             color: '#8a94a6',
  //             font: { size: 11, family: 'Inter' }
  //           }
  //         },
  //         y: {
  //           beginAtZero: true,
  //           suggestedMax: maxAmount + 100,
  //           grid: {
  //             color: 'rgba(0,0,0,0.05)'
  //           },
  //           ticks: {
  //             color: '#8a94a6',
  //             font: { size: 11, family: 'Inter' }
  //           }
  //         }
  //       }
  //     }
  //   });
  // }

  initDonationTrendChart(): void {
  const canvas = document.getElementById('donationTrendChart') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (this.donationTrendChart) {
    this.donationTrendChart.destroy();
  }

  const labels = this.donationTrendList.map(item => item.donationDate);
  const amountData = this.donationTrendList.map(item => item.donationAmount);

  const maxAmount = Math.max(...amountData, 0);

  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(255, 123, 33, 0.22)');
  gradient.addColorStop(1, 'rgba(255, 123, 33, 0.02)');

  this.donationTrendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Donation Amount',
        data: amountData,
        borderColor: '#ff7b21',
        backgroundColor: gradient,
        fill: true,
        tension: 0.42,
        pointRadius: 3,
        pointHoverRadius: 4,
        pointBackgroundColor: '#ff7b21',
        pointBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#8a94a6',
            font: { size: 11, family: 'Inter' }
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: maxAmount + 100,
          grid: {
            color: 'rgba(0,0,0,0.05)'
          },
          ticks: {
            color: '#8a94a6',
            font: { size: 11, family: 'Inter' },
            callback: function(value: any) {
              return '₹ ' + value;
            }
          }
        }
      }
    }
  });
}

  onDonationTrendFilterChange(): void {
    this.getDonationCountAndAmountGroupByDate(this.selectedTrendFilter);
  }


  getDonationCountAndAmountGroupByDate(tabName: string) {
    this.dashboardService.getDonationCountAndAmountGroupByDate(tabName).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200 || response.responseCode == '200') {
          this.donationTrendList = response.listPayload || [];

          this.totalDonationCount = this.donationTrendList.reduce(
            (sum: number, item: any) => sum + (item.donationCount || 0), 0
          );

          this.totalDonationAmount = this.donationTrendList.reduce(
            (sum: number, item: any) => sum + (item.donationAmount || 0), 0
          );

          this.avgDonationAmount =
            this.totalDonationCount > 0
              ? this.totalDonationAmount / this.totalDonationCount
              : 0;

          this.initDonationTrendChart();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  initTotalAmountChart(): void {
    const canvas = document.getElementById('totalAmountChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(255, 123, 33, 0.24)');
    gradient.addColorStop(1, 'rgba(255, 123, 33, 0.02)');

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
        datasets: [{
          data: [80, 160, 100, 360, 150, 520, 300, 640, 480, 760, 620, 900],
          borderColor: '#ff7b21',
          backgroundColor: gradient,
          fill: true,
          tension: 0.42,
          pointRadius: 3,
          pointHoverRadius: 4,
          pointBackgroundColor: '#ff7b21',
          pointBorderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: {
              display: false,
              //  drawBorder: false
            },
            ticks: {
              color: '#8a94a6',
              font: { size: 11, family: 'Inter' }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 1000,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              // drawBorder: false
            },
            ticks: {
              color: '#8a94a6',
              font: { size: 11, family: 'Inter' },
              callback: (value: any) => `₹ ${value}`
            }
          }
        }
      }
    });
  }

  currencyReportList: any[] = [];
  selectedCurrencyReportTab: string = 'Today';

  changeCurrencyReportTab(tabName: string) {
    this.getDonationCountAndAmountGroupByCurrency(tabName);
  }

  getDonationCountAndAmountGroupByCurrency(tabName: string) {
    this.currencyReportList = [];
    this.selectedCurrencyReportTab = tabName;

    this.dashboardService.getDonationCountAndAmountGroupByCurrency(tabName)
      .subscribe({
        next: (response: any) => {
          if (response?.responseCode == 200 && Array.isArray(response?.listPayload)) {
            this.currencyReportList = response.listPayload.map((row: any[]) => ({
              currencyName: row[0] || '',
              currencySymbol: row[1] || '',
              donationCount: row[2] || 0,
              totalAmount: row[3] || 0
            }));
          } else {
            this.currencyReportList = [];
          }
        },
        error: (err) => {
          console.error('Error while fetching currency report:', err);
          this.currencyReportList = [];
        }
      });
  }


  getCountAndSum() {
    this.dashboardService.getCountAndSum()
      .subscribe({
        next: (response: any) => {
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
          }
        },
      });
  }

  changePaymentTab(tabName: string) {
    this.getPaymentModeData(tabName);
  }

  getPaymentModeData(tabName: string) {
    this.selectedPaymentTab = tabName;
    this.paymentModes = [];
    this.paymentTotalAmount = 0;

    this.dashboardService.getDonationPaymentModeCountAndAmountGroupByName(tabName).subscribe({
      next: (response: any) => {
        if (response?.responseCode === 200 && Array.isArray(response?.listPayload)) {

          const colorPalette = [
            '#ff9a3d',
            '#8b5cf6',
            '#ff6b1a',
            '#5b61d6',
            '#5bc8bd',
            '#ef4444',
            '#14b8a6',
            '#2066e7',
            '#0a21ee',
          ];

          this.paymentModes = response.listPayload.map((row: any[], index: number) => ({
            mode: row[0] || '',
            count: row[1] || 0,
            amount: row[2] || 0,
            currencyCode: row[3] || 'INR',
            currencySymbol: row[4] || '₹',
            color: colorPalette[index % colorPalette.length]
          }));

          this.paymentTotalAmount = this.paymentModes.reduce(
            (sum: number, item: any) => sum + Number(item.amount || 0),
            0
          );

          if (this.paymentModes.length > 0) {
            this.paymentCurrencySymbol = this.paymentModes[0].currencySymbol || '₹';
          } else {
            this.paymentCurrencySymbol = '₹';
          }

          this.initPaymentChart();
        } else {
          this.paymentModes = [];
          this.paymentTotalAmount = 0;
          this.destroyPaymentChart();
        }
      },
    });
  }

  getPaymentPercentage(amount: number): number {
    if (!this.paymentTotalAmount || this.paymentTotalAmount === 0) {
      return 0;
    }
    return (amount / this.paymentTotalAmount) * 100;
  }


  changeTopDonorTab(tabName: string) {
    this.getDonationCountAndAmountGroupByName(tabName);
  }

  getDonationCountAndAmountGroupByName(tabName: string) {
    this.topDonors = [];
    this.selectedTopDonorTab = tabName;

    this.dashboardService.getDonationCountAndAmountGroupByName(tabName).subscribe({
      next: (response: any) => {
        if (response?.responseCode === 200 && Array.isArray(response?.listPayload)) {
          this.topDonors = response.listPayload.map((row: any[]) => ({
            name: row[0] || '',
            currencySymbol: row[1] || '₹',
            donationCount: row[2] || 0,
            amount: row[3] || 0
          }));
        } else {
          this.topDonors = [];
        }
      },
      error: (err) => {
        console.error('Error while fetching top donors:', err);
        this.topDonors = [];
      }
    });
  }

}