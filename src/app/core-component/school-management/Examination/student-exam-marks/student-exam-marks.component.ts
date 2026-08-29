import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { StudentExamMarksService } from './student-exam-marks.service';

@Component({ selector: 'app-student-exam-marks', templateUrl: './student-exam-marks.component.html', styleUrl: './student-exam-marks.component.scss' })
export class StudentExamMarksComponent implements OnInit, OnDestroy {
  fullData:any[]=[]; tableData:any[]=[]; schedules:any[]=[]; exams:any[]=[]; mappings:any[]=[];
  subjects:any[]=[]; grades:any[]=[]; students:any[]=[]; serialNumberArray:number[]=[];
  totalData=0; pageSize=10; selectedScheduleId:number|null=null; selectedStudentId:number|null=null;
  selectedAttendance=''; selectedStatus=''; isLoading=false; isMastersLoading=false; isSaving=false; isUpdating=false; errorMessage='';
  addMarksForm!:FormGroup; editMarksForm!:FormGroup;
  private currentSkip=0; private addDialog?:MatDialogRef<any>; private editDialog?:MatDialogRef<any>;
  private readonly destroy$=new Subject<void>();

  constructor(private service:StudentExamMarksService,private pagination:PaginationService,private router:Router,
    private fb:FormBuilder,private dialog:MatDialog,private messages:MessageService){}

  ngOnInit():void{
    this.addMarksForm=this.createForm(); this.editMarksForm=this.createForm(true);
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page:tablePageSize)=>{
      if(this.router.url.includes('/student-exam-marks')){this.pageSize=page.pageSize;this.currentSkip=page.skip;this.applyPagination();}
    });
    this.loadMasters(); this.getStudentExamMarks();
  }
  ngOnDestroy():void{this.destroy$.next();this.destroy$.complete();}

  loadMasters():void{
    this.isMastersLoading=true;
    forkJoin({schedules:this.service.getExamSchedule().pipe(catchError(()=>of(null))),exams:this.service.getExamDetails().pipe(catchError(()=>of(null))),
      mappings:this.service.getExamGradeSubject().pipe(catchError(()=>of(null))),subjects:this.service.getExamSubject().pipe(catchError(()=>of(null))),
      grades:this.service.getGradeDetails().pipe(catchError(()=>of(null))),students:this.service.getStudentAcademicDetails().pipe(catchError(()=>of(null)))}).subscribe(r=>{
      this.schedules=this.rows(r.schedules);this.exams=this.rows(r.exams);this.mappings=this.rows(r.mappings);
      this.subjects=this.rows(r.subjects);this.grades=this.rows(r.grades);this.students=this.rows(r.students);this.isMastersLoading=false;
      if(!this.schedules.length)this.toast('No schedules found','Create an active exam schedule before entering marks.','error');
    });
  }

  getStudentExamMarks():void{
    this.isLoading=true;this.errorMessage='';
    this.service.getStudentExamMarks({examScheduleId:this.selectedScheduleId,studentAcademicId:this.selectedStudentId,
      attendanceStatus:this.selectedAttendance,status:this.selectedStatus}).subscribe({next:r=>{
        const rows=r?.listPayload??r?.payload??r?.data;this.fullData=Array.isArray(rows)?rows:[];
        if(!Array.isArray(rows)&&Number(r?.responseCode)!==200)this.errorMessage=r?.responseMessage||'Unable to load student marks.';
        this.currentSkip=0;this.applyPagination();this.isLoading=false;
      },error:e=>{this.fullData=[];this.applyPagination();this.errorMessage=e?.error?.responseMessage||'Unable to load student marks.';this.isLoading=false;}});
  }
  clearFilters():void{this.selectedScheduleId=null;this.selectedStudentId=null;this.selectedAttendance='';this.selectedStatus='';this.getStudentExamMarks();}

  openAdd(template:TemplateRef<any>):void{
    this.addMarksForm.reset({examScheduleId:null,studentAcademicId:null,attendanceStatus:'PRESENT',marksObtained:null,remarks:'',status:'ACTIVE'});
    this.addDialog=this.openDialog(template);
  }
  addStudentExamMarks():void{
    if(this.addMarksForm.invalid||this.isSaving){this.addMarksForm.markAllAsTouched();return;}this.isSaving=true;
    this.service.addStudentExamMarks(this.addMarksForm.getRawValue()).subscribe({next:r=>{this.isSaving=false;
      if(!this.success(r)){this.toast('Unable to add marks',this.responseMessage(r,'Marks could not be added.'),'error');return;}
      this.addDialog?.close();this.toast('Marks added',this.responseMessage(r,'Student marks added successfully.'),'success');this.getStudentExamMarks();
    },error:e=>{this.isSaving=false;this.toast('Unable to add marks',e?.error?.responseMessage||'Marks could not be added.','error');}});
  }

  openEdit(template:TemplateRef<any>,marks:any):void{
    this.editMarksForm.reset({id:marks?.id,examScheduleId:marks?.examScheduleId,studentAcademicId:marks?.studentAcademicId,
      attendanceStatus:marks?.attendanceStatus||'PRESENT',marksObtained:marks?.marksObtained,remarks:marks?.remarks||'',status:marks?.status||'ACTIVE'});
    this.editDialog=this.openDialog(template);
  }
  updateStudentExamMarks():void{
    if(this.editMarksForm.invalid||this.isUpdating){this.editMarksForm.markAllAsTouched();return;}this.isUpdating=true;
    this.service.updateStudentExamMarks(this.editMarksForm.getRawValue()).subscribe({next:r=>{this.isUpdating=false;
      if(!this.success(r)){this.toast('Unable to update marks',this.responseMessage(r,'Marks could not be updated.'),'error');return;}
      this.editDialog?.close();this.toast('Marks updated',this.responseMessage(r,'Student marks updated successfully.'),'success');this.getStudentExamMarks();
    },error:e=>{this.isUpdating=false;this.toast('Unable to update marks',e?.error?.responseMessage||'Marks could not be updated.','error');}});
  }

  onScheduleChange(form:FormGroup):void{form.get('studentAcademicId')?.setValue(null);form.updateValueAndValidity();}
  onAttendanceChange(form:FormGroup):void{if(form.get('attendanceStatus')?.value==='ABSENT')form.get('marksObtained')?.setValue(null);form.updateValueAndValidity();}
  eligibleStudents(form:FormGroup):any[]{
    const schedule=this.schedule(form.get('examScheduleId')?.value);const mapping=this.mapping(schedule?.examGradeSubjectId);
    if(!schedule||!mapping)return [];
    const grade=this.grade(mapping.gradeId);const expected=[mapping.gradeId,grade?.gradeName,grade?.gradeCode].map(v=>this.normalizeGrade(v)).filter(Boolean);
    return this.students.filter(s=>this.normalizeYear(s.sessionName)===this.normalizeYear(mapping.academicYear)&&expected.includes(this.normalizeGrade(s.grade)));
  }
  scheduleLabel(id:number):string{const s=this.schedule(id);if(!s)return`Schedule #${id}`;const e=this.exams.find(x=>Number(x.id)===Number(s.examId));return`${e?.examName||'Exam'} · ${this.mappingLabel(s.examGradeSubjectId)} · ${this.dateLabel(s.examDate)}`;}
  mappingLabel(id:number):string{const m=this.mapping(id);return m?`${this.grade(m.gradeId)?.gradeName||'Grade '+m.gradeId} - ${this.subjects.find(x=>Number(x.id)===Number(m.subjectId))?.subjectName||'Subject '+m.subjectId}`:`Grade Subject #${id}`;}
  studentName(student:any):string{return [student?.firstName,student?.middleName,student?.lastName].filter(Boolean).join(' ')||student?.studentName||`Student #${student?.studentAcademicId||student?.id}`;}
  marksStudentName(id:number):string{const s=this.students.find(x=>Number(x.id)===Number(id));return s?this.studentName(s):`Student Academic #${id}`;}
  maximumMarks(form:FormGroup):number|null{return this.schedule(form.get('examScheduleId')?.value)?.maximumMarks??null;}
  schedule(id:any):any{return this.schedules.find(x=>Number(x.id)===Number(id));}
  sortData(sort:Sort):void{if(!sort.active||!sort.direction)return;const d=sort.direction==='asc'?1:-1;this.fullData=[...this.fullData].sort((a,b)=>String(a?.[sort.active]??'').localeCompare(String(b?.[sort.active]??''),undefined,{numeric:true})*d);this.applyPagination();}

  private createForm(withId=false):FormGroup{return this.fb.group({...(withId?{id:[null,Validators.required]}:{}),examScheduleId:[null,Validators.required],studentAcademicId:[null,Validators.required],attendanceStatus:['PRESENT',Validators.required],marksObtained:[null,Validators.min(0)],remarks:['',Validators.maxLength(500)],status:['ACTIVE',Validators.required]},{validators:this.marksValidator()});}
  private marksValidator():ValidatorFn{return(c:AbstractControl):ValidationErrors|null=>{const attendance=c.get('attendanceStatus')?.value;const value=c.get('marksObtained')?.value;const schedule=this.schedule(c.get('examScheduleId')?.value);const errors:ValidationErrors={};if(attendance==='PRESENT'&&(value===null||value===''))errors['marksRequired']=true;if(attendance==='PRESENT'&&schedule&&Number(value)>Number(schedule.maximumMarks))errors['marksExceeded']=true;return Object.keys(errors).length?errors:null;};}
  private mapping(id:any):any{return this.mappings.find(x=>Number(x.id)===Number(id));}private grade(id:any):any{return this.grades.find(x=>Number(x.id)===Number(id));}
  private rows(r:any):any[]{const rows=r?.listPayload??r?.payload??r?.data;return Array.isArray(rows)?rows:[];}private success(r:any):boolean{return Number(r?.responseCode)===200&&Number(r?.payload?.respCode)===200;}private responseMessage(r:any,f:string):string{return r?.payload?.respMesg||r?.responseMessage||f;}
  private normalizeGrade(v:any):string{return String(v??'').toLowerCase().replace(/grade|class/g,'').replace(/[^a-z0-9]/g,'');}private normalizeYear(v:any):string{return String(v??'').trim().replace(/\//g,'-').replace(/\s/g,'');}private dateLabel(v:any):string{return v?String(v).slice(0,10).split('-').reverse().join('-'):'—';}
  private openDialog(t:TemplateRef<any>):MatDialogRef<any>{return this.dialog.open(t,{width:'820px',maxWidth:'96vw',disableClose:true,panelClass:'custom-modal'});}private applyPagination():void{this.totalData=this.fullData.length;if(this.currentSkip>=this.totalData)this.currentSkip=0;this.tableData=this.fullData.slice(this.currentSkip,this.currentSkip+this.pageSize);this.serialNumberArray=this.tableData.map((_,i)=>this.currentSkip+i+1);this.pagination.calculatePageSize.next({totalData:this.totalData,pageSize:this.pageSize,tableData:this.tableData,serialNumberArray:this.serialNumberArray});}private toast(summary:string,detail:string,severity:'success'|'error'):void{this.messages.add({summary,detail,severity});}
}
