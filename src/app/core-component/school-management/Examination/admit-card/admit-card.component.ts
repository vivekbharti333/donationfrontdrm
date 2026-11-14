import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, of, Subject, takeUntil, timeout } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { AdmitCardFilters, AdmitCardService } from './admit-card.service';

@Component({
  selector: 'app-admit-card',
  templateUrl: './admit-card.component.html',
  styleUrl: './admit-card.component.scss'
})
export class AdmitCardComponent implements OnInit, OnDestroy {
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  selectedAcademicYear = this.currentSession();
  selectedExamId: number | null = null; selectedGradeId: number | null = null;
  selectedSection = ''; selectedStudentId: number | null = null;
  exams: any[] = []; grades: any[] = []; students: any[] = []; invoiceHeader: any = null;
  fullData: any[] = []; tableData: any[] = []; serialNumberArray: number[] = [];
  pageSize = 10; totalData = 0;
  isMastersLoading = false; isLoading = false; isDownloading = false;
  errorMessage = ''; masterErrors: string[] = []; downloadProgress = ''; previewCard: any = null;
  hasSearched = false;
  private skip = 0; private loadVersion = 0; private destroyed = false;
  private readonly destroy$ = new Subject<void>();
  constructor(private service: AdmitCardService, private pagination: PaginationService, private router: Router,
    private messages: MessageService, private authentication: AuthenticationService, private media: TenantMediaUrlService) {}
  ngOnInit(): void {
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page: tablePageSize) => {
      if (this.router.url.includes('/admit-card')) { this.pageSize = page.pageSize; this.skip = page.skip; this.applyPagination(); }
    });
    this.loadMasters();
  }
  ngOnDestroy(): void { this.destroyed = true; this.destroy$.next(); this.destroy$.complete(); }
  private currentSession(): string {
    const now = new Date(); const start = now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);
    const session = `${start}-${String(start + 1).slice(-2)}`;
    return this.academicYearOptions.some(year => year.value === session) ? session : '';
  }
  loadMasters(): void {
    if (this.isMastersLoading) return;
    this.isMastersLoading = true; this.masterErrors = []; this.invalidate();
    forkJoin({
      exams: this.service.getExamDetails().pipe(timeout(60000), catchError(() => of(null))),
      grades: this.service.getGradeDetails().pipe(timeout(60000), catchError(() => of(null))),
      students: this.service.getStudentAcademicDetails().pipe(timeout(60000), catchError(() => of(null))),
      school: this.service.getInvoiceHeaderList().pipe(timeout(60000), catchError(() => of(null)))
    }).pipe(takeUntil(this.destroy$)).subscribe(responses => {
      for (const [label, response] of Object.entries(responses)) {
        if (!response || ![200, 204].includes(Number(response.responseCode))) this.masterErrors.push(`${label}: ${response?.responseMessage || 'Unable to load. Please retry.'}`);
      }
      this.exams = this.rows(responses.exams); this.grades = this.rows(responses.grades);
      this.students = this.rows(responses.students); this.invoiceHeader = this.rows(responses.school)[0] || null;
      if (!this.invoiceHeader) this.masterErrors.push('School details are missing. Configure the school header before downloading.');
      this.isMastersLoading = false;
    });
  }
  listExams(): any[] { return this.exams.filter(exam => this.year(exam.academicYear) === this.year(this.selectedAcademicYear)); }
  private gradeStudents(): any[] {
    const grade = this.grades.find(item => Number(item.id) === Number(this.selectedGradeId));
    const names = [grade?.gradeName, grade?.gradeCode].map(value => this.gradeKey(value)).filter(Boolean);
    return this.students.filter(student => student.studentAcademicId
      && this.year(student.sessionName) === this.year(this.selectedAcademicYear)
      && !['INACTIVE', 'LEFT', 'WITHDRAWN', 'REMOVED'].includes(String(student.status || '').toUpperCase())
      && (!this.selectedGradeId || (student.gradeId != null ? Number(student.gradeId) === Number(this.selectedGradeId) : names.includes(this.gradeKey(student.grade)))));
  }
  listSections(): string[] { return [...new Set(this.gradeStudents().map(student => String(student.gradeSection || '').trim()).filter(Boolean))].sort(); }
  listStudents(): any[] { return this.gradeStudents().filter(student => !this.selectedSection || String(student.gradeSection || '').trim() === this.selectedSection); }
  studentName(student: any): string { return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.studentName || 'Student'; }
  onSessionChange(): void { this.selectedExamId = null; this.selectedGradeId = null; this.onGradeChange(); }
  onGradeChange(): void { this.selectedSection = ''; this.selectedStudentId = null; this.invalidate(); }
  onSectionChange(): void { this.selectedStudentId = null; this.invalidate(); }
  invalidate(): void { this.loadVersion++; this.isLoading = false; this.hasSearched = false; this.fullData = []; this.previewCard = null; this.errorMessage = ''; this.skip = 0; this.applyPagination(); }
  clearFilters(): void { this.selectedAcademicYear = this.currentSession(); this.onSessionChange(); }
  private filters(): AdmitCardFilters { return {academicYear: this.selectedAcademicYear, examId: this.selectedExamId, gradeId: this.selectedGradeId, section: this.selectedSection, studentAcademicId: this.selectedStudentId}; }
  get canSearch(): boolean { return !!this.selectedAcademicYear && !!this.selectedExamId && !!this.selectedGradeId && !this.isMastersLoading && !this.masterErrors.length; }
  getAdmitCards(): void {
    if (!this.canSearch || this.isLoading || this.isDownloading) return;
    this.invalidate(); this.isLoading = true; const version = this.loadVersion;
    this.service.getAdmitCards(this.filters()).pipe(timeout(60000), takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (version !== this.loadVersion) return;
        this.isLoading = false; this.hasSearched = true;
        if (![200, 204].includes(Number(response?.responseCode))) { this.errorMessage = response?.responseMessage || 'Unable to load admit cards.'; return; }
        const seen = new Set<number>();
        this.fullData = this.rows(response).filter(card => {
          const id = Number(card.studentAcademicId); if (!id || seen.has(id)) return false; seen.add(id); return true;
        }).sort((a, b) => String(a.rollNumber || '').localeCompare(String(b.rollNumber || ''), undefined, {numeric: true}));
        this.applyPagination();
      },
      error: error => { if (version === this.loadVersion) { this.isLoading = false; this.hasSearched = true; this.errorMessage = error?.error?.responseMessage || 'Unable to load admit cards. Please retry.'; } }
    });
  }
  async downloadCards(card?: any): Promise<void> {
    if (this.isDownloading || this.isLoading || !this.invoiceHeader) return;
    const cards = card ? [card] : [...this.fullData]; if (!cards.length) return;
    if (cards.some(item => !item.subjects?.length)) { this.toast('Unable to download', 'An admit card has no exam timetable. Reload the list.', 'error'); return; }
    this.isDownloading = true; this.downloadProgress = 'Preparing PDF…';
    let frame: HTMLIFrameElement | undefined;
    try {
      const [{jsPDF}, {default: html2canvas}] = await Promise.all([import('jspdf'), import('html2canvas')]);
      if (this.destroyed) return;
      const pdf = new jsPDF({orientation: 'landscape', unit: 'mm', format: 'a4', compress: true});
      frame = document.createElement('iframe'); frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1240px;height:950px;border:0;pointer-events:none';
      document.body.appendChild(frame); const doc = frame.contentDocument;
      if (!doc) throw new Error('Unable to prepare PDF pages.');
      doc.open(); doc.write(`<!doctype html><html><head>${this.pdfStyles()}</head><body></body></html>`); doc.close();
      for (let index = 0; index < cards.length; index++) {
        if (this.destroyed) return;
        this.downloadProgress = `Preparing ${index + 1} of ${cards.length}…`; doc.body.innerHTML = this.cardHtml(cards[index]);
        await Promise.all(Array.from(doc.images).map(img => new Promise<void>(resolve => {
          if (img.complete) { resolve(); return; }
          const timer = setTimeout(() => { img.onload = img.onerror = null; img.removeAttribute('src'); resolve(); }, 10000);
          img.onload = img.onerror = () => { clearTimeout(timer); resolve(); };
        })));
        if (this.destroyed) return;
        const canvas = await html2canvas(doc.querySelector('.admit-sheet') as HTMLElement, {scale: 1.5, useCORS: true, backgroundColor: '#ffffff', logging: false});
        const width = Math.min(283, canvas.width * 204 / canvas.height); const height = canvas.height * width / canvas.width;
        if (index) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', (297 - width) / 2, 3, width, height); canvas.width = canvas.height = 0;
      }
      if (!this.destroyed) {
        const first = cards[0];
        const name = `Admit_Card_${first.examName}_${first.academicYear}_${first.grade}_${card ? first.studentName : this.selectedSection || 'All_Sections'}`.replace(/[^a-zA-Z0-9_-]+/g, '_');
        this.savePdf(pdf, `${name}.pdf`); this.toast('PDF downloaded', `${cards.length} admit card(s), one student per page.`, 'success');
      }
    } catch (error: any) { if (!this.destroyed) this.toast('Unable to download', error?.message || 'Please retry.', 'error'); }
    finally { frame?.remove(); this.isDownloading = false; this.downloadProgress = ''; }
  }
  get emptyStateMessage(): string {
    return this.errorMessage || (this.hasSearched ? 'No matching students found. Try another section or student, then view the list again.'
      : 'Choose a session, exam and grade, then tap View List to find admit cards.');
  }
  studentPhoto(card: any): string { return this.imageUrl(card.studentPicture, 'student') || 'assets/img/profiles/avatar-02.jpg'; }
  useDefaultStudentImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith('/assets/img/profiles/avatar-02.jpg')) image.src = 'assets/img/profiles/avatar-02.jpg';
  }
  showTimetable(card: any): void {
    this.previewCard = card;
    requestAnimationFrame(() => {
      if (this.destroyed) return;
      const preview = document.getElementById('admit-timetable-preview');
      preview?.focus({preventScroll: true});
      preview?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    });
  }
  private savePdf(pdf: import('jspdf').jsPDF, filename: string): void { pdf.save(filename); }
  dateLabel(value: any): string {
    if (!value) return '—'; const date = String(value).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('-') : date;
  }
  private cardHtml(card: any): string {
    const school = this.invoiceHeader;
    const schoolName = [school.companyFirstName, school.companyLastName].filter(Boolean).join(' ') || 'School';
    const logo = this.imageUrl(school.companyLogo, 'school');
    const photo = this.imageUrl(card.studentPicture, 'student');
    const stamp = this.imageUrl(school.companyStamp, 'school');
    const address = [school.regAddress, school.officeAddress].map(value => String(value || '').trim()).find(Boolean) || '';
    const phone = [school.mobileNo, school.alternateMobile].map(value => String(value || '').trim()).filter(Boolean).join(' / ');
    const schoolIdentifiers = [
      {label: 'School Number', value: school.panNumber},
      {label: 'Affiliation Number', value: school.gstNumber}
    ].map(item => ({...item, value: String(item.value || '').trim()})).filter(item => item.value)
      .map(item => `<span><strong>${item.label}:</strong> ${this.escape(item.value)}</span>`).join('<span aria-hidden="true"> | </span>');
    const contacts = [school.emailId ? `Email: ${school.emailId}` : '', school.website ? `Website: ${school.website}` : ''].filter(Boolean).join(' | ');
    const thankYouNote = new DOMParser().parseFromString(String(school.thankYouNote || ''), 'text/html').body.textContent?.trim() || '';
    const details = (rows: any[][]) => rows.map(([label, value]) => `<tr><th>${this.escape(label)}</th><td class="colon">:</td><td>${this.escape(value || '—')}</td></tr>`).join('');
    const left = details([['Student Name', card.studentName], ["Father’s Name", card.fatherName], ["Mother’s Name", card.motherName], ['Class', card.grade], ['Section', card.section]]);
    const right = details([['Roll No.', card.rollNumber], ['Admission No.', card.admissionNo], ['Exam Type', card.examName], ['Academic Session', card.academicYear], ['Date of Birth', this.dateLabel(card.dob)]]);
    const notes = [...new Set<string>(card.subjects.map((subject: any) => String(subject.instructions || '').trim()).filter(Boolean))];
    const instructions = ['Carry this Admit Card to the examination hall on all exam days.', 'Reach the examination centre at least 30 minutes before the commencement of the exam.', 'Do not carry any electronic or prohibited items to the examination hall.', 'Follow all instructions given by the invigilator.', ...notes];
    return `<main class="admit-sheet">
      <header class="school-header"><div class="school-brand">${logo ? `<img class="logo" src="${this.escape(logo)}" alt="School logo">` : ''}<div class="school-info"><h1>${this.escape(schoolName)}</h1>${address ? `<p class="school-address"><strong>Address:</strong> ${this.escape(address)}</p>` : ''}${phone ? `<p class="school-phone"><strong>Phone:</strong> ${this.escape(phone)}</p>` : ''}${schoolIdentifiers ? `<p class="school-identifiers">${schoolIdentifiers}</p>` : ''}${contacts ? `<p class="school-contact">${this.escape(contacts)}</p>` : ''}${thankYouNote ? `<p class="school-thanks">${this.escape(thankYouNote)}</p>` : ''}</div></div><div class="exam-ribbon">${this.escape(card.examName)}<span>Session ${this.escape(card.academicYear)}</span></div></header>
      <section class="card-body"><h2 class="card-title">EXAMINATION ADMIT CARD</h2>
      <section class="student-panel"><div class="student-details"><table><tbody>${left}</tbody></table><table><tbody>${right}</tbody></table></div><aside class="student-photo">${photo ? `<img src="${this.escape(photo)}" alt="Student photo">` : '<div class="photo-placeholder">Student Photo</div>'}</aside></section>
      <h3 class="schedule-title">EXAMINATION SCHEDULE</h3><div class="schedule-border"><table class="schedule"><thead><tr><th>Date</th><th>Subject</th><th>Room No.</th><th>Time</th><th>Duration</th></tr></thead><tbody>${card.subjects.map((subject: any) => `<tr><td>${this.escape(this.dateLabel(subject.examDate))}</td><td>${this.escape(subject.subjectName)}</td><td>${this.escape(subject.roomNumber || '—')}</td><td>${this.escape(this.examTime(subject.startTime))} – ${this.escape(this.examTime(subject.endTime))}</td><td>${this.escape(this.examDuration(subject.startTime, subject.endTime))}</td></tr>`).join('')}</tbody></table></div>
      <section class="bottom-panel"><div class="instructions"><h3>Instructions:</h3><ul>${instructions.map(note => `<li>${this.escape(note)}</li>`).join('')}</ul><div class="identity"><span>Admission No.</span><strong>${this.escape(card.admissionNo || card.rollNumber || card.studentAcademicId)}</strong></div></div><div class="authorisation"><div class="seal">${stamp ? `<img src="${this.escape(stamp)}" alt="School seal">` : '<div class="seal-placeholder">School Seal</div>'}</div><div class="principal"><div class="signature-space"></div><strong>Principal</strong><span>${this.escape(schoolName)}</span></div></div></section>
      </section><div class="bottom-wave" aria-hidden="true"></div></main>`;
  }
  private timeMinutes(value: any): number | null {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(String(value || '').trim());
    if (!match) return null;
    let hour = Number(match[1]); const minute = Number(match[2]);
    if (minute > 59 || hour > (match[3] ? 12 : 23) || (match[3] && hour < 1)) return null;
    if (match[3]) hour = hour % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    return hour * 60 + minute;
  }
  private examTime(value: any): string {
    const minutes = this.timeMinutes(value); if (minutes === null) return String(value || '—');
    const hour = Math.floor(minutes / 60);
    return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  }
  private examDuration(start: any, end: any): string {
    const from = this.timeMinutes(start); const to = this.timeMinutes(end);
    if (from === null || to === null || to <= from) return '—';
    const duration = to - from; const hours = Math.floor(duration / 60); const minutes = duration % 60;
    return [hours ? `${hours} ${hours === 1 ? 'Hour' : 'Hours'}` : '', minutes ? `${minutes} Min` : ''].filter(Boolean).join(' ');
  }
  private pdfStyles(): string { return `<style>
    *{box-sizing:border-box}body{margin:0;background:#fff;color:#101828;font-family:Arial,sans-serif}
    .admit-sheet{position:relative;width:1240px;min-height:${1240 * 204 / 283}px;border:3px solid #1454a0;border-radius:17px;overflow:hidden;background:linear-gradient(135deg,#fafdff,#fff 48%,#f8fbff);padding:0 0 16px;display:flex;flex-direction:column}
    .school-header{position:relative;display:flex;align-items:stretch;min-height:100px;border-bottom:1px solid #83b2df;background:linear-gradient(150deg,#fff 65%,#c9e8ff 65%,#90c6f3 84%,#1c64ac 84%)}
    .school-brand{display:flex;align-items:center;gap:16px;flex:1;min-width:0;padding:12px 20px}.logo{width:82px;height:82px;object-fit:contain;flex-shrink:0}.school-info{flex:1;min-width:0;text-align:center}.school-info h1{font-size:36px;line-height:1.08;color:#062651;margin:0 0 7px;font-weight:800;overflow-wrap:anywhere}.school-info p{font-size:19px;line-height:1.4;margin:5px 0;white-space:pre-line;overflow-wrap:anywhere}.school-info .school-phone{color:#073b78;font-weight:600}.school-info .school-identifiers{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 6px;font-size:17px}.school-info .school-thanks{color:#073b78;font-style:italic;font-size:17px}.school-info .school-contact{font-size:17px;line-height:1.5;color:#253858;font-weight:500}
    .exam-ribbon{align-self:flex-end;position:relative;background:linear-gradient(110deg,#073d7b,#1556a0);border-radius:65px 0 0 0;color:#fff;width:285px;flex-shrink:0;text-align:center;padding:22px 12px 15px 28px;font-size:21px;font-weight:700;overflow-wrap:anywhere}.exam-ribbon span{display:block;font-size:16px;margin-top:6px;font-weight:400}
    .card-body{position:relative;z-index:1;padding:12px 22px 0;display:flex;flex-direction:column;flex:1}.card-title{align-self:center;color:#fff;background:linear-gradient(#07497d,#062c59);border:1px solid #123d70;border-radius:14px;font-size:26px;font-weight:800;letter-spacing:.5px;line-height:1.2;text-align:center;padding:7px 30px;margin:0 0 10px}
    .student-panel{display:flex;align-items:stretch;gap:16px;margin-bottom:10px}.student-details{display:flex;flex:1;min-width:0;border:1px solid #7896bb;border-radius:9px;padding:8px 10px}.student-details table{width:50%;border-collapse:collapse;table-layout:fixed}.student-details table+table{border-left:1px solid #8f9fb3}.student-details th,.student-details td{font-size:21px;line-height:1.35;padding:4px 6px;vertical-align:top;overflow-wrap:anywhere}.student-details th{text-align:left;width:40%;font-weight:600}.student-details td{font-weight:700}.student-details .colon{width:14px;padding-left:0;padding-right:0}.student-details table+table th{padding-left:14px;width:44%}.student-photo{width:142px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid #a9bbcf;border-radius:3px;background:#edf5fc;overflow:hidden}.student-photo img{width:140px;height:145px;object-fit:contain}.photo-placeholder{width:140px;min-height:145px;display:flex;align-items:center;justify-content:center;color:#718096;font-size:13px}
    .schedule-title{background:linear-gradient(90deg,#d1ebff,#aed5f9);color:#062b60;border-radius:9px;font-size:23px;line-height:1.2;text-align:center;font-weight:800;margin:0 0 6px;padding:4px}.schedule-border{border:1px solid #7388a8;border-radius:0 0 9px 9px;overflow:hidden}.schedule{width:100%;border-collapse:collapse;table-layout:fixed}.schedule th{background:linear-gradient(#274b82,#1c376b);color:#fff;font-size:21px;font-weight:700;padding:8px}.schedule td{padding:8px 6px;font-size:20px;line-height:1.3;text-align:center;overflow-wrap:anywhere}.schedule th,.schedule td{border-right:1px solid #91a0b7;border-bottom:1px solid #91a0b7}.schedule tr:last-child td{border-bottom:0}.schedule th:last-child,.schedule td:last-child{border-right:0}.schedule th:nth-child(1){width:17%}.schedule th:nth-child(2){width:28%}.schedule th:nth-child(3){width:12%}.schedule th:nth-child(4){width:27%}.schedule th:nth-child(5){width:16%}.schedule small{display:block;color:#667085;font-size:11px;margin-top:2px}
    .bottom-panel{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex:1;padding-top:10px}.instructions{flex:1;min-width:0;align-self:flex-start}.instructions h3{font-size:20px;color:#062b60;margin:0 0 3px}.instructions ul{font-size:18px;line-height:1.45;padding-left:20px;margin:0}.instructions li{white-space:pre-line;overflow-wrap:anywhere;margin-bottom:2px}.identity{display:inline-flex;flex-direction:column;align-items:center;border:1px solid #c7d9eb;border-radius:6px;background:#fff;padding:6px 24px;margin:12px 0 0 20px;max-width:95%}.identity span{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#667085}.identity strong{font-size:17px;letter-spacing:1px;overflow-wrap:anywhere}
    .authorisation{display:flex;align-items:center;width:340px;flex-shrink:0;padding:10px 0 3px}.seal{width:116px;padding-right:14px;flex-shrink:0}.seal img{width:96px;height:96px;object-fit:contain}.seal-placeholder{border:1px dashed #91a8c6;border-radius:50%;width:96px;height:96px;display:flex;align-items:center;justify-content:center;color:#6c819c;font-size:12px}.principal{border-left:1px solid #7c96b8;min-height:96px;flex:1;text-align:center;padding:0 10px}.signature-space{height:38px;border-bottom:1px solid #70839e;margin:0 12px 8px}.principal strong{display:block;color:#0a2044;font-size:18px}.principal span{display:block;font-size:16px;margin-top:5px;overflow-wrap:anywhere}.bottom-wave{position:absolute;bottom:0;left:0;right:0;height:75px;background:linear-gradient(32deg,#acd5fa 5%,transparent 5%),linear-gradient(25deg,#d7edff 12%,transparent 12%),linear-gradient(333deg,#b8ddff 7%,transparent 7%),linear-gradient(340deg,#e2f2ff 17%,transparent 17%);pointer-events:none}
    </style>`; }

  private imageUrl(value: any, type: 'school' | 'student'): string {
    const image = String(value || '').trim(); if (!image) return '';
    if (/^(data:image\/|blob:|https?:)/i.test(image)) return image;
    if (image.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(image)) return `data:image/png;base64,${image}`;
    const user = this.authentication.getLoginUser();
    return type === 'school' ? this.media.receiptPicture(user?.service, user?.superadminId, image) : this.media.studentPicture(user?.service, user?.superadminId, image);
  }
  private escape(value: any): string { return String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[char] || char)); }
  private year(value: any): string { return String(value || '').trim().replace(/\//g, '-').replace(/\s/g, ''); }
  private gradeKey(value: any): string { return String(value || '').toLowerCase().replace(/grade|class/g, '').replace(/[^a-z0-9]/g, ''); }
  private rows(response: any): any[] { const rows = response?.listPayload ?? response?.payload ?? response?.data; return Array.isArray(rows) ? rows : []; }
  private applyPagination(): void {
    this.totalData = this.fullData.length; if (this.skip >= this.totalData) this.skip = 0;
    this.tableData = this.fullData.slice(this.skip, this.skip + this.pageSize); this.serialNumberArray = this.tableData.map((_, index) => this.skip + index + 1);
    this.pagination.calculatePageSize.next({totalData: this.totalData, pageSize: this.pageSize, tableData: this.tableData, serialNumberArray: this.serialNumberArray});
  }
  private toast(summary: string, detail: string, severity: 'success' | 'error'): void { this.messages.add({summary, detail, severity}); }
}
