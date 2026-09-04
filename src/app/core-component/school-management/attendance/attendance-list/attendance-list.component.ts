import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';
import { AttendanceService } from '../attendance.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

type Code = 'PRESENT'|'ABSENT'|'LATE'|'LEAVE'|'HOLIDAY'|'';
interface Day { day:number; weekday:string; holiday:boolean; }
interface StudentRow {
  key:string; rollNumber:string; studentPicture:string; studentName:string; superadminId?:string;
  attendance:Record<number,Code>; present:number; absent:number; late:number; leave:number; percentage:number;
}

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss', './attendance-list-theme.scss']
})
export class AttendanceListComponent implements OnInit {
  readonly sections = Constant.SECTION_OPTIONS;
  readonly months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    .map((name, index) => ({ name, value: index + 1 }));
  readonly filterForm = this.fb.group({
    grade: [''], gradeSection: ['A'],
    month: [new Date().getMonth() + 1], year: [new Date().getFullYear()]
  });
  grades:any[] = []; years:number[] = []; days:Day[] = []; students:StudentRow[] = [];
  isLoading = false; isGradesLoading = false; errorMessage = '';
  loginUser:any;

  constructor(private fb:FormBuilder, private schoolService:SchoolManagementService, private attendanceService:AttendanceService,
    private authenticationService:AuthenticationService) {
    const year = new Date().getFullYear();
    this.years = Array.from({length:7}, (_, i) => year - 3 + i);
    this.loginUser = this.authenticationService.getLoginUser();
  }
  ngOnInit():void { this.buildDays(); this.getGrades(); }
  get monthName():string { return this.months.find(m => m.value === Number(this.filterForm.controls.month.value))?.name || ''; }
  get selectedYear():number { return Number(this.filterForm.controls.year.value); }
  get totalStudents():number { return this.students.length; }
  get totalPresent():number { return this.sum('present'); }
  get totalAbsent():number { return this.sum('absent'); }
  get totalLate():number { return this.sum('late'); }
  get totalLeave():number { return this.sum('leave'); }
  get totalMarked():number { return this.totalPresent + this.totalAbsent; }
  get overallPercentage():number { return this.totalMarked ? this.totalPresent / this.totalMarked * 100 : 0; }
  get workingDays():number { return this.days.filter(d => !d.holiday).length; }
  get holidays():number { return this.days.length - this.workingDays; }

  getGrades():void {
    this.isGradesLoading = true;
    this.schoolService.getGradeDetails().subscribe({
      next: r => {
        const rows = r?.listPayload ?? r?.payload ?? r?.data;
        this.grades = Array.isArray(rows) ? rows : [];
        if (!this.filterForm.controls.grade.value && this.grades.length) this.filterForm.controls.grade.setValue(this.gradeValue(this.grades[0]));
        this.isGradesLoading = false; this.viewAttendance();
      },
      error: () => { this.grades = []; this.isGradesLoading = false; this.viewAttendance(); }
    });
  }
  viewAttendance():void {
    this.buildDays(); this.errorMessage = ''; this.isLoading = true;
    const f = this.filterForm.getRawValue(), month = Number(f.month), year = Number(f.year);
    this.attendanceService.getStudentAttendance({
      sessionName: this.session(year, month), grade: f.grade || undefined, gradeSection: f.gradeSection || undefined,
      attendanceStartDate: this.date(year, month, 1), attendanceEndDate: this.date(year, month, new Date(year, month, 0).getDate())
    }).subscribe({
      next: r => {
        const rows = r?.listPayload ?? r?.payload ?? r?.data;
        this.students = this.group(Array.isArray(rows) ? rows : []);
        if (!this.students.length && r?.responseMessage) this.errorMessage = r.responseMessage;
        this.isLoading = false;
      },
      error: e => { this.students = []; this.errorMessage = e?.error?.responseMessage || 'Unable to load student attendance.'; this.isLoading = false; }
    });
  }
  exportAttendance():void {
    if (!this.students.length) return;
    const head = ['#','Roll No.','Student Name',...this.days.map(d => d.day),'Present','Absent','Attendance %'];
    const rows = this.students.map((s,i) => [i+1,s.rollNumber,s.studentName,...this.days.map(d => this.label(this.cell(s,d))),s.present,s.absent,s.percentage.toFixed(2)+'%']);
    const csv = [head,...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `attendance-${this.monthName}-${this.selectedYear}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  gradeValue(g:any):string { return String(g?.gradeName ?? g?.name ?? g?.gradeCode ?? g?.grade ?? '').trim(); }
  gradeLabel(g:any):string { const v=this.gradeValue(g); return v.toLowerCase().startsWith('grade') ? v : 'Grade '+(v || g?.id || ''); }
  cell(s:StudentRow,d:Day):Code { return s.attendance[d.day] || (d.holiday ? 'HOLIDAY' : ''); }
  label(code:Code):string { return ({PRESENT:'P',ABSENT:'A',LATE:'L',LEAVE:'LV',HOLIDAY:'H','':'—'} as Record<Code,string>)[code]; }
  dayPresent(day:Day):number { return this.students.filter(s => this.cell(s,day)==='PRESENT').length; }
  percentageClass(n:number):string { return n >= 80 ? 'good' : n >= 70 ? 'warning' : 'low'; }
  image(student:StudentRow):string {
    return this.schoolService.studentImageUrl(student);
  }
  useDefaultStudentImage(event:Event):void { const image=event.target as HTMLImageElement; image.onerror=null; image.src='assets/img/profiles/avatar-02.jpg'; }

  private buildDays():void {
    const m=Number(this.filterForm.controls.month.value), y=Number(this.filterForm.controls.year.value), count=new Date(y,m,0).getDate();
    this.days=Array.from({length:count},(_,i)=>{const d=new Date(y,m-1,i+1); return {day:i+1,weekday:d.toLocaleDateString('en-US',{weekday:'short'}),holiday:d.getDay()===0};});
  }
  private group(records:any[]):StudentRow[] {
    const map=new Map<string,StudentRow>();
    records.forEach(r=>{
      const key=String(r.studentAcademicId ?? r.studentId ?? r.admissionNo ?? ''); if(!key)return;
      if(!map.has(key)) map.set(key,{key,rollNumber:String(r.rollNumber??'—'),studentPicture:String(r.studentPicture??''),studentName:[r.firstName,r.middleName,r.lastName].filter(Boolean).join(' ')||'Unnamed student',superadminId:String(r.superadminId??''),attendance:{},present:0,absent:0,late:0,leave:0,percentage:0});
      const day=Number(String(r.attendanceDate??'').slice(8,10)); if(day) map.get(key)!.attendance[day]=this.normalize(r.status);
    });
    map.forEach(s=>{Object.values(s.attendance).forEach(v=>{if(v==='PRESENT')s.present++;if(v==='ABSENT')s.absent++;});const t=s.present+s.absent;s.percentage=t?s.present/t*100:0;});
    return [...map.values()].sort((a,b)=>a.rollNumber.localeCompare(b.rollNumber,undefined,{numeric:true}));
  }
  private normalize(value:any):Code {
    const s=String(value??'').toUpperCase().replace(/\s+/g,'_');
    if(['P','PRESENT'].includes(s))return 'PRESENT'; if(['A','ABSENT'].includes(s))return 'ABSENT';
    if(['H','HOLIDAY'].includes(s))return 'HOLIDAY'; return '';
  }
  private sum(k:'present'|'absent'|'late'|'leave'):number { return this.students.reduce((t,s)=>t+s[k],0); }
  private session(y:number,m:number):string { const start=m>=4?y:y-1; return `${start}-${String(start+1).slice(-2)}`; }
  private date(y:number,m:number,d:number):string { return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
}
