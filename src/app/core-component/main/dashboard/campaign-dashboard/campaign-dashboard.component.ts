/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
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
import {
  PaginationService,
  pageSelection,
  tablePageSize,
} from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { CampaignDashboardService } from './campaign-dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  LineController,
  Filler
} from 'chart.js';

  import {  OnInit, AfterViewInit } from '@angular/core';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  LineController,
  Filler
);

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrl: './campaign-dashboard.component.scss'
})
// export class CampaignDashboardComponent {


export class CampaignDashboardComponent implements OnInit, AfterViewInit {

  campaignReportGroupByNameList: any[] = [];

  consumptionChart!: Chart;
  channelChart!: Chart;

   constructor(
      private common: CommonService,
      private setting: SettingsService,
      private data: DataService,
      private pagination: PaginationService,
      private router: Router,
  
      private campaignDetailsService: CampaignDashboardService,
      private authenticationService: AuthenticationService,
  
    ){

    }

  ngOnInit(): void {
      this.getCampaignReportByGroupCampaignName('TODAY');
  }

  ngAfterViewInit(): void {
      this.initConsumptionChart();
      this.initChannelChart();
  }

  initConsumptionChart(): void {
    const canvas = document.getElementById('consumptionChart') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['01 Jun', '08 Jun', '15 Jun', '22 Jun', '29 Jun', '06 Jul'],
        datasets: [
          {
            label: 'SMS',
            data: [10000, 14500, 13800, 17000, 15200, 17600],
            borderColor: '#ff7a00',
            backgroundColor: 'rgba(255,122,0,0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: '#ff7a00',
            fill: false
          },
          {
            label: 'WhatsApp',
            data: [6500, 9800, 9200, 12100, 10900, 12800],
            borderColor: '#34c759',
            backgroundColor: 'rgba(52,199,89,0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: '#34c759',
            fill: false
          },
          {
            label: 'Email',
            data: [3200, 5600, 4700, 6900, 6400, 7800],
            borderColor: '#2f80ed',
            backgroundColor: 'rgba(47,128,237,0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: '#2f80ed',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              padding: 18,
              color: '#555',
              font: {
                size: 12,
                // weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: '#1f1f1f',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#7a7a7a',
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 20000,
            ticks: {
              stepSize: 5000,
              color: '#7a7a7a',
              callback: (value: any) => {
                if (value >= 1000) {
                  return value / 1000 + 'K';
                }
                return value;
              }
            },
            grid: {
              color: '#f1f1f1',
              // drawBorder: false
            }
          }
        }
      }
    });
  }

  initChannelChart(): void {
    const canvas = document.getElementById('channelChart') as HTMLCanvasElement;
    if (!canvas) return;

    const centerTextPlugin = {
      id: 'centerTextPlugin',
      afterDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || !meta.data.length) return;

        const x = meta.data[0].x;
        const y = meta.data[0].y;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#8a8a8a';
        ctx.font = '500 12px Arial';
        ctx.fillText('Total Consumed', x, y - 12);

        ctx.fillStyle = '#1f1f1f';
        ctx.font = '700 24px Arial';
        ctx.fillText('261,085', x, y + 16);
        ctx.restore();
      }
    };

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['SMS', 'WhatsApp', 'Email'],
        datasets: [
          {
            data: [112340, 87540, 61205],
            backgroundColor: ['#ff7a00', '#34c759', '#2f80ed'],
            borderWidth: 0,
            hoverOffset: 6,
            // cutout: '68%'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f1f1f',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: (context: any) => {
                return `${context.label}: ${context.raw.toLocaleString()}`;
              }
            }
          }
        }
      },
      plugins: [centerTextPlugin]
    });
  }





totalSent = 0;
totalSuccess = 0;
totalFailed = 0;
successRate = 0;

changeFilter(tabName: string): void {

  this.selectedFilter = tabName;

  console.log(tabName);

  // Call your API
  this.getCampaignReportByGroupCampaignName(tabName);

}

getCampaignReportByGroupCampaignName(tabName :any): void {

  this.campaignDetailsService
      .getCampaignReportByGroupCampaignName(tabName)
      .subscribe({

        next: (response: any) => {

          if (response.responseCode === 200) {

            this.campaignReportGroupByNameList =
              response.listPayload.map((item: any[]) => ({

                campaignName: item[0] ?? 'N/A',
                totalSent: Number(item[1]),
                successCount: Number(item[2]),
                failedCount: Number(item[3])

              }));

            this.calculateTotals();

          } else {

            this.campaignReportGroupByNameList = [];

          }

        },

        error: (error: any) => {

          console.error(error);

        }

      });

}

selectedFilter = 'TODAY';
changePaymentTab(ty:any){

}

calculateTotals(): void {

  this.totalSent = 0;
  this.totalSuccess = 0;
  this.totalFailed = 0;

  this.campaignReportGroupByNameList.forEach((item: any) => {
    this.totalSent += item.totalSent;
    this.totalSuccess += item.successCount;
    this.totalFailed += item.failedCount;
  });

  this.successRate = this.totalSent > 0
    ? (this.totalSuccess * 100) / this.totalSent
    : 0;
}

getSuccessRate(item: any): number {

  if (item.totalSent === 0) {
    return 0;
  }

  return (item.successCount * 100) / item.totalSent;
}

}
