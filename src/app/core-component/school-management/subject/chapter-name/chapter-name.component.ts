import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { GradeSubjectService } from '../../Examination/grade-subject/grade-subject.service';
import { ChapterNameService, ChapterRow } from './chapter-name.service';

@Component({
  selector: 'app-chapter-name', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './chapter-name.component.html', styleUrl: './chapter-name.component.scss'
})
export class ChapterNameComponent implements OnInit {
  years = Constant.ACADEMIC_YEAR_OPTIONS;
  session = this.currentSession();

  private currentSession(): string {
    const today = new Date();
    const start = today.getFullYear() - (today.getMonth() < 3 ? 1 : 0);
    const session = start + '-' + String(start + 1).slice(-2);
    return this.years.some(year => year.value === session) ? session : '';
  }
  grade: number | null = null;
  mapping: number | null = null;
  grades: {id:number; gradeName:string}[] = [];
  subjects: {id:number; subjectName:string}[] = [];
  mappings: {id:number; gradeId:number; subjectId:number; academicYear:string}[] = [];
  draft = '';
  message = '';
  @ViewChild('editor') editor!: ElementRef<HTMLDialogElement>;
  groups: ChapterRow[][] = [];
  filterSession = this.currentSession();
  filterGrade = '';
  filterSubject = '';

  get sessionGroups(): ChapterRow[][] {
    return this.groups.filter(([row]) => !this.filterSession || row.sessionName === this.filterSession);
  }

  get listGrades(): string[] {
    return [...new Set(this.sessionGroups.map(([row]) => row.grade))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  get gradeGroups(): ChapterRow[][] {
    return this.sessionGroups.filter(([row]) => !this.filterGrade || row.grade === this.filterGrade);
  }

  get listSubjects(): string[] {
    return [...new Set(this.gradeGroups.map(([row]) => row.subject))].sort((a, b) => a.localeCompare(b));
  }

  get visibleGroups(): ChapterRow[][] {
    return this.gradeGroups.filter(([row]) => !this.filterSubject || row.subject === this.filterSubject);
  }

  private groupChapters(rows: ChapterRow[]): ChapterRow[][] {
    const groups = new Map<string, ChapterRow[]>();
    for (const row of rows) {
      const key = JSON.stringify([row.sessionName, row.grade, row.subject]);
      const group = groups.get(key);
      if (group) group.push(row);
      else groups.set(key, [row]);
    }
    return Array.from(groups.values());
  }
  loading = false;
  listError = '';
  notice = '';
  loadList() {
    this.loading = true;
    this.listError = '';
    this.chapters.list().pipe(finalize(() => this.loading = false)).subscribe({
      next: r => {
        if ([200,204].includes(Number(r.responseCode))) this.groups = this.groupChapters(r.listPayload || []);
        else this.listError = 'Unable to load chapters.';
      },
      error: () => this.listError = 'Unable to load chapters.'
    });
  }
  open() {
    this.notice = '';
    this.resetDraft();
    this.session = this.currentSession();
    this.grade = this.mapping = null;
    this.editor.nativeElement.showModal();
    this.loadMasters();
  }
  busy = false;

  constructor(private masters: GradeSubjectService, private chapters: ChapterNameService) {}
  ngOnInit() { this.loadList(); }
  loadMasters() {
    this.busy = true;
    forkJoin({grades:this.masters.getGradeDetails(), subjects:this.masters.getExamSubject(),
      mappings:this.masters.getExamGradeSubject({status:'ACTIVE'})}).pipe(finalize(() => this.busy = false)).subscribe({
      next: data => {
        if (Object.values(data).some(r => ![200,204].includes(Number(r?.responseCode)))) {
          this.message = 'Unable to load grade subjects.'; return;
        }
        this.grades = data.grades.listPayload || [];
        this.subjects = data.subjects.listPayload || [];
        this.mappings = data.mappings.listPayload || [];
      }, error: () => this.message = 'Unable to load grade subjects.'
    });
  }
  get availableGrades() {
    return this.grades.filter(g => this.mappings.some(m => m.academicYear === this.session && m.gradeId === g.id));
  }
  get availableSubjects() {
    return this.mappings.filter(m => m.academicYear === this.session && m.gradeId === this.grade)
      .map(m => ({id:m.id, name:this.subjects.find(s => s.id === m.subjectId)?.subjectName})).filter(m => m.name);
  }
  resetDraft() { this.draft = ''; this.message = ''; }
  save() {
    if (!this.mapping || this.busy || !this.draft.trim()) return;
    this.busy = true;
    this.message = '';
    const names = this.draft.split(/\r?\n/).map(n => n.trim()).filter(Boolean);
    this.chapters.add(this.mapping, names).pipe(finalize(() => this.busy = false)).subscribe({
      next: r => {
        if (Number(r.responseCode) !== 200) { this.message = r.responseMessage || 'Unable to save chapters.'; return; }
        this.editor.nativeElement.close();
        this.draft = '';
        this.notice = 'Chapters saved.';
        this.loadList();
      }, error: () => this.message = 'Unable to save chapters.'
    });
  }
}


