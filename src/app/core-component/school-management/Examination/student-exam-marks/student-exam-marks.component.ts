import { Constant } from 'src/app/core/constant/constants';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  selectedAcademicYear = this.getCurrentAcademicSession();
  totalData=0; pageSize=10; selectedExamId:number|null=null; selectedGradeId:number|null=null; selectedSection=''; selectedStudentId:number|null=null;
  isLoading=false; isMastersLoading=false; isSaving=false; isUpdating=false; errorMessage='';
  addMarksForm!:FormGroup; editMarksForm!:FormGroup;
  isSubjectsLoading=false; subjectLoadError='';
  private subjectLoadVersion=0;
  private listLoadVersion=0;
  private currentSkip=0; private addDialog?:MatDialogRef<any>; private editDialog?:MatDialogRef<any>;
  private readonly destroy$=new Subject<void>();

  constructor(private service:StudentExamMarksService,private pagination:PaginationService,private router:Router,
    private fb:FormBuilder,private dialog:MatDialog,private messages:MessageService){}

  ngOnInit():void{
    this.addMarksForm=this.fb.group({examId:[null,Validators.required],gradeId:[null,Validators.required],studentAcademicId:[null,Validators.required],subjectMarks:this.fb.array([])}); this.editMarksForm=this.createForm(true);
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page:tablePageSize)=>{
      if(this.router.url.includes('/student-exam-marks')){this.pageSize=page.pageSize;this.currentSkip=page.skip;this.applyPagination();}
    });
    this.loadMasters(); this.getStudentExamMarks();
  }
  ngOnDestroy():void{this.subjectLoadVersion++;this.destroy$.next();this.destroy$.complete();}

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
    const version=++this.listLoadVersion;
    const sectionStudentIds=this.selectedSection?new Set(this.listStudents().map(student=>Number(student.studentAcademicId))):null;
    this.service.getStudentExamMarks({academicYear:this.selectedAcademicYear,examId:this.selectedExamId,gradeId:this.selectedGradeId,studentAcademicId:this.selectedStudentId}).subscribe({next:r=>{
        if(version!==this.listLoadVersion)return;
        const rows=r?.listPayload??r?.payload??r?.data;this.fullData=Array.isArray(rows)?rows.filter(row=>!sectionStudentIds||sectionStudentIds.has(Number(row.studentAcademicId))):[];
        if(!Array.isArray(rows)&&![200,204].includes(Number(r?.responseCode)))this.errorMessage=r?.responseMessage||'Unable to load student marks.';
        this.currentSkip=0;this.applyPagination();this.isLoading=false;
      },error:e=>{if(version!==this.listLoadVersion)return;this.fullData=[];this.applyPagination();this.errorMessage=e?.error?.responseMessage||'Unable to load student marks.';this.isLoading=false;}});
  }
  clearFilters(): void {
    this.selectedAcademicYear = this.getCurrentAcademicSession();
    this.onListAcademicYearChange();
  }

  private getCurrentAcademicSession(date = new Date()): string {
    const startYear = date.getFullYear() - (date.getMonth() < 3 ? 1 : 0);
    const year = startYear + '-' + String(startYear + 1).slice(-2);
    return this.academicYearOptions.some(option => option.value === year) ? year : '';
  }

  onListAcademicYearChange(): void {
    this.selectedExamId = null;
    this.onListExamChange();
  }

  listExams(): any[] {
    if (!this.selectedAcademicYear) return this.exams;
    return this.exams.filter(exam => this.normalizeYear(exam.academicYear) === this.normalizeYear(this.selectedAcademicYear));
  }

  onListExamChange():void{this.selectedGradeId=null;this.selectedSection='';this.selectedStudentId=null;this.getStudentExamMarks();}
  onListGradeChange():void{this.selectedSection='';this.selectedStudentId=null;this.getStudentExamMarks();}
  onListSectionChange():void{this.selectedStudentId=null;this.getStudentExamMarks();}
  listGrades():any[]{
    if (!this.selectedExamId && !this.selectedAcademicYear) return this.grades;
    const gradeIds = new Set(this.schedules
      .filter(schedule => !this.selectedExamId || Number(schedule.examId) === Number(this.selectedExamId))
      .map(schedule => this.mapping(schedule.examGradeSubjectId))
      .filter(mapping => mapping && (!this.selectedAcademicYear ||
        this.normalizeYear(mapping.academicYear) === this.normalizeYear(this.selectedAcademicYear)))
      .map(mapping => Number(mapping.gradeId)));
    return this.grades.filter(grade=>gradeIds.has(Number(grade.id)));
  }
  private listGradeStudents():any[]{
    const exam=this.exams.find(exam=>Number(exam.id)===Number(this.selectedExamId));
    const academicYear = this.selectedAcademicYear || exam?.academicYear;
    const grade=this.grade(this.selectedGradeId);
    const names=[grade?.gradeName,grade?.gradeCode].map(value=>this.normalizeGrade(value)).filter(Boolean);
    return this.students.filter(student=>{
      if(!student.studentAcademicId)return false;
      if(academicYear&&this.normalizeYear(student.sessionName)!==this.normalizeYear(academicYear))return false;
      if(!this.selectedGradeId)return true;
      if(student.gradeId!==null&&student.gradeId!==undefined&&String(student.gradeId).trim()!=='')return Number(student.gradeId)===Number(this.selectedGradeId);
      return names.includes(this.normalizeGrade(student.grade));
    });
  }
  listSections():string[]{
    return [...new Set(this.listGradeStudents().map(student=>String(student.gradeSection||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  }
  listStudents():any[]{return this.listGradeStudents().filter(student=>!this.selectedSection||String(student.gradeSection||'').trim()===this.selectedSection);}

  get subjectMarks():FormArray<FormGroup>{return this.addMarksForm.get('subjectMarks') as FormArray<FormGroup>;}
  get pendingSubjects():number{return this.subjectMarks.controls.filter(row=>!row.disabled).length;}
  openAdd(template:TemplateRef<any>):void{
    this.clearSubjectMarks();
    this.addMarksForm.reset({examId:null,gradeId:null,studentAcademicId:null});
    this.addDialog=this.openDialog(template);
    this.addDialog.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(()=>this.clearSubjectMarks());
  }
  private clearSubjectMarks():void{
    this.subjectLoadVersion++;this.subjectMarks.clear();this.subjectLoadError='';this.isSubjectsLoading=false;
  }
  onStudentChange():void{
    this.clearSubjectMarks();
    const studentId=this.addMarksForm.get('studentAcademicId')?.value;
    if(!studentId)return;
    const schedules=this.availableSchedules(this.addMarksForm);
    if(!schedules.length||!this.eligibleStudents(this.addMarksForm).some(student=>Number(student.studentAcademicId)===Number(studentId)))return;
    const version=this.subjectLoadVersion;
    this.isSubjectsLoading=true;
    this.service.getStudentExamMarks({examId:this.addMarksForm.get('examId')?.value,studentAcademicId:studentId})
      .pipe(takeUntil(this.destroy$)).subscribe({next:response=>{
        if(version!==this.subjectLoadVersion)return;
        this.isSubjectsLoading=false;
        const code=Number(response?.responseCode);
        const records=code===204?[]:(response?.listPayload??response?.payload??response?.data);
        if((code!==200&&code!==204)||!Array.isArray(records)){
          this.subjectLoadError='Existing marks could not be checked. Please retry before entering marks.';return;
        }
        for(const schedule of schedules){
          const saved=records.find((row:any)=>Number(row.examScheduleId)===Number(schedule.id)&&Number(row.studentAcademicId)===Number(studentId));
          const row=this.fb.group({examScheduleId:[schedule.id,Validators.required],attendanceStatus:[saved?.attendanceStatus||'PRESENT',Validators.required],
            marksObtained:[saved?.marksObtained??null,Validators.min(0)],remarks:[saved?.remarks||'',Validators.maxLength(500)],status:[saved?.status||'ACTIVE',Validators.required]},
            {validators:this.marksValidator()});
          if(saved)row.disable();
          this.subjectMarks.push(row);
        }
      },error:()=>{if(version===this.subjectLoadVersion){this.isSubjectsLoading=false;this.subjectLoadError='Unable to load existing marks. Please retry.';}}});
  }
  addStudentExamMarks():void{
    if(this.isSaving||this.isSubjectsLoading||this.subjectLoadError)return;
    this.addMarksForm.markAllAsTouched();
    if(this.addMarksForm.invalid||!this.pendingSubjects)return;
    const studentId=this.addMarksForm.get('studentAcademicId')?.value;
    if(!this.eligibleStudents(this.addMarksForm).some(student=>Number(student.studentAcademicId)===Number(studentId))){
      this.toast('Invalid student selection','Select a student assigned to the exam grade and academic year.','error');return;
    }
    const value=this.addMarksForm.getRawValue();
    const rows=this.subjectMarks.controls.filter(row=>!row.disabled).map(row=>row.getRawValue());
    if(new Set(rows.map(row=>Number(row.examScheduleId))).size!==rows.length){
      this.toast('Duplicate subjects','A subject schedule can only be entered once.','error');return;
    }
    this.isSaving=true;
    this.service.getStudentExamMarks({examId:value.examId,studentAcademicId:studentId}).pipe(takeUntil(this.destroy$)).subscribe({
      next:response=>{
        const code=Number(response?.responseCode);
        const existing=code===204?[]:(response?.listPayload??response?.payload??response?.data);
        if((code!==200&&code!==204)||!Array.isArray(existing)){
          this.isSaving=false;this.toast('Unable to check existing marks','Please retry. No marks were submitted.','error');return;
        }
        let duplicates=0;
        for(const row of this.subjectMarks.controls.filter(row=>!row.disabled)){
          const saved=existing.find((mark:any)=>Number(mark.studentAcademicId)===Number(studentId)&&Number(mark.examScheduleId)===Number(row.get('examScheduleId')?.value));
          if(saved){
            row.patchValue({attendanceStatus:saved.attendanceStatus,marksObtained:saved.marksObtained??null,remarks:saved.remarks||'',status:saved.status||'ACTIVE'});
            row.disable();duplicates++;
          }
        }
        if(duplicates){
          this.isSaving=false;
          this.toast('Marks already exist',duplicates+' subject(s) already have marks and are now locked. Review the remaining subjects before saving.','warn');return;
        }
        this.saveSubjectMarks(value.examId,studentId,rows);
      },error:()=>{this.isSaving=false;this.toast('Unable to check existing marks','Please retry. No marks were submitted.','error');}
    });
  }
  private saveSubjectMarks(examId:number,studentId:number,rows:any[]):void{
    this.service.addStudentExamMarksBatch(examId,studentId,rows).pipe(takeUntil(this.destroy$)).subscribe({next:response=>{
      this.isSaving=false;
      if(Number(response?.responseCode)!==200){this.toast('Unable to add marks',response?.responseMessage||'Subject marks could not be saved.','error');return;}
      this.addDialog?.close();this.toast('Marks added','All submitted subject marks were saved successfully.','success');this.getStudentExamMarks();
    },error:error=>{this.isSaving=false;this.toast('Unable to confirm save',error?.error?.responseMessage||'Reload the student’s subjects to check saved marks before retrying.','error');}});
  }

  openEdit(template:TemplateRef<any>,marks:any):void{
    const schedule=this.schedule(marks?.examScheduleId);
    const mapping=this.mapping(schedule?.examGradeSubjectId);
    this.editMarksForm.reset({examId:schedule?.examId??null,gradeId:mapping?.gradeId??null,id:marks?.id,examScheduleId:marks?.examScheduleId,studentAcademicId:marks?.studentAcademicId,
      attendanceStatus:marks?.attendanceStatus||'PRESENT',marksObtained:marks?.marksObtained,remarks:marks?.remarks||'',status:marks?.status||'ACTIVE'});
    this.editDialog=this.openDialog(template);
  }
  updateStudentExamMarks():void{
    const studentId=this.editMarksForm.get('studentAcademicId')?.value;
    if(!this.eligibleStudents(this.editMarksForm).some(student=>Number(student.studentAcademicId)===Number(studentId))){
      this.toast('Invalid student selection','Select a student assigned to the schedule grade and academic year.','error');return;
    }
    if(this.editMarksForm.invalid||this.isUpdating){this.editMarksForm.markAllAsTouched();return;}this.isUpdating=true;
    this.service.updateStudentExamMarks(this.editMarksForm.getRawValue()).subscribe({next:r=>{this.isUpdating=false;
      if(!this.success(r)){this.toast('Unable to update marks',this.responseMessage(r,'Marks could not be updated.'),'error');return;}
      this.editDialog?.close();this.toast('Marks updated',this.responseMessage(r,'Student marks updated successfully.'),'success');this.getStudentExamMarks();
    },error:e=>{this.isUpdating=false;this.toast('Unable to update marks',e?.error?.responseMessage||'Marks could not be updated.','error');}});
  }

  onExamChange(form:FormGroup):void{
    if(form===this.addMarksForm)this.clearSubjectMarks();
    form.patchValue({gradeId:null,examScheduleId:null,studentAcademicId:null,marksObtained:null});
  }
  onGradeChange(form:FormGroup):void{
    if(form===this.addMarksForm)this.clearSubjectMarks();
    form.patchValue({examScheduleId:null,studentAcademicId:null,marksObtained:null});
  }
  availableExams():any[]{return this.exams.filter(exam=>this.schedules.some(schedule=>Number(schedule.examId)===Number(exam.id)));}
  availableSchedules(form:FormGroup):any[]{
    const examId=form.get('examId')?.value;const gradeId=form.get('gradeId')?.value;
    if(!examId||!gradeId)return [];
    return this.schedules.filter(schedule=>Number(schedule.examId)===Number(examId)&&Number(this.mapping(schedule.examGradeSubjectId)?.gradeId)===Number(gradeId));
  }
  subjectScheduleLabel(schedule: any): string {
    return this.scheduleSubject(schedule.id) + ' · ' + this.dateLabel(schedule.examDate) + ' · Max ' + schedule.maximumMarks;
  }

  scheduleSubject(scheduleId: number): string {
    const schedule = this.schedule(scheduleId);
    const mapping = this.mapping(schedule?.examGradeSubjectId);
    const subject = this.subjects.find(subject => Number(subject.id) === Number(mapping?.subjectId));
    return subject?.subjectName || '—';
  }

  scheduleDate(scheduleId: number): string {
    return this.dateLabel(this.schedule(scheduleId)?.examDate);
  }

  onScheduleChange(form:FormGroup):void{form.get('studentAcademicId')?.setValue(null);form.updateValueAndValidity();}
  onAttendanceChange(form:FormGroup):void{if(form.get('attendanceStatus')?.value==='ABSENT')form.get('marksObtained')?.setValue(null);form.updateValueAndValidity();}
  eligibleStudents(form:FormGroup):any[]{
    const schedule=this.schedule(form.get('examScheduleId')?.value)||this.availableSchedules(form)[0];const mapping=this.mapping(schedule?.examGradeSubjectId);
    if(!schedule||!mapping)return [];
    const grade=this.grade(mapping.gradeId);
    const expected=[grade?.gradeName,grade?.gradeCode].map(v=>this.normalizeGrade(v)).filter(Boolean);
    return this.students.filter(student=>{
      if(!student.studentAcademicId)return false;
      if(form===this.addMarksForm&&['INACTIVE','LEFT','WITHDRAWN','REMOVED'].includes(String(student.status||'').toUpperCase()))return false;
      if(this.normalizeYear(student.sessionName)!==this.normalizeYear(mapping.academicYear))return false;
      if(student.gradeId!==null&&student.gradeId!==undefined&&String(student.gradeId).trim()!==''){
        return Number(student.gradeId)===Number(mapping.gradeId);
      }
      // Legacy records without gradeId can only match the grade's name or code, never its database ID.
      return expected.includes(this.normalizeGrade(student.grade));
    });
  }
  scheduleLabel(id:number):string{const s=this.schedule(id);if(!s)return`Schedule #${id}`;const e=this.exams.find(x=>Number(x.id)===Number(s.examId));return`${e?.examName||'Exam'} · ${this.mappingLabel(s.examGradeSubjectId)} · ${this.dateLabel(s.examDate)}`;}
  mappingLabel(id:number):string{const m=this.mapping(id);return m?`${this.grade(m.gradeId)?.gradeName||'Grade '+m.gradeId} - ${this.subjects.find(x=>Number(x.id)===Number(m.subjectId))?.subjectName||'Subject '+m.subjectId}`:`Grade Subject #${id}`;}
  studentName(student:any):string{return [student?.firstName,student?.middleName,student?.lastName].filter(Boolean).join(' ')||student?.studentName||`Student #${student?.studentAcademicId||student?.id}`;}
  marksStudentName(id:number):string{const s=this.students.find(x=>Number(x.studentAcademicId)===Number(id));return s?this.studentName(s):`Student Academic #${id}`;}
  maximumMarks(form:FormGroup):number|null{return this.schedule(form.get('examScheduleId')?.value)?.maximumMarks??null;}
  schedule(id:any):any{return this.schedules.find(x=>Number(x.id)===Number(id));}
  sortData(sort:Sort):void{if(!sort.active||!sort.direction)return;const d=sort.direction==='asc'?1:-1;this.fullData=[...this.fullData].sort((a,b)=>String(a?.[sort.active]??'').localeCompare(String(b?.[sort.active]??''),undefined,{numeric:true})*d);this.applyPagination();}

  private createForm(withId=false):FormGroup{return this.fb.group({...(withId?{id:[null,Validators.required]}:{}),examId:[null,Validators.required],gradeId:[null,Validators.required],examScheduleId:[null,Validators.required],studentAcademicId:[null,Validators.required],attendanceStatus:['PRESENT',Validators.required],marksObtained:[null,Validators.min(0)],remarks:['',Validators.maxLength(500)],status:['ACTIVE',Validators.required]},{validators:this.marksValidator()});}
  private marksValidator():ValidatorFn{return(c:AbstractControl):ValidationErrors|null=>{const attendance=c.get('attendanceStatus')?.value;const value=c.get('marksObtained')?.value;const schedule=this.schedule(c.get('examScheduleId')?.value);const errors:ValidationErrors={};if(attendance==='PRESENT'&&(value===null||value===''))errors['marksRequired']=true;if(attendance==='PRESENT'&&schedule&&Number(value)>Number(schedule.maximumMarks))errors['marksExceeded']=true;return Object.keys(errors).length?errors:null;};}
  private mapping(id:any):any{return this.mappings.find(x=>Number(x.id)===Number(id));}private grade(id:any):any{return this.grades.find(x=>Number(x.id)===Number(id));}
  private rows(r:any):any[]{const rows=r?.listPayload??r?.payload??r?.data;return Array.isArray(rows)?rows:[];}private success(r:any):boolean{return Number(r?.responseCode)===200&&Number(r?.payload?.respCode)===200;}private responseMessage(r:any,f:string):string{return r?.payload?.respMesg||r?.responseMessage||f;}
  private normalizeGrade(v:any):string{return String(v??'').toLowerCase().replace(/grade|class/g,'').replace(/[^a-z0-9]/g,'');}private normalizeYear(v:any):string{return String(v??'').trim().replace(/\//g,'-').replace(/\s/g,'');}private dateLabel(v:any):string{return v?String(v).slice(0,10).split('-').reverse().join('-'):'—';}
  private openDialog(t:TemplateRef<any>):MatDialogRef<any>{return this.dialog.open(t,{width:'820px',maxWidth:'96vw',disableClose:true,panelClass:'custom-modal'});}private applyPagination():void{this.totalData=this.fullData.length;if(this.currentSkip>=this.totalData)this.currentSkip=0;this.tableData=this.fullData.slice(this.currentSkip,this.currentSkip+this.pageSize);this.serialNumberArray=this.tableData.map((_,i)=>this.currentSkip+i+1);this.pagination.calculatePageSize.next({totalData:this.totalData,pageSize:this.pageSize,tableData:this.tableData,serialNumberArray:this.serialNumberArray});}private toast(summary:string,detail:string,severity:'success'|'error'|'warn'):void{this.messages.add({summary,detail,severity});}
}
