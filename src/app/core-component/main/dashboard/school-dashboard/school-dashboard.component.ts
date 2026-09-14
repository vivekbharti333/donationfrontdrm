/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SchoolDashboardService, SchoolDashboardSummary } from './school-dashboard.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexFill,
  ApexGrid,
} from 'ng-apexcharts';
import { AuthenticationService } from 'src/app/auth/authentication.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries | any;
  chart: ApexChart | any;
  xaxis: ApexXAxis | any;
  yaxis: ApexYAxis | any;
  stroke: ApexStroke | any;
  tooltip: ApexTooltip | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  fill: ApexFill | any;
  legend: ApexLegend | any;
  labels: any;
  colors: any;
  grid: ApexGrid | any;
  responsive: ApexResponsive[] | any;
};

interface StatMetric {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  delta?: string;
  note?: string;
}

interface SchoolEvent {
  day: string;
  month: string;
  title: string;
  time: string;
  venue: string;
  tone: string;
}

interface Admission {
  name: string;
  className: string;
  date: string;
  status: 'Confirmed' | 'Pending';
}

interface QuickAction {
  label: string;
  icon: string;
  iconClass: string;
  route: string;
}

@Component({
  selector: 'app-school-dashboard',
  templateUrl: './school-dashboard.component.html',
  styleUrl: './school-dashboard.component.scss',
})
export class SchoolDashboardComponent implements OnInit, OnDestroy {
  summary: SchoolDashboardSummary | null = null;
  loading = false;
  dashboardError = "";
  private dashboardRequest?: Subscription;
  userName = 'Priya Sharma';
  academicYear = '2026 - 2027';

  get metrics(): StatMetric[] {
    const d = this.summary;
    const count = (value: number | undefined) => value == null ? '-' : Number(value).toLocaleString('en-IN');
    return [
      { label: 'Total Students', value: count(d?.totalStudents), icon: 'icon-users', iconClass: 'orange' },
      { label: "Today's Present", value: count(d?.todayPresent), icon: 'icon-user-check', iconClass: 'green' },
      { label: "Today's Absent", value: count(d?.todayAbsent), icon: 'icon-user-x', iconClass: 'purple' },
      { label: 'Fees Collected This Month', value: this.money(d?.currentMonthFeeCollected), icon: 'fa-solid fa-indian-rupee-sign', iconClass: 'pink', note: d?.collectionMonth },
      { label: 'Fee Due', value: this.money(d?.feeDue), icon: 'fa-solid fa-indian-rupee-sign', iconClass: 'blue', note: 'Total outstanding balance' },
    ];
  }
  money(value: number | undefined): string {
    return value == null ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
  }
  ngOnInit(): void { this.loadDashboard(); }
  ngOnDestroy(): void { this.dashboardRequest?.unsubscribe(); }
  loadDashboard(): void {
    this.dashboardRequest?.unsubscribe();
    this.loading = true;
    this.dashboardError = '';
    this.summary = null;
    this.attendanceChart = { ...this.attendanceChart, series: [0, 0] };
    this.dashboardRequest = this.dashboardService.getSchoolDashboard().subscribe({
      next: response => {
        this.loading = false;
        if (Number(response.responseCode) !== 200 || !response.payload) {
          this.dashboardError = response.responseMessage || 'Could not load school dashboard.';
          return;
        }
        this.summary = response.payload;
        this.attendanceChart = { ...this.attendanceChart, series: [Number(this.summary.todayPresent), Number(this.summary.todayAbsent)] };
      },
      error: () => { this.loading = false; this.dashboardError = 'Could not load school dashboard. Please try again.'; },
    });
  }

  readonly events: SchoolEvent[] = [
    { day: '10', month: 'SEP', title: 'Parent-Teacher Meeting', time: '10:00 AM - 1:00 PM', venue: 'School Auditorium', tone: 'orange' },
    { day: '12', month: 'SEP', title: 'Science Exhibition', time: '09:00 AM - 4:00 PM', venue: 'Main Hall', tone: 'blue' },
    { day: '15', month: 'SEP', title: 'Mid Term Exam Begins', time: 'All Day', venue: 'All Classes', tone: 'purple' },
    { day: '20', month: 'SEP', title: 'Sports Day', time: '09:00 AM - 5:00 PM', venue: 'School Ground', tone: 'green' },
  ];

  readonly admissions: Admission[] = [
    { name: 'Aarav Mehta', className: 'Class 1', date: '10 Sep 2026', status: 'Confirmed' },
    { name: 'Diya Patel', className: 'UKG', date: '09 Sep 2026', status: 'Confirmed' },
    { name: 'Reyansh Kumar', className: 'Class 5', date: '08 Sep 2026', status: 'Pending' },
    { name: 'Ananya Singh', className: 'Class 3', date: '07 Sep 2026', status: 'Confirmed' },
    { name: 'Vihaan Reddy', className: 'LKG', date: '06 Sep 2026', status: 'Confirmed' },
  ];

  readonly avatarColors = [
    { bg: '#ffe4d1', fg: '#d96c00' },
    { bg: '#dbeafe', fg: '#2563eb' },
    { bg: '#dcfce7', fg: '#16a34a' },
    { bg: '#f3e8ff', fg: '#9333ea' },
    { bg: '#fce7f3', fg: '#db2777' },
  ];

  readonly quickActions: QuickAction[] = [
    { label: 'Add Student', icon: 'icon-user-plus', iconClass: 'blue', route: '/school-management/add-student' },
    { label: 'Collect Fees', icon: 'fa-solid fa-indian-rupee-sign', iconClass: 'orange', route: '/school-management/generate-school-receipt' },
    { label: 'Mark Attendance', icon: 'icon-calendar', iconClass: 'green', route: '/school-management/attendance-mark' },
    { label: 'Create Notice', icon: 'icon-bell', iconClass: 'pink', route: '/whats-app-management' },
    { label: 'Generate Report', icon: 'icon-file-text', iconClass: 'purple', route: '/reports' },
    { label: 'Send Message', icon: 'icon-mail', iconClass: 'blue', route: '/whats-app-management' },
  ];

  enrollmentChart: Partial<ChartOptions>;
  attendanceChart: Partial<ChartOptions>;
  feeChart: Partial<ChartOptions>;

  constructor(private authentication: AuthenticationService, private dashboardService: SchoolDashboardService) {
    const loginUser: any = this.authentication.getLoginUser();
    if (loginUser && (loginUser.firstName || loginUser.name || loginUser.userName)) {
      this.userName = loginUser.firstName || loginUser.name || loginUser.userName;
    }

    this.enrollmentChart = {
      series: [{ name: 'Students', data: [78, 102, 125, 158, 182, 195, 210] }],
      chart: { type: 'bar', height: 265, toolbar: { show: false }, fontFamily: 'inherit' },
      plotOptions: { bar: { columnWidth: '42%', borderRadius: 6, borderRadiusApplication: 'end' } },
      dataLabels: { enabled: true, offsetY: -22, style: { fontSize: '11px', fontWeight: 600, colors: ['#1e2a3b'] } },
      xaxis: {
        categories: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 5', 'Class 10', 'Class 12'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#8a94a6', fontSize: '11px' } },
      },
      yaxis: {
        min: 0, max: 250, tickAmount: 5,
        labels: { style: { colors: '#8a94a6', fontSize: '11px' } },
      },
      grid: { borderColor: '#f0ebe3', strokeDashArray: 4, padding: { top: 10 } },
      tooltip: { y: { formatter: (val: number) => `${val} students` } },
      colors: ['#ff8a2b'],
    };

    this.attendanceChart = {
      series: [0, 0],
      chart: { type: 'donut', height: 230, fontFamily: 'inherit' },
      labels: ['Present', 'Absent'],
      colors: ['#22c55e', '#f87171', '#fbbf24', '#cbd5e1'],
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 3, colors: ['#ffffff'] },
      plotOptions: { pie: { donut: { size: '74%', labels: { show: false } }, expandOnClick: false } },
      tooltip: { y: { formatter: (val: number) => `${val} students` } },
      responsive: [{ breakpoint: 576, options: { chart: { height: 200 } } }],
    };

    this.feeChart = {
      series: [
        { name: 'Collected', data: [5.2, 6.1, 5.8, 7.2, 8.4, 9.6, 8.9, 10.2, 11.4] },
        { name: 'Pending', data: [1.4, 1.0, 1.5, 1.1, 0.9, 1.3, 1.0, 0.8, 0.9] },
      ],
      chart: { type: 'bar', height: 225, stacked: true, stackType: 'normal', toolbar: { show: false }, fontFamily: 'inherit' },
      plotOptions: { bar: { columnWidth: '46%', borderRadius: 4, borderRadiusWhenStacked: 'all', borderRadiusApplication: 'end' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#8a94a6', fontSize: '11px' } },
      },
      yaxis: {
        min: 0, max: 15, tickAmount: 3,
        labels: { style: { colors: '#8a94a6', fontSize: '11px' }, formatter: (val: number) => `${val}L` },
      },
      grid: { borderColor: '#f0ebe3', strokeDashArray: 4, padding: { top: 5 } },
      legend: { show: false },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val: number) => `₹${val}L` } },
      colors: ['#22c55e', '#fbbf24'],
    };
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  attendanceCount(label: string): number {
    const index = (this.attendanceChart.labels as string[]).indexOf(label);
    return index > -1 ? (this.attendanceChart.series as number[])[index] : 0;
  }

  attendanceColor(label: string): string {
    const index = (this.attendanceChart.labels as string[]).indexOf(label);
    return index > -1 ? (this.attendanceChart.colors as string[])[index] : 'transparent';
  }

  initials(name: string): string {
    return name.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();
  }
}
