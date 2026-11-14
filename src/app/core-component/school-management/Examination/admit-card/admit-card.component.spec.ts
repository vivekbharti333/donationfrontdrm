import { of, Subject } from 'rxjs';
import { AdmitCardComponent } from './admit-card.component';

describe('AdmitCardComponent', () => {
  let component: AdmitCardComponent;
  let service: any;
  beforeEach(() => {
    service = {getAdmitCards: jasmine.createSpy().and.returnValue(of({responseCode: 200, listPayload: []}))};
    component = new AdmitCardComponent(service, {calculatePageSize: {next: () => {}}} as any,
      {} as any, {add: () => {}} as any, {getLoginUser: () => ({})} as any, {} as any);
    component.selectedAcademicYear = '2026-27'; component.selectedExamId = 7; component.selectedGradeId = 3;
    component.grades = [{id: 3, gradeName: 'Nursery', gradeCode: 'NUR'}];
    component.invoiceHeader = {companyFirstName: 'School', regAddress: 'School Road', mobileNo: '12345'};
  });
  afterEach(() => component.ngOnDestroy());
  const card = (id: number) => ({studentAcademicId: id, studentName: `Student ${id}`, grade: 'Nursery', section: 'A',
    examId: 7, examName: 'Annual', academicYear: '2026-27', subjects: [{subjectName: 'English', examDate: '2026-11-20', startTime: '09:00', endTime: '10:00'}]});
  it('cascades session, grade, section and student using academic identity', () => {
    component.students = [
      {studentAcademicId: 11, grade: 'Nursery', gradeSection: 'A', sessionName: '2026-27'},
      {studentAcademicId: 12, grade: 'NUR', gradeSection: 'B', sessionName: '2026-27'},
      {studentAcademicId: 13, grade: '3', gradeSection: 'A', sessionName: '2026-27'},
      {studentAcademicId: 14, grade: 'Nursery', gradeSection: 'A', sessionName: '2025-26'},
      {studentAcademicId: 15, grade: 'Nursery', gradeSection: 'A', sessionName: '2026-27', status: 'LEFT'}
    ];
    expect(component.listSections()).toEqual(['A', 'B']); component.selectedSection = 'B';
    expect(component.listStudents().map(student => student.studentAcademicId)).toEqual([12]);
    component.selectedStudentId = 12; component.onGradeChange();
    expect(component.selectedSection).toBe(''); expect(component.selectedStudentId).toBeNull();
    component.onSessionChange(); expect(component.selectedExamId).toBeNull(); expect(component.selectedGradeId).toBeNull();
  });
  it('does not request a list without session, exam and grade', () => {
    component.selectedGradeId = null; component.getAdmitCards(); expect(service.getAdmitCards).not.toHaveBeenCalled();
  });
  it('uses every selected filter and ignores stale responses after a filter change', () => {
    const pending = new Subject<any>(); service.getAdmitCards.and.returnValue(pending);
    component.selectedSection = 'A'; component.selectedStudentId = 11; component.getAdmitCards();
    expect(service.getAdmitCards).toHaveBeenCalledWith({academicYear: '2026-27', examId: 7, gradeId: 3, section: 'A', studentAcademicId: 11});
    component.onGradeChange(); pending.next({responseCode: 200, listPayload: [card(11)]});
    expect(component.fullData).toEqual([]); expect(component.isLoading).toBeFalse();
  });
  it('shows backend errors and removes duplicate academic records', () => {
    service.getAdmitCards.and.returnValue(of({responseCode: 400, responseMessage: 'No timetable'})); component.getAdmitCards();
    expect(component.errorMessage).toBe('No timetable');
    service.getAdmitCards.and.returnValue(of({responseCode: 200, listPayload: [card(11), card(11)]})); component.getAdmitCards();
    expect(component.fullData.length).toBe(1);
  });
  it('downloads all filtered students beyond the current table page and one page individually', async () => {
    let pages = 0;
    const save = spyOn<any>(component, 'savePdf').and.callFake((pdf: any) => { pages = pdf.getNumberOfPages(); });
    component.fullData = [card(11), card(12)]; component.tableData = [card(11)];
    await component.downloadCards(); expect(pages).toBe(2); expect(save).toHaveBeenCalledTimes(1);
    await component.downloadCards(card(12)); expect(pages).toBe(1); expect(save).toHaveBeenCalledTimes(2);
    expect(component.isDownloading).toBeFalse(); expect(component.downloadProgress).toBe('');
    expect(document.querySelector('iframe[aria-hidden="true"]')).toBeNull();
  }, 30000);
  it('escapes names and instructions in the PDF and includes school and timetable details', () => {
    const student = card(11); student.studentName = '<script>alert(1)</script>';
    const html = (component as any).cardHtml(student);
    expect(html).toContain('&lt;script&gt;'); expect(html).not.toContain('<script>');
    expect(html).toContain('School Road'); expect(html).toContain('English'); expect(html).toContain('20-11-2026'); expect(html).toContain('09:00');
    expect(html).not.toContain('<th>Day</th>'); expect(html).not.toContain('Friday');
    expect(html).toContain('<th>Duration</th>'); expect(html).toContain('1 Hour');
    expect(html).toContain('09:00 AM'); expect(html).toContain('10:00 AM');
    expect(html).not.toContain('subjectCode');
  });
  it('formats timetable times and calculates durations without inventing missing values', () => {
    expect((component as any).examTime('13:30')).toBe('01:30 PM');
    expect((component as any).examTime('00:00')).toBe('12:00 AM');
    expect((component as any).examDuration('09:00', '12:00')).toBe('3 Hours');
    expect((component as any).examDuration('09:00 AM', '10:30 AM')).toBe('1 Hour 30 Min');
    expect((component as any).examDuration('', '12:00')).toBe('—');
    expect((component as any).examDuration('12:00', '09:00')).toBe('—');
  });
  it('refuses a PDF with missing timetable data', async () => {
    const save = spyOn<any>(component, 'savePdf'); component.fullData = [{studentAcademicId: 11, subjects: []}];
    await component.downloadCards(); expect(save).not.toHaveBeenCalled(); expect(component.isDownloading).toBeFalse();
  });
});
