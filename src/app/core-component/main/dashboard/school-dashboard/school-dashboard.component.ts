import { Component } from '@angular/core';

interface DashboardMetric {
  label: string;
  value: string;
  icon: string;
  tone: string;
  trend: string;
}

@Component({
  selector: 'app-school-dashboard',
  templateUrl: './school-dashboard.component.html',
  styleUrl: './school-dashboard.component.scss',
})
export class SchoolDashboardComponent {
  academicYear = '2026-27';

  readonly metrics: DashboardMetric[] = [
    { label: 'Total Students', value: '1,248', icon: 'icon-users', tone: 'orange', trend: '3,17 18,13 32,14 47,9 62,12 78,7 93,10 108,5 123,9 138,3 153,7 168,1 184,5 200,0' },
    { label: "Today's Attendance", value: '92%', icon: 'icon-calendar', tone: 'green', trend: '3,18 22,15 41,11 60,14 79,10 98,8 117,9 136,4 155,7 174,2 200,0' },
    { label: 'Fee Collected', value: '₹ 8.4L', icon: 'icon-credit-card', tone: 'purple', trend: '3,18 22,14 41,11 60,13 79,8 98,10 117,5 136,7 155,3 174,6 200,1' },
    { label: 'Pending Fees', value: '₹ 2.1L', icon: 'icon-file-text', tone: 'red', trend: '3,18 22,12 41,14 60,9 79,12 98,6 117,10 136,4 155,8 174,1 200,6' },
  ];

  readonly admissions = [
    { name: 'Aarav Sharma', admission: 'ADM/2026/1248', className: 'VI - A', father: 'Rajesh Sharma', contact: '98765 43210', status: 'Active' },
    { name: 'Ananya Verma', admission: 'ADM/2026/1247', className: 'V - B', father: 'Sanjay Verma', contact: '98765 43211', status: 'Active' },
    { name: 'Vihaan Malhotra', admission: 'ADM/2026/1246', className: 'IV - A', father: 'Pankaj Malhotra', contact: '98765 43212', status: 'Active' },
    { name: 'Myra Iyer', admission: 'ADM/2026/1245', className: 'III - B', father: 'Ramesh Iyer', contact: '98765 43213', status: 'Active' },
  ];

  readonly quickActions = [
    { label: 'Add Student', icon: 'icon-user-plus', route: '/school-management/add-student' },
    { label: 'Assign Class', icon: 'icon-users', route: '/school-management/student-list' },
    { label: 'Mark Attendance', icon: 'icon-calendar', route: '/school-management/attendance-mark' },
    { label: 'Generate Receipt', icon: 'icon-file-text', route: '/school-management/generate-school-receipt' },
    { label: 'Create Exam', icon: 'icon-clipboard', route: '/school-management/exam' },
    { label: 'Enter Marks', icon: 'icon-edit-3', route: '/school-management/student-exam-marks' },
  ];

  readonly academicOverview = [
    { className: 'I', students: 128 }, { className: 'II', students: 142 },
    { className: 'III', students: 156 }, { className: 'IV', students: 168 },
    { className: 'V', students: 170 }, { className: 'VI', students: 162 },
    { className: 'VII', students: 170 }, { className: 'VIII', students: 152 },
  ];

  readonly events = [
    { day: '22', month: 'MAY', title: 'Unit Test - I (Class V - VIII)', detail: '22 May - 27 May 2026', type: 'Exam', tone: 'purple' },
    { day: '31', month: 'MAY', title: 'May Fee Due Date', detail: '31 May 2026', type: 'Fee Due', tone: 'orange' },
    { day: '05', month: 'JUN', title: 'Parent-Teacher Meeting', detail: '05 June 2026, 10:00 AM - 1:00 PM', type: 'Meeting', tone: 'blue' },
  ];

  readonly activities = [
    { title: 'New admission created', detail: 'Aarav Sharma · VI - A', time: '10:30 AM', icon: 'icon-user-plus' },
    { title: 'Receipt generated', detail: 'May fee · ₹12,500', time: '10:15 AM', icon: 'icon-file-text' },
    { title: 'Attendance marked', detail: 'Class VI - A · 28/30 present', time: '09:45 AM', icon: 'icon-calendar' },
    { title: 'Exam result published', detail: 'Unit Test 1 · Class VIII', time: 'Yesterday', icon: 'icon-award' },
  ];
}
