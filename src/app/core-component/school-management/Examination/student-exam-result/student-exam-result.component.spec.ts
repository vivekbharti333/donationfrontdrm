import { NEVER, of, throwError } from 'rxjs';
import { StudentExamResultComponent } from './student-exam-result.component';

describe('StudentExamResultComponent loading', () => {
  let component: StudentExamResultComponent;
  let service: any;
  beforeEach(() => {
    service = {
      getExamDetails: jasmine.createSpy().and.returnValue(of({responseCode: 200, listPayload: [{id: 7}]})),
      getStudentAcademicDetails: jasmine.createSpy().and.returnValue(of({responseCode: 200, listPayload: [{id: 12}]})),
      getExamSchedule: () => NEVER, getExamGradeSubject: () => of(null),
      getExamSubject: () => of(null), getGradeDetails: () => of(null), getInvoiceHeaderList: () => of(null),
      getStudentExamResult: jasmine.createSpy().and.returnValue(of({responseCode: 500, responseMessage: 'Result query failed'}))
    };
    component = new StudentExamResultComponent(service, {calculatePageSize: {next: () => {}}} as any,
      {} as any, {add: () => {}} as any, {} as any, {} as any);
  });
  afterEach(() => component.ngOnDestroy());
  it('loads exam and student choices without waiting for report resources', () => {
    component.loadMasters();
    expect(component.exams).toEqual([{id: 7}]);
    expect(component.students).toEqual([{id: 12}]);
    expect(component.isMastersLoading).toBeFalse();
  });
  it('shows transport failures and allows retrying the lists', () => {
    service.getExamDetails.and.returnValue(throwError(() => ({error: {responseMessage: 'Sign in again'}})));
    component.loadMasters();
    expect(component.masterErrors).toEqual(['Exams: Sign in again']);
    expect(component.students.length).toBe(1);
    expect(component.isMastersLoading).toBeFalse();
    service.getExamDetails.and.returnValue(of({responseCode: 200, listPayload: [{id: 7}]}));
    component.loadMasters();
    expect(component.masterErrors).toEqual([]);
    expect(component.exams.length).toBe(1);
  });
  it('resolves result students by academic record rather than main student id', () => {
    component.students = [{id: 12, studentAcademicId: 34, firstName: 'Aditya', rollNumber: '24'}];
    component.selectedStudentId = 34;
    component.selectedExamId = 7;
    service.generateStudentExamResult = jasmine.createSpy().and.returnValue(of({responseCode: 200}));
    component.generateSelected();
    expect(service.generateStudentExamResult).toHaveBeenCalledWith(7, 34);
    expect(component.studentName(34)).toBe('Aditya');
    expect(component.studentRoll(34)).toBe('24');
    expect(component.selectedStudentLabel()).toBe('Aditya · 24');
    expect(component.studentName(12)).toBe('Student #12');
  });
  it('shows only students in the exam session and scheduled classes, without matching grade ids as class names', () => {
    component.exams = [{id: 7, academicYear: '2026-27'}];
    component.selectedExamId = 7;
    component.schedules = [{examId: 7, examGradeSubjectId: 10}];
    component.mappings = [{id: 10, gradeId: 3}];
    component.grades = [{id: 3, gradeName: 'Nursery', gradeCode: 'NUR'}];
    component.students = [
      {id: 1, studentAcademicId: 11, grade: 'Nursery', sessionName: '2026-27'},
      {id: 2, studentAcademicId: 12, grade: '3', sessionName: '2026-27'},
      {id: 3, studentAcademicId: 13, grade: 'Nursery', sessionName: '2025-26'},
      {id: 4, studentAcademicId: 14, grade: 'Nursery', sessionName: '2026-27', status: 'LEFT'}
    ];
    expect(component.availableStudents().map(student => student.studentAcademicId)).toEqual([11]);
    component.onExamChange(null);
    expect(component.availableStudents()).toEqual([]);
    expect(component.selectedStudentId).toBeNull();
  });
  it('loads filter options without waiting for the receipt logo', () => {
    service.getExamSchedule = () => of({responseCode: 200, listPayload: [{examId: 7}]});
    service.getExamGradeSubject = service.getExamSubject = service.getGradeDetails = () => of({responseCode: 204});
    service.getInvoiceHeaderList = () => NEVER;
    component.loadMasters();
    expect(component.selectedExamId).toBeNull();
    expect(component.isResultOptionsLoading).toBeFalse();
  });
  it('clears student and publication filters after bulk generation so all generated results are visible', () => {
    component.selectedExamId = 7;
    component.selectedStudentId = 12;
    component.selectedPublished = true;
    service.generateExamResults = jasmine.createSpy().and.returnValue(of({responseCode: 200}));
    component.generateAll();
    expect(service.generateExamResults).toHaveBeenCalledWith(7);
    expect(service.getStudentExamResult).toHaveBeenCalledWith({examId: 7, studentAcademicId: null, published: ''});
  });
  it('cascades academic year, grade, section and student filters', () => {
    component.exams = [{id: 7, academicYear: '2026-27'}, {id: 8, academicYear: '2025-26'}];
    component.selectedAcademicYear = '2026-27';
    component.grades = [{id: 3, gradeName: 'Nursery'}, {id: 4, gradeName: '4'}];
    component.students = [
      {studentAcademicId: 11, sessionName: '2026-27', grade: 'Nursery', gradeSection: 'A'},
      {studentAcademicId: 12, sessionName: '2026-27', grade: 'Nursery', gradeSection: 'B'},
      {studentAcademicId: 13, sessionName: '2025-26', grade: 'Nursery', gradeSection: 'A'},
      {studentAcademicId: 14, sessionName: '2026-27', grade: '4', gradeSection: 'A'}
    ];
    expect(component.listExams().map(exam => exam.id)).toEqual([7]);
    component.selectedGradeId = 3;
    expect(component.listSections()).toEqual(['A', 'B']);
    component.selectedSection = 'B';
    expect(component.listStudents().map(student => student.studentAcademicId)).toEqual([12]);
    service.getStudentExamResult.and.returnValue(of({responseCode: 200, listPayload: [
      {examId: 7, studentAcademicId: 11}, {examId: 7, studentAcademicId: 12}, {examId: 8, studentAcademicId: 13}
    ]}));
    component.getResults();
    expect(component.fullData.map(row => row.studentAcademicId)).toEqual([12]);
    component.selectedStudentId = 12;
    component.onListGradeChange();
    expect(component.selectedSection).toBe('');
    expect(component.selectedStudentId).toBeNull();
    component.onListAcademicYearChange();
    expect(component.selectedExamId).toBeNull();
    expect(component.selectedGradeId).toBeNull();
  });
  it('enables generation for a single filtered exam while retaining all-exam list filtering', () => {
    component.selectedAcademicYear = '2026-27';
    component.exams = [{id: 7, academicYear: '2026-27'}];
    expect(component.selectedExamId).toBeNull();
    expect(component.generationExamId).toBe(7);
    service.generateExamResults = jasmine.createSpy().and.returnValue(of({responseCode: 200}));
    component.generateAll();
    expect(service.generateExamResults).toHaveBeenCalledWith(7);
    component.selectedExamId = null;
    component.exams.push({id: 8, academicYear: '2026-27'});
    expect(component.generationExamId).toBeNull();
  });
  it('labels absent subjects separately from failed present subjects', () => {
    component.schedules = [{id: 1, passingMarks: 33}, {id: 2, passingMarks: 33}, {id: 3, passingMarks: 33}];
    expect((component as any).subjectResult({examScheduleId: 1, attendanceStatus: 'ABSENT', marksObtained: null})).toBe('Absent');
    expect((component as any).subjectResult({examScheduleId: 2, attendanceStatus: 'PRESENT', marksObtained: 20})).toBe('Fail');
    expect((component as any).subjectResult({examScheduleId: 3, attendanceStatus: 'PRESENT', marksObtained: 80})).toBe('Pass');
  });
  it('shows ranks only for pass results, including old records with failed ranks', () => {
    expect(component.rankLabel({resultStatus: 'FAIL', studentRank: 1})).toBe('—');
    expect(component.rankLabel({resultStatus: 'PASS', studentRank: 2})).toBe('2');
    expect(component.rankLabel({resultStatus: 'PASS', studentRank: null})).toBe('—');
  });
  it('does not hide API errors as an empty result list', () => {
    component.getResults();
    expect(component.errorMessage).toBe('Result query failed');
    expect(component.isLoading).toBeFalse();
  });
  it('requires a grade before requesting a bulk PDF', async () => {
    component.selectedExamId = 7;
    await component.downloadBulkResults();
    expect(service.getStudentExamResult).not.toHaveBeenCalled();
    expect(component.isBulkDownloading).toBeFalse();
  });
  it('requests all exam results and excludes other grades, sections and exams from a bulk download', async () => {
    component.isResultOptionsLoading = false;
    component.selectedExamId = 7;
    component.selectedGradeId = 3;
    component.selectedSection = 'A';
    component.selectedStudentId = 99;
    component.selectedPublished = true;
    component.selectedAcademicYear = '2026-27';
    component.students = [
      {studentAcademicId: 11, gradeId: 3, gradeSection: 'A', sessionName: '2026-27'},
      {studentAcademicId: 12, gradeId: 3, gradeSection: 'B', sessionName: '2026-27'},
      {studentAcademicId: 13, gradeId: 4, gradeSection: 'A', sessionName: '2026-27'}
    ];
    service.getStudentExamResult.and.returnValue(of({responseCode: 200, listPayload: [
      {examId: 8, studentAcademicId: 11}, {examId: 7, studentAcademicId: 12}, {examId: 7, studentAcademicId: 13}
    ]}));
    const toast = spyOn<any>(component, 'toast');
    await component.downloadBulkResults();
    expect(service.getStudentExamResult).toHaveBeenCalledWith({examId: 7});
    expect(toast).toHaveBeenCalledWith('Unable to download results', jasmine.stringMatching('No generated results'), 'error');
    expect(component.isBulkDownloading).toBeFalse();
    expect(component.bulkDownloadProgress).toBe('');
  });
  it('creates one PDF page per matching student across the full grade without duplicate results', async () => {
    let pageCount = 0;
    const save = spyOn<any>(component, 'saveBulkPdf').and.callFake((pdf: any) => {
      pageCount = pdf.getNumberOfPages();
    });
    component.isResultOptionsLoading = false;
    component.selectedAcademicYear = '2026-27';
    component.selectedExamId = 7;
    component.selectedGradeId = 3;
    component.selectedStudentId = 11;
    component.selectedPublished = true;
    component.exams = [{id: 7, examName: 'Annual', academicYear: '2026-27'}];
    component.students = [
      {studentAcademicId: 11, gradeId: 3, gradeSection: 'A', sessionName: '2026-27'},
      {studentAcademicId: 12, gradeId: 3, gradeSection: 'B', sessionName: '2026-27'},
      {studentAcademicId: 13, gradeId: 4, gradeSection: 'A', sessionName: '2026-27'}
    ];
    service.getStudentExamResult.and.returnValue(of({responseCode: 200, listPayload: [
      {examId: 7, studentAcademicId: 11}, {examId: 7, studentAcademicId: 12},
      {examId: 7, studentAcademicId: 11}, {examId: 7, studentAcademicId: 13}
    ]}));
    service.getStudentExamMarks = jasmine.createSpy().and.returnValue(of({responseCode: 200,
      listPayload: [{examScheduleId: 1, marksObtained: 80, attendanceStatus: 'PRESENT'}]}));
    await component.downloadBulkResults();
    expect(save).toHaveBeenCalledTimes(1);
    expect(pageCount).toBe(2);
    expect(service.getStudentExamMarks).toHaveBeenCalledTimes(2);
    expect(component.isBulkDownloading).toBeFalse();
    expect(document.querySelector('iframe[aria-hidden="true"]')).toBeNull();
  }, 30000);
  it('prevents duplicate bulk requests and clears progress after server failure', async () => {
    component.isBulkDownloading = true;
    await component.downloadBulkResults();
    expect(service.getStudentExamResult).not.toHaveBeenCalled();
    component.isBulkDownloading = false;
    component.isResultOptionsLoading = false;
    component.selectedExamId = 7;
    component.selectedGradeId = 3;
    await component.downloadBulkResults();
    expect(component.isBulkDownloading).toBeFalse();
    expect(component.bulkDownloadProgress).toBe('');
  });
});
