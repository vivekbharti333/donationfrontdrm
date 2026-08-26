import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';
import { AttendanceService } from '../attendance.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

type Status = 'PRESENT'|'ABSENT'|'LATE'|'LEAVE';
interface StudentReport {
  key:string; rollNumber:string; admissionNo:string; studentName:string; studentPicture:string; superadminId?:string;
  present:number; absent:number; late:number; leave:number; total:number; attendancePercentage:number; records:any[];
}

@Component({
  selector:'app-attendance-report',
  templateUrl:'./attendance-report.component.html',
  styleUrls:['./attendance-report.component.scss','./attendance-report-theme.scss']
})
export class AttendanceReportComponent implements OnInit {
  readonly sections=Constant.SECTION_OPTIONS;
  readonly imageBaseUrl=Constant.Site_Url+'studentImage/';
  readonly filterForm=this.fb.group({grade:[''],gradeSection:['A'],fromDate:[this.firstDay()],toDate:[this.today()]});
  grades:any[]=[]; reports:StudentReport[]=[]; isLoading=false; isGradesLoading=false; errorMessage='';
  page=1; pageSize=10; selectedReport:StudentReport|null=null;
  loginUser:any;

  constructor(private fb:FormBuilder,private schoolService:SchoolManagementService,private attendanceService:AttendanceService,
    private authenticationService:AuthenticationService){this.loginUser=this.authenticationService.getLoginUser();}
  ngOnInit():void{this.getGrades();}
  get pagedReports():StudentReport[]{const start=(this.page-1)*this.pageSize;return this.reports.slice(start,start+this.pageSize);}
  get totalPages():number{return Math.max(1,Math.ceil(this.reports.length/this.pageSize));}
  get shownFrom():number{return this.reports.length?(this.page-1)*this.pageSize+1:0;}
  get shownTo():number{return Math.min(this.page*this.pageSize,this.reports.length);}
  get totalStudents():number{return this.reports.length;}
  get totalPresent():number{return this.sum('present');} get totalAbsent():number{return this.sum('absent');}
  get totalLate():number{return this.sum('late');} get totalLeave():number{return this.sum('leave');}
  get totalMarked():number{return this.totalPresent+this.totalAbsent;}
  percent(value:number):number{return this.totalMarked?value/this.totalMarked*100:0;}

  getGrades():void{
    this.isGradesLoading=true;
    this.schoolService.getGradeDetails().subscribe({
      next:r=>{const rows=r?.listPayload??r?.payload??r?.data;this.grades=Array.isArray(rows)?rows:[];if(this.grades.length)this.filterForm.controls.grade.setValue(this.gradeValue(this.grades[0]));this.isGradesLoading=false;this.viewAttendance();},
      error:()=>{this.grades=[];this.isGradesLoading=false;this.viewAttendance();}
    });
  }
  viewAttendance():void{
    const f=this.filterForm.getRawValue();
    if(!f.fromDate||!f.toDate){this.errorMessage='From Date and To Date are required.';return;}
    if(f.fromDate>f.toDate){this.errorMessage='From Date cannot be after To Date.';return;}
    this.isLoading=true;this.errorMessage='';this.page=1;
    this.attendanceService.getStudentAttendance({
      sessionName:this.sessionFor(f.fromDate),grade:f.grade||undefined,gradeSection:f.gradeSection||undefined,
      attendanceStartDate:f.fromDate,attendanceEndDate:f.toDate
    }).subscribe({
      next:r=>{const rows=r?.listPayload??r?.payload??r?.data;this.reports=this.group(Array.isArray(rows)?rows:[]);if(!this.reports.length&&r?.responseMessage)this.errorMessage=r.responseMessage;this.isLoading=false;},
      error:e=>{this.reports=[];this.errorMessage=e?.error?.responseMessage||'Unable to load attendance report.';this.isLoading=false;}
    });
  }
  exportReport():void{
    if(!this.reports.length)return;
    const head=['#','Roll No.','Admission No.','Student Name','Present','Absent','Attendance %'];
    const rows=this.reports.map((r,i)=>[i+1,r.rollNumber,r.admissionNo,r.studentName,r.present,r.absent,r.attendancePercentage.toFixed(2)+'%']);
    const csv=[head,...rows].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
    a.href=url;a.download=`attendance-report-${this.filterForm.controls.fromDate.value}-to-${this.filterForm.controls.toDate.value}.csv`;a.click();URL.revokeObjectURL(url);
  }
  openDetails(report:StudentReport):void{this.selectedReport=report;} closeDetails():void{this.selectedReport=null;}
  changePage(page:number):void{if(page>=1&&page<=this.totalPages)this.page=page;}
  gradeValue(g:any):string{return String(g?.gradeName??g?.name??g?.gradeCode??g?.grade??'').trim();}
  gradeLabel(g:any):string{const v=this.gradeValue(g);return v.toLowerCase().startsWith('grade')?v:'Grade '+(v||g?.id||'');}
  studentImage(student:StudentReport):string{
    const picture=String(student?.studentPicture||'').trim();
    if(!picture)return'assets/img/profiles/avatar-02.jpg';
    if(/^(data:image\/|blob:|https?:)/i.test(picture))return picture;
    if(picture.length>100&&/^[A-Za-z0-9+/=\r\n]+$/.test(picture))return'data:image/png;base64,'+picture;
    const superadminId=String(student?.superadminId||this.loginUser?.superadminId||this.loginUser?.loginId||'').trim();
    const url=this.imageBaseUrl+encodeURIComponent(picture);
    return superadminId?url+'?superadminId='+encodeURIComponent(superadminId):url;
  }
  useDefaultStudentImage(event:Event):void{const image=event.target as HTMLImageElement;image.onerror=null;image.src='assets/img/profiles/avatar-02.jpg';}
  rowPercent(value:number,row:StudentReport):number{return row.total?value/row.total*100:0;}
  percentageClass(value:number):string{return value>=75?'good':value>=60?'warning':'low';}
  statusClass(value:any):string{return this.normalize(value).toLowerCase();}

  private group(records:any[]):StudentReport[]{
    const map=new Map<string,StudentReport>();
    records.forEach(record=>{
      const key=String(record.studentAcademicId??record.studentId??record.admissionNo??'');if(!key)return;
      if(!map.has(key))map.set(key,{key,rollNumber:String(record.rollNumber??'—'),admissionNo:String(record.admissionNo??'—'),studentName:[record.firstName,record.middleName,record.lastName].filter(Boolean).join(' ')||'Unnamed student',studentPicture:String(record.studentPicture??''),superadminId:String(record.superadminId??''),present:0,absent:0,late:0,leave:0,total:0,attendancePercentage:0,records:[]});
      const row=map.get(key)!,status=this.normalize(record.status);
      if(status==='PRESENT'||status==='ABSENT')row.records.push(record);
      if(status==='PRESENT')row.present++;if(status==='ABSENT')row.absent++;if(status==='LATE')row.late++;if(status==='LEAVE')row.leave++;
    });
    map.forEach(row=>{row.records.sort((a,b)=>String(a.attendanceDate).localeCompare(String(b.attendanceDate)));row.total=row.present+row.absent;row.attendancePercentage=row.total?row.present/row.total*100:0;});
    return [...map.values()].sort((a,b)=>a.rollNumber.localeCompare(b.rollNumber,undefined,{numeric:true}));
  }
  private normalize(value:any):Status{const s=String(value??'').toUpperCase().replace(/\s+/g,'_');if(s==='P'||s==='PRESENT')return'PRESENT';if(s==='A'||s==='ABSENT')return'ABSENT';if(s==='L'||s==='LATE')return'LATE';return'LEAVE';}
  private sum(k:'present'|'absent'|'late'|'leave'):number{return this.reports.reduce((total,row)=>total+row[k],0);}
  private today():string{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}
  private firstDay():string{const d=new Date();return this.date(d.getFullYear(),d.getMonth()+1,1);}
  private date(y:number,m:number,d:number):string{return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
  private sessionFor(dateValue:string):string{const d=new Date(dateValue+'T00:00:00'),start=d.getMonth()>=3?d.getFullYear():d.getFullYear()-1;return `${start}-${String(start+1).slice(-2)}`;}
}
