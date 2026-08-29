import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { StudentExamResultService } from './student-exam-result.service';

@Component({selector:'app-student-exam-result',templateUrl:'./student-exam-result.component.html',styleUrl:'./student-exam-result.component.scss'})
export class StudentExamResultComponent implements OnInit,OnDestroy{
  exams:any[]=[];students:any[]=[];fullData:any[]=[];tableData:any[]=[];serialNumberArray:number[]=[];
  selectedExamId:number|null=null;selectedStudentId:number|null=null;selectedPublished:any='';totalData=0;pageSize=10;
  isLoading=false;isMastersLoading=false;isGenerating=false;updatingResultId:number|null=null;errorMessage='';
  private currentSkip=0;private readonly destroy$=new Subject<void>();
  constructor(private service:StudentExamResultService,private pagination:PaginationService,private router:Router,private messages:MessageService){}
  ngOnInit():void{this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((p:tablePageSize)=>{if(this.router.url.includes('/student-exam-result')){this.pageSize=p.pageSize;this.currentSkip=p.skip;this.applyPagination();}});this.loadMasters();this.getResults();}
  ngOnDestroy():void{this.destroy$.next();this.destroy$.complete();}
  loadMasters():void{this.isMastersLoading=true;forkJoin({exams:this.service.getExamDetails().pipe(catchError(()=>of(null))),students:this.service.getStudentAcademicDetails().pipe(catchError(()=>of(null)))}).subscribe(r=>{this.exams=this.rows(r.exams);this.students=this.rows(r.students);this.isMastersLoading=false;});}
  getResults():void{this.isLoading=true;this.errorMessage='';this.service.getStudentExamResult({examId:this.selectedExamId,studentAcademicId:this.selectedStudentId,published:this.selectedPublished}).subscribe({next:r=>{this.fullData=this.rows(r);this.currentSkip=0;this.applyPagination();this.isLoading=false;},error:e=>{this.fullData=[];this.applyPagination();this.errorMessage=e?.error?.responseMessage||'Unable to load exam results.';this.isLoading=false;}});}
  clearFilters():void{this.selectedExamId=null;this.selectedStudentId=null;this.selectedPublished='';this.getResults();}
  generateSelected():void{if(!this.selectedExamId||!this.selectedStudentId){this.toast('Select exam and student','Both exam and student are required.','error');return;}this.isGenerating=true;this.service.generateStudentExamResult(this.selectedExamId,this.selectedStudentId).subscribe({next:r=>{this.isGenerating=false;if(!this.ok(r)){this.toast('Unable to generate result',r?.responseMessage||'Result generation failed.','error');return;}this.toast('Result generated','Student result calculated successfully.','success');this.getResults();},error:e=>{this.isGenerating=false;this.toast('Unable to generate result',e?.error?.responseMessage||'Result generation failed.','error');}});}
  generateAll():void{if(!this.selectedExamId){this.toast('Select an exam','Exam is required for bulk result generation.','error');return;}this.isGenerating=true;this.service.generateExamResults(this.selectedExamId).subscribe({next:r=>{this.isGenerating=false;if(!this.ok(r)){this.toast('Unable to generate results',r?.responseMessage||'Result generation failed.','error');return;}this.toast('Results generated','All complete student results were calculated.','success');this.getResults();},error:e=>{this.isGenerating=false;this.toast('Unable to generate results',e?.error?.responseMessage||'Result generation failed.','error');}});}
  setPublished(r:any,published:boolean):void{this.updatingResultId=r.id;this.service.publishExamResult(r.examId,r.studentAcademicId,published).subscribe({next:x=>{this.updatingResultId=null;if(!this.ok(x)){this.toast('Unable to update publication',x?.responseMessage||'Publication update failed.','error');return;}this.toast(published?'Result published':'Result unpublished',published?'The result is now published.':'The result has been unpublished.','success');this.getResults();},error:e=>{this.updatingResultId=null;this.toast('Unable to update publication',e?.error?.responseMessage||'Publication update failed.','error');}});}
  examName(id:any):string{return this.exams.find(x=>Number(x.id)===Number(id))?.examName||`Exam #${id}`;}
  studentName(id:any):string{const s=this.students.find(x=>Number(x.id)===Number(id));return s?([s.firstName,s.middleName,s.lastName].filter(Boolean).join(' ')||s.studentName||`Student #${id}`):`Student #${id}`;}
  studentRoll(id:any):string{return this.students.find(x=>Number(x.id)===Number(id))?.rollNumber||'—';}
  private rows(r:any):any[]{const rows=r?.listPayload??r?.payload??r?.data;return Array.isArray(rows)?rows:[];}
  private ok(r:any):boolean{return Number(r?.responseCode)===200;}
  private applyPagination():void{this.totalData=this.fullData.length;if(this.currentSkip>=this.totalData)this.currentSkip=0;this.tableData=this.fullData.slice(this.currentSkip,this.currentSkip+this.pageSize);this.serialNumberArray=this.tableData.map((_,i)=>this.currentSkip+i+1);this.pagination.calculatePageSize.next({totalData:this.totalData,pageSize:this.pageSize,tableData:this.tableData,serialNumberArray:this.serialNumberArray});}
  private toast(summary:string,detail:string,severity:'success'|'error'):void{this.messages.add({summary,detail,severity});}
}
