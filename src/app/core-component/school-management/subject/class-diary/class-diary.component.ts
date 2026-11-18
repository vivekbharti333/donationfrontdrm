import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { finalize } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

interface Chapter {
  id: number; sessionName: string; gradeId: number; grade: string;
  subjectId: number; subject: string; chapter: string;
}
interface Entry {
  gradeSection?: string;
  lessonDate: string; sessionName: string; grade: string; subject: string; chapter: string;
  firstName: string; lastName: string; teacherLogin: string; classWork: string; homework: string;
}
interface ListResponse<T> { listPayload?: T[]; }

@Component({
  standalone: true, imports: [CommonModule, FormsModule], selector: 'app-class-diary',
  templateUrl: './class-diary.component.html',
  styleUrl: './class-diary.component.scss'
})
export class ClassDiaryComponent implements OnInit {
  @ViewChild('editor') editor!: ElementRef<HTMLDialogElement>;
  get teacher(): boolean {
    const role = this.auth.getLoginUser()?.roleType || this.cookies.get('roleType');
    return String(role).trim().toUpperCase() === 'TEACHER';
  }
  get admin(): boolean {
    const role = this.auth.getLoginUser()?.roleType || this.cookies.get('roleType');
    return ['ADMIN','SUPERADMIN','MAINADMIN'].includes(String(role).trim().toUpperCase());
  }
  readonly sessionOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  private readonly currentSession = this.getCurrentSession();
  filterSession = this.currentSession;
  private getCurrentSession(): string {
    const today = new Date();
    const start = today.getFullYear() - (today.getMonth() < 3 ? 1 : 0);
    const value = start + '-' + String(start + 1).slice(-2);
    return this.sessionOptions.some(option => option.value === value) ? value : '';
  }
  filterGrade = '';
  filterSection = '';
  entrySection = '';
  readonly sectionOptions = Constant.SECTION_OPTIONS;
  get sessionEntries() { return this.entries.filter(e => !this.filterSession || e.sessionName === this.filterSession); }
  get listGrades() { return [...new Set(this.sessionEntries.map(e => e.grade))].sort(); }
  get visibleEntries() {
    return this.sessionEntries.filter(e => (!this.filterGrade || e.grade === this.filterGrade)
      && (!this.filterSection || e.gradeSection === this.filterSection));
  }
  entries: Entry[] = [];
  options: Chapter[] = [];
  session = this.currentSession; grade: number|null = null; subject: number|null = null; chapter: number|null = null;
  classWork = ''; homework = ''; error = ''; formError = ''; saving = false; loading = false; loadingOptions = false;
  constructor(private http: HttpClient, private auth: AuthenticationService, private cookies: CookieService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading = true; this.error = '';
    this.http.get<ListResponse<Entry>>(Constant.Site_Url+'getClassDiary').pipe(finalize(() => this.loading=false)).subscribe({
      next: r => this.entries=r.listPayload || [], error: () => this.error='Unable to load the class diary.'
    });
  }
  open() {
    this.formError=''; this.options=[]; this.loadingOptions=true;
    this.editor.nativeElement.showModal();
    this.http.get<ListResponse<Chapter>>(Constant.Site_Url+'getClassDiaryChapters').pipe(finalize(() => this.loadingOptions=false)).subscribe({
      next: r => { this.options=r.listPayload || []; if (!this.options.length) this.formError='Add chapters for a grade subject first.'; },
      error: () => this.formError='Unable to load chapters. Close and reopen this form to retry.'
    });
  }
  get grades() { return [...new Map(this.options.filter(o => o.sessionName===this.session).map(o => [o.gradeId,o.grade])).entries()]; }
  get subjects() { return [...new Map(this.options.filter(o => o.sessionName===this.session && o.gradeId===this.grade).map(o => [o.subjectId,o.subject])).entries()]; }
  get chapters() { return this.options.filter(o => o.sessionName===this.session && o.gradeId===this.grade && o.subjectId===this.subject); }
  save() {
    if (this.saving || !this.entrySection || !this.chapter || !this.classWork.trim()) return;
    this.saving=true; this.formError='';
    const payload={gradeSection:this.entrySection,createdBy:this.auth.getLoginUser()?.loginId || this.cookies.get('loginId'),chapterId:this.chapter,classWork:this.classWork.trim(),homework:this.homework.trim()};
    this.http.post(Constant.Site_Url+'addClassDiaryEntry',{payload}).pipe(finalize(() => this.saving=false)).subscribe({
      next: () => { this.editor.nativeElement.close(); this.classWork=''; this.homework=''; this.chapter=null; this.entrySection=''; this.load(); },
      error: e => this.formError=e.error?.responseMessage || 'Unable to save this entry.'
    });
  }
}






