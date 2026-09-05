import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';
import { catchError, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { StudentExamResultService } from './student-exam-result.service';

@Component({ selector: 'app-student-exam-result', templateUrl: './student-exam-result.component.html', styleUrl: './student-exam-result.component.scss' })
export class StudentExamResultComponent implements OnInit, OnDestroy {
  exams: any[] = []; students: any[] = []; fullData: any[] = []; tableData: any[] = []; serialNumberArray: number[] = [];
  schedules: any[] = []; mappings: any[] = []; subjects: any[] = []; grades: any[] = [];
  invoiceHeader: any = null;
  selectedExamId: number | null = null; selectedStudentId: number | null = null; selectedPublished: any = ''; totalData = 0; pageSize = 10;
  isLoading = false; isMastersLoading = false; isGenerating = false; updatingResultId: number | null = null; reportLoadingId: number | null = null; errorMessage = '';
  openActionMenuId: number | null = null;
  openFilterMenu: 'exam' | 'student' | 'publication' | null = null;
  private currentSkip = 0; private readonly destroy$ = new Subject<void>();
  constructor(private service: StudentExamResultService, private pagination: PaginationService, private router: Router,
    private messages: MessageService, private authentication: AuthenticationService,
    private tenantMediaUrl: TenantMediaUrlService) { }
  ngOnInit(): void { this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((p: tablePageSize) => { if (this.router.url.includes('/student-exam-result')) { this.pageSize = p.pageSize; this.currentSkip = p.skip; this.applyPagination(); } }); this.loadMasters(); this.getResults(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  @HostListener('document:click') closeMenus(): void { this.openActionMenuId = null; this.openFilterMenu = null; }
  closeActionMenu(): void { this.openActionMenuId = null; }
  closeFilterMenu(): void { this.openFilterMenu = null; }
  toggleActionMenu(event: Event, id: number): void { event.stopPropagation(); this.openActionMenuId = this.openActionMenuId === id ? null : id; }
  toggleFilterMenu(event: Event, menu: 'exam' | 'student' | 'publication'): void { event.stopPropagation(); this.openFilterMenu = this.openFilterMenu === menu ? null : menu; }
  selectedExamLabel(): string { const exam = this.exams.find(x => Number(x.id) === Number(this.selectedExamId)); return exam ? `${exam.examName} (${exam.academicYear})` : 'Select exam'; }
  selectedStudentLabel(): string { return this.selectedStudentId ? this.studentName(this.selectedStudentId) + ' · ' + this.studentRoll(this.selectedStudentId) : 'All students'; }
  selectedPublicationLabel(): string { return this.selectedPublished === true ? 'Published' : this.selectedPublished === false ? 'Unpublished' : 'All results'; }
  loadMasters(): void {
    this.isMastersLoading = true;
    forkJoin({
      exams: this.service.getExamDetails().pipe(catchError(() => of(null))),
      students: this.service.getStudentAcademicDetails().pipe(catchError(() => of(null))),
      schedules: this.service.getExamSchedule().pipe(catchError(() => of(null))),
      mappings: this.service.getExamGradeSubject().pipe(catchError(() => of(null))),
      subjects: this.service.getExamSubject().pipe(catchError(() => of(null))),
      grades: this.service.getGradeDetails().pipe(catchError(() => of(null))),
      invoiceHeader: this.service.getInvoiceHeaderList().pipe(catchError(() => of(null)))
    }).subscribe(r => {
      this.exams = this.rows(r.exams); this.students = this.rows(r.students); this.schedules = this.rows(r.schedules);
      this.mappings = this.rows(r.mappings); this.subjects = this.rows(r.subjects); this.grades = this.rows(r.grades);
      const headers = this.rows(r.invoiceHeader); this.invoiceHeader = headers.length ? headers[0] : null;
      this.isMastersLoading = false;
    });
  }
  getResults(): void { this.isLoading = true; this.errorMessage = ''; this.service.getStudentExamResult({ examId: this.selectedExamId, studentAcademicId: this.selectedStudentId, published: this.selectedPublished }).subscribe({ next: r => { this.fullData = this.rows(r); this.currentSkip = 0; this.applyPagination(); this.isLoading = false; }, error: e => { this.fullData = []; this.applyPagination(); this.errorMessage = e?.error?.responseMessage || 'Unable to load exam results.'; this.isLoading = false; } }); }
  clearFilters(): void { this.selectedExamId = null; this.selectedStudentId = null; this.selectedPublished = ''; this.getResults(); }
  generateSelected(): void { if (!this.selectedExamId || !this.selectedStudentId) { this.toast('Select exam and student', 'Both exam and student are required.', 'error'); return; } this.isGenerating = true; this.service.generateStudentExamResult(this.selectedExamId, this.selectedStudentId).subscribe({ next: r => { this.isGenerating = false; if (!this.ok(r)) { this.toast('Unable to generate result', r?.responseMessage || 'Result generation failed.', 'error'); return; } this.toast('Result generated', 'Student result calculated successfully.', 'success'); this.getResults(); }, error: e => { this.isGenerating = false; this.toast('Unable to generate result', e?.error?.responseMessage || 'Result generation failed.', 'error'); } }); }
  generateAll(): void { if (!this.selectedExamId) { this.toast('Select an exam', 'Exam is required for bulk result generation.', 'error'); return; } this.isGenerating = true; this.service.generateExamResults(this.selectedExamId).subscribe({ next: r => { this.isGenerating = false; if (!this.ok(r)) { this.toast('Unable to generate results', r?.responseMessage || 'Result generation failed.', 'error'); return; } this.toast('Results generated', 'All complete student results were calculated.', 'success'); this.getResults(); }, error: e => { this.isGenerating = false; this.toast('Unable to generate results', e?.error?.responseMessage || 'Result generation failed.', 'error'); } }); }
  setPublished(r: any, published: boolean): void { this.updatingResultId = r.id; this.service.publishExamResult(r.examId, r.studentAcademicId, published).subscribe({ next: x => { this.updatingResultId = null; if (!this.ok(x)) { this.toast('Unable to update publication', x?.responseMessage || 'Publication update failed.', 'error'); return; } this.toast(published ? 'Result published' : 'Result unpublished', published ? 'The result is now published.' : 'The result has been unpublished.', 'success'); this.getResults(); }, error: e => { this.updatingResultId = null; this.toast('Unable to update publication', e?.error?.responseMessage || 'Publication update failed.', 'error'); } }); }
  openReportCard(result: any, autoPrint = false): void {
    if (!result?.examId || !result?.studentAcademicId) { this.toast('Unable to open report', 'Exam and student details are missing.', 'error'); return; }
    this.reportLoadingId = result.id;
    this.service.getStudentExamMarks(result.examId, result.studentAcademicId).subscribe({
      next: response => {
        this.reportLoadingId = null;
        const marks = this.rows(response);
        this.renderReportCard(result, marks, autoPrint);
      },
      error: error => {
        this.reportLoadingId = null;
        this.toast('Unable to open report', error?.error?.responseMessage || 'Subject marks could not be loaded.', 'error');
      }
    });
  }
  examName(id: any): string { return this.exams.find(x => Number(x.id) === Number(id))?.examName || `Exam #${id}`; }
  studentName(id: any): string { const s = this.students.find(x => Number(x.id) === Number(id)); return s ? ([s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || s.studentName || `Student #${id}`) : `Student #${id}`; }
  studentRoll(id: any): string { return this.students.find(x => Number(x.id) === Number(id))?.rollNumber || '—'; }
  private renderReportCard(result: any, marks: any[], autoPrint: boolean): void {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) { this.toast('Popup blocked', 'Please allow popup to view report card.', 'error'); return; }
    const exam = this.exams.find(x => Number(x.id) === Number(result.examId));
    const student = this.students.find(x => Number(x.id) === Number(result.studentAcademicId));
    const title = `${this.studentName(result.studentAcademicId)} Report Card`;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>${this.escape(title)}</title>${this.reportStyles()}</head><body>${this.reportHtml(result, marks, exam, student)}${autoPrint ? this.printScript() : ''}</body></html>`);
    printWindow.document.close();
  }
  private reportHtml(result: any, marks: any[], exam: any, student: any): string {
    const totalMax = Number(result.totalMaximumMarks) || marks.reduce((sum, mark) => sum + (Number(this.schedule(mark.examScheduleId)?.maximumMarks) || 0), 0);
    const totalObtained = Number(result.totalMarksObtained) || marks.reduce((sum, mark) => sum + (Number(mark.marksObtained) || 0), 0);
    const rows = marks.length ? marks.map((m, i) => `<tr><td class="center">${i + 1}</td><td>${this.escape(this.markSubjectLabel(m))}</td><td class="center">${this.escape(this.numberText(this.schedule(m.examScheduleId)?.maximumMarks))}</td><td class="center">${this.escape(m.attendanceStatus === 'ABSENT' ? 'Absent' : this.numberText(m.marksObtained))}</td><td class="center">${this.escape(this.subjectGrade(m, this.schedule(m.examScheduleId)?.maximumMarks))}</td><td>${this.escape(m.remarks || '—')}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">No subject marks found.</td></tr>';
    const photo = this.studentImage(student);
    return `<main class="report-card">${this.schoolHeaderHtml()}<section class="report-title"><h2>Academic Report Card</h2><p>${this.escape(exam?.examName || this.examName(result.examId))}</p><span>Session: ${this.escape(exam?.academicYear || student?.sessionName || '—')}</span></section><section class="student-panel"><div class="student-details"><table class="detail-table"><tbody>${this.studentDetailRows(student, result)}</tbody></table></div><aside class="photo-card">${photo ? `<img src="${this.escape(photo)}" alt="Student photo">` : '<div class="photo-placeholder">Photo</div>'}<strong>${this.escape(this.studentName(result.studentAcademicId))}</strong><span>${this.escape(this.studentRoll(result.studentAcademicId))}</span></aside></section><table class="marks-table"><thead><tr><th>S. No.</th><th>Subject</th><th>Max. Marks</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr></thead><tbody>${rows}<tr class="total-row"><td colspan="2">Total</td><td class="center">${this.escape(this.numberText(totalMax))}</td><td class="center">${this.escape(this.numberText(totalObtained))}</td><td class="center">${this.escape(result.grade || '—')}</td><td class="center">-</td></tr></tbody></table><section class="result-line"><div>Percentage: <b>${this.escape(this.numberText(result.percentage))}%</b></div><div>Result: <b class="${result.resultStatus === 'FAIL' ? 'fail-text' : 'pass-text'}">${this.escape(result.resultStatus || '—')}</b></div><div>Rank: <b>${this.escape(result.studentRank || '—')}</b></div></section><section class="two-column"><div class="mini-card"><h3>Class Teacher's Remarks</h3><p>${this.escape(this.teacherRemark(result))}</p></div><div class="mini-card"><h3>Result Summary</h3><p>Grade: <b>${this.escape(result.grade || '—')}</b></p><p>Failed Subjects: <b>${this.escape(result.failedSubjectCount || 0)}</b></p></div></section><section class="grading-card"><h3>Grading Scale</h3><table><tbody><tr><th>Grade</th><td>A+</td><td>A</td><td>B+</td><td>B</td><td>C</td><td>D</td></tr><tr><th>Marks Range</th><td>91 - 100</td><td>81 - 90</td><td>71 - 80</td><td>61 - 70</td><td>51 - 60</td><td>Below 50</td></tr></tbody></table></section><section class="footer-sign"><div class="footer-top"><div><b>Date:</b> ${this.escape(this.dateLabel(new Date().toISOString()))}</div><div class="principal-sign">Principal</div></div><div class="motto"><span></span>Education Builds Better Citizens<span></span></div></section></main>`;
  }
  private reportStyles(): string { return `<style>@page{size:A4 portrait;margin:7mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{background:#eef6ff;font-family:Arial,sans-serif;margin:0;color:#071a3d}.report-card{background:radial-gradient(circle at top left,#f8fdff 0,#fff 42%,#f7fbff 100%);border:1px solid #a8c8e8;margin:0 auto;max-width:960px;min-height:calc(100vh - 20px);padding:18px 24px 58px;position:relative}.school-head{align-items:center;border-bottom:3px solid #0b4f87;display:flex;flex-direction:row;gap:14px;padding-bottom:9px}.school-logo{height:88px;object-fit:contain;width:88px}.school-info{flex:1;text-align:center}.school-info h1{color:#073b78;font-size:27px;font-weight:700;letter-spacing:.3px;margin:0 0 4px;text-transform:uppercase}.school-info p{color:#1b2f4a;font-size:11px;line-height:1.25;margin:2px 0}.school-values{border-left:1px solid #9cbadc;border-top:0;color:#0b4f87;font-size:10px;font-weight:700;line-height:1.55;padding-left:14px;text-transform:uppercase;width:112px}.report-title{text-align:center;margin:7px 0}.report-title h2{color:#073b78;font-size:24px;font-weight:500;letter-spacing:1px;margin:0;text-transform:uppercase}.report-title p{font-size:13px;font-weight:700;margin:3px 0;color:#071a3d}.report-title span{background:#d8ebfb;border-radius:7px;color:#071a3d;display:inline-block;font-size:13px;font-weight:700;padding:4px 28px}.student-panel{border:1px solid #98c4ec;border-radius:8px;display:grid;grid-template-columns:1fr 160px;margin:8px 0 10px;overflow:hidden}.student-details{padding:0}.detail-table{border-collapse:collapse;margin:0;width:100%}.detail-table td{border-bottom:1px solid #c7ddf2;color:#06152d;font-size:12px;padding:5px 8px}.detail-table tr:last-child td{border-bottom:0}.detail-table .label{width:150px}.detail-table .colon{width:18px;text-align:center}.detail-table .value{font-weight:600}.photo-card{align-items:center;border-left:1px solid #c7ddf2;border-top:0;display:flex;flex-direction:column;justify-content:center;padding:7px;text-align:center}.photo-card img,.photo-placeholder{background:#fff;border-radius:6px;height:118px;max-width:100%;object-fit:contain;width:136px}.photo-placeholder{align-items:center;background:#eef2f7;color:#98a2b3;display:flex;justify-content:center}.photo-card strong{font-size:12px;margin-top:5px}.photo-card span{font-size:10px}.marks-table{border-collapse:collapse;margin:9px 0 0;width:100%}.marks-table th{background:linear-gradient(#2b7fbb,#07518a);border:1px solid #80b2dd;color:#fff;font-size:12px;padding:7px;text-align:center}.marks-table td{border:1px solid #acd0ee;font-size:12px;padding:6px 8px}.marks-table .total-row td{background:#dff1ff;color:#071a3d;font-weight:800;text-align:center}.center{text-align:center}.empty{text-align:center;color:#667085}.result-line{border:1px solid #98c4ec;border-top:0;border-radius:0 0 8px 8px;display:grid;font-size:15px;font-weight:700;grid-template-columns:1fr 1fr 1fr;margin-bottom:10px;padding:9px 18px}.result-line div:nth-child(2){text-align:center}.result-line div:last-child{text-align:right}.pass-text{color:#07831b!important}.fail-text{color:#dc3545!important}.two-column{display:grid;gap:10px;grid-template-columns:1.25fr .75fr;margin-bottom:10px}.mini-card,.grading-card{border:1px solid #98c4ec;border-radius:8px;overflow:hidden}.mini-card h3,.grading-card h3{background:linear-gradient(#2b7fbb,#07518a);color:#fff;font-size:13px;margin:0;padding:6px 12px}.mini-card p{font-size:12px;line-height:1.35;margin:0;padding:9px 12px}.grading-card table{border-collapse:collapse;margin:0;width:100%}.grading-card th,.grading-card td{border:1px solid #acd0ee;font-size:11px;padding:5px;text-align:center}.grading-card th{background:#f4f9ff;color:#071a3d;width:110px}.footer-sign{font-size:12px;margin-top:85px;padding:15px 4px 5px}.footer-top{align-items:flex-end;display:flex;justify-content:space-between;padding:0 0 5px}.motto{align-items:center;bottom:22px;color:#0b4f87;display:flex;font-family:Georgia,serif;font-style:italic;gap:16px;justify-content:center;left:24px;position:absolute;right:24px;text-align:center}.motto span{background:#0b4f87;height:1px;width:110px}.principal-sign{border-top:1px solid #071a3d;font-weight:700;padding-top:6px;text-align:center;width:150px}@media print{body{background:#eef6ff!important}.report-card{max-width:960px!important;min-height:calc(100vh - 20px)!important;padding-bottom:58px!important;position:relative!important}.school-head{flex-direction:row!important;text-align:initial!important}.school-values{border-left:1px solid #9cbadc!important;border-top:0!important;padding:0 0 0 14px!important;width:112px!important}.student-panel{grid-template-columns:1fr 160px!important}.two-column{grid-template-columns:1.25fr .75fr!important}.result-line{grid-template-columns:1fr 1fr 1fr!important}.footer-top{display:flex!important;justify-content:space-between!important;padding-bottom:5px!important}.footer-sign{margin-top:85px!important;padding-top:15px!important;padding-bottom:5px!important}.photo-card{border-left:1px solid #c7ddf2!important;border-top:0!important}.result-line div:nth-child(2){text-align:center!important}.result-line div:last-child{text-align:right!important}}@media screen and (max-width:760px){.report-card{padding:16px}.school-head{flex-direction:column;text-align:center}.school-values{border-left:0;border-top:1px solid #9cbadc;padding:10px 0 0;width:auto}.student-panel,.two-column,.result-line{grid-template-columns:1fr}.footer-top{align-items:flex-start;flex-direction:column;gap:5px}.motto{bottom:18px;left:16px;right:16px}.motto span{width:46px}.photo-card{border-left:0;border-top:1px solid #c7ddf2}.result-line div,.result-line div:last-child{text-align:left}}</style>`; }
  private printScript(): string {
    return `<script>window.onload=function(){var run=function(){window.focus();window.print();};var imgs=Array.prototype.slice.call(document.images||[]);if(!imgs.length){setTimeout(run,250);return;}var pending=imgs.length;var done=function(){pending--;if(pending<=0)setTimeout(run,250);};imgs.forEach(function(img){if(img.complete)done();else{img.onload=done;img.onerror=done;}});};</script>`;
  }
  private schoolHeaderHtml(): string {
    const logo = this.invoiceHeaderImage(this.invoiceHeader?.companyLogo);
    const logoHtml = logo ? `<img class="school-logo" src="${this.escape(logo)}" alt="School logo">` : '';
    const schoolName = [this.invoiceHeader?.companyFirstName, this.invoiceHeader?.companyLastName].filter(Boolean).join(' ') || 'School Name';
    const address = this.invoiceHeader?.regAddress || this.invoiceHeader?.officeAddress || '';
    const contacts = [
      this.invoiceHeader?.mobileNo ? `Phone: ${this.invoiceHeader.mobileNo}` : '',
      this.invoiceHeader?.emailId ? `Email: ${this.invoiceHeader.emailId}` : '',
      this.invoiceHeader?.website ? `Website: ${this.invoiceHeader.website}` : ''
    ].filter(Boolean).join(' | ');
    return `<section class="school-head">${logoHtml}<div class="school-info"><h1>${this.escape(schoolName)}</h1>${address ? `<p>${this.escape(address)}</p>` : ''}${contacts ? `<p>${this.escape(contacts)}</p>` : ''}</div><aside class="school-values">Discipline<br>Education<br>Character<br>Bright Future</aside></section>`;
  }
  private studentDetailRows(student: any, result: any): string {
    const contactNo = student?.fatherMobileNo || student?.mobileNo || student?.contactNo;
    const fatherName = student?.fatherName ? `${student.fatherName}${contactNo ? ` (${contactNo})` : ''}` : '';
    const details = [
      ['Student Name', this.studentName(result.studentAcademicId)],
      ['Roll No.', this.studentRoll(result.studentAcademicId)],
      ['Class / Section', [student?.grade, student?.gradeSection].filter(Boolean).join(' - ') || student?.grade],
      ['Date of Birth', this.dateLabel(student?.dob)],
      ["Father's Name", fatherName],
      ["Mother's Name", student?.motherName],
      ['Address', [student?.currentAddress, student?.currentCity, student?.currentPin].filter(Boolean).join(', ')]
    ].filter(([, value]) => String(value ?? '').trim());
    return details.map(([label, value]) => `<tr><td class="label">${this.escape(label)}</td><td class="colon">:</td><td class="value">${this.escape(value)}</td></tr>`).join('');
  }
  private invoiceHeaderImage(value: any): string {
    const image = String(value || '').trim();
    if (!image) return '';
    if (/^(data:image\/|blob:|https?:)/i.test(image)) return image;
    if (image.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(image)) return `data:image/png;base64,${image}`;
    const loginUser = this.authentication.getLoginUser();
    return this.tenantMediaUrl.receiptPicture(loginUser?.service, this.invoiceHeader?.superadminId, image);
  }
  private studentImage(student: any): string {
    const image = String(student?.studentPicture || student?.profilePicture || '').trim();
    if (!image) return '';
    if (/^(data:image\/|blob:|https?:)/i.test(image)) return image;
    if (image.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(image)) return `data:image/png;base64,${image}`;
    const loginUser = this.authentication.getLoginUser();
    return this.tenantMediaUrl.studentPicture(loginUser?.service, student?.superadminId || loginUser?.superadminId, image);
  }
  private markSubjectLabel(mark: any): string { const s = this.schedule(mark.examScheduleId); const m = this.mapping(s?.examGradeSubjectId); return m ? `${this.grade(m.gradeId)?.gradeName || 'Grade ' + m.gradeId} - ${this.subject(m.subjectId)?.subjectName || 'Subject ' + m.subjectId}` : `Schedule #${mark.examScheduleId}`; }
  private subjectGrade(mark: any, maximumMarks: any): string {
    if (mark?.attendanceStatus === 'ABSENT') return 'AB';
    const max = Number(maximumMarks); const obtained = Number(mark?.marksObtained);
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(obtained)) return '—';
    const percentage = (obtained / max) * 100;
    return percentage >= 91 ? 'A+' : percentage >= 81 ? 'A' : percentage >= 71 ? 'B+' : percentage >= 61 ? 'B' : percentage >= 51 ? 'C' : 'D';
  }
  private teacherRemark(result: any): string {
    if (result?.resultStatus === 'FAIL') return 'Needs focused practice and regular revision to improve performance.';
    const percentage = Number(result?.percentage);
    if (percentage >= 90) return 'Excellent performance. Keep up the outstanding work.';
    if (percentage >= 75) return 'Very good performance with consistent effort. Keep improving.';
    if (percentage >= 60) return 'Good performance. More regular practice can make it stronger.';
    return 'Satisfactory performance. Needs more attention and revision.';
  }
  private schedule(id: any): any { return this.schedules.find(x => Number(x.id) === Number(id)); }
  private mapping(id: any): any { return this.mappings.find(x => Number(x.id) === Number(id)); }
  private grade(id: any): any { return this.grades.find(x => Number(x.id) === Number(id)); }
  private subject(id: any): any { return this.subjects.find(x => Number(x.id) === Number(id)); }
  private dateLabel(v: any): string { return v ? String(v).slice(0, 10).split('-').reverse().join('-') : '—'; }
  private numberText(v: any): string { const n = Number(v); return Number.isFinite(n) ? n.toFixed(Number.isInteger(n) ? 0 : 2) : '—'; }
  private escape(v: any): string { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] || c)); }
  private rows(r: any): any[] { const rows = r?.listPayload ?? r?.payload ?? r?.data; return Array.isArray(rows) ? rows : []; }
  private ok(r: any): boolean { return Number(r?.responseCode) === 200; }
  private applyPagination(): void { this.totalData = this.fullData.length; if (this.currentSkip >= this.totalData) this.currentSkip = 0; this.tableData = this.fullData.slice(this.currentSkip, this.currentSkip + this.pageSize); this.serialNumberArray = this.tableData.map((_, i) => this.currentSkip + i + 1); this.pagination.calculatePageSize.next({ totalData: this.totalData, pageSize: this.pageSize, tableData: this.tableData, serialNumberArray: this.serialNumberArray }); }
  private toast(summary: string, detail: string, severity: 'success' | 'error'): void { this.messages.add({ summary, detail, severity }); }
}
