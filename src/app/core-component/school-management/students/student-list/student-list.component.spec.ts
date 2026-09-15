import { FormBuilder } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { StudentListComponent } from './student-list.component';

describe('StudentListComponent academic popup', () => {
  let component: StudentListComponent;
  let service: any;
  const academic = { id: 91, studentId: 7, sessionName: '2025-26', grade: 'One', gradeSection: 'B', rollNumber: '18', status: 'PROMOTED' };
  beforeEach(() => {
    service = jasmine.createSpyObj('SchoolManagementService', ['getStudentAcademicByStudentId', 'getGradeDetails', 'addStudentAcademic', 'updateStudentAcademic']);
    service.getStudentAcademicByStudentId.and.returnValue(of({ responseCode: 200, listPayload: [academic] }));
    service.getGradeDetails.and.returnValue(of({ listPayload: [{ id: 3, gradeName: 'One' }] }));
    service.addStudentAcademic.and.returnValue(of({ responseCode: 200, payload: { respCode: 200 } }));
    service.updateStudentAcademic.and.returnValue(of({ responseCode: 200, payload: { respCode: 200 } }));
    component = new StudentListComponent(new FormBuilder(), {} as any, service,
      { getLoginUser: () => ({}) } as any, { add: () => {} } as any, {} as any,
      {} as any, {} as any, { open: () => ({ close: () => {}, afterClosed: () => new Subject<void>() }) } as any);
    component.createForms();
    spyOn(component, 'getStudentDetails');
  });
  afterEach(() => component.ngOnDestroy());
  it('loads saved details and updates using the academic record ID', () => {
    component.openAssignClassModal({} as any, { id: 7 });
    expect(service.getStudentAcademicByStudentId).toHaveBeenCalledWith(7);
    expect(component.assignClassForm.value).toEqual({ studentId: 7, sessionName: '2025-26', gradeId: 3, gradeSection: 'B', rollNumber: '18' });
    component.assignClass();
    expect(service.updateStudentAcademic).toHaveBeenCalledWith(jasmine.objectContaining({ id: 91, studentId: 7, status: 'PROMOTED' }));
    expect(service.addStudentAcademic).not.toHaveBeenCalled();
  });
  it('allows the first assignment when there are no saved records', () => {
    service.getStudentAcademicByStudentId.and.returnValue(of({ responseCode: 200, listPayload: [] }));
    component.openAssignClassModal({} as any, { id: 7 });
    expect(component.academicLoadError).toBe('');
    expect(component.assignClassForm.enabled).toBeTrue();
    component.assignClassForm.patchValue({ gradeId: 3, gradeSection: 'A', rollNumber: '1' });
    component.assignClass();
    expect(service.addStudentAcademic).toHaveBeenCalled();
    expect(service.updateStudentAcademic).not.toHaveBeenCalled();
  });
  it('clears saved values for a session without a record', () => {
    component.openAssignClassModal({} as any, { id: 7 });
    component.assignClassForm.patchValue({ sessionName: '2030-31' });
    component.onAcademicSessionChange();
    expect(component.selectedAcademic).toBeNull();
    expect(component.assignClassForm.get('rollNumber')?.value).toBe('');
    expect(component.assignClassForm.get('gradeId')?.value).toBeNull();
  });
  it('blocks saving after a lookup failure and supports retry', () => {
    service.getStudentAcademicByStudentId.and.returnValue(throwError(() => new Error('offline')));
    component.openAssignClassModal({} as any, { id: 7 });
    component.assignClass();
    expect(component.academicLoadError).not.toBe('');
    expect(service.addStudentAcademic).not.toHaveBeenCalled();
    service.getStudentAcademicByStudentId.and.returnValue(of({ responseCode: 200, listPayload: [academic] }));
    component.loadStudentAcademics();
    expect(component.academicLoadError).toBe('');
    expect(component.selectedAcademic.id).toBe(91);
  });
  it('cancels the previous lookup when another student is opened', () => {
    const pending = new Subject<any>();
    service.getStudentAcademicByStudentId.and.returnValue(pending);
    component.openAssignClassModal({} as any, { id: 7 });
    service.getStudentAcademicByStudentId.and.returnValue(of({ responseCode: 200, listPayload: [] }));
    component.openAssignClassModal({} as any, { id: 8 });
    pending.next({ responseCode: 200, listPayload: [academic] });
    pending.complete();
    expect(component.selectedAcademic).toBeNull();
    expect(component.assignClassForm.get('studentId')?.value).toBe(8);
  });
});
