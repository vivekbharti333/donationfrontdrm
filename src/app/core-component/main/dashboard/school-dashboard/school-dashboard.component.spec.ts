import { of, Subject, throwError } from 'rxjs';
import { SchoolDashboardComponent } from './school-dashboard.component';

describe('School dashboard enrollment', () => {
  let component: SchoolDashboardComponent;
  let service: any;
  beforeEach(() => {
    service = jasmine.createSpyObj('dashboard', ['getSchoolStudentEnrollment', 'getSchoolAttendanceOverview']);
    component = new SchoolDashboardComponent({ getLoginUser: () => ({}) } as any, service);
  });
  afterEach(() => component.ngOnDestroy());

  it('loads all attendance statuses from its dedicated API', () => {
    service.getSchoolAttendanceOverview.and.returnValue(of({ responseCode: 200, payload: {
      attendanceDate: '2026-09-15', timeZone: 'Asia/Kolkata', present: 25, absent: 3, late: 2, halfDay: 1, leave: 4
    } }));
    component.loadAttendanceOverview();
    expect(component.attendanceChart.series).toEqual([25, 3, 2, 1, 4]);
    expect(component.attendanceChart.labels).toEqual(['Present', 'Absent', 'Late', 'Half Day', 'Leave']);
    expect(component.attendanceCount('Half Day')).toBe(1);
    expect(component.attendanceOverview?.present).toBe(25);
    expect(component.attendanceEmpty).toBeFalse();
  });

  it('shows an empty state for an unmarked day', () => {
    service.getSchoolAttendanceOverview.and.returnValue(of({ responseCode: 200, payload: {
      attendanceDate: '2026-09-15', timeZone: 'Asia/Kolkata', present: 0, absent: 0, late: 0, halfDay: 0, leave: 0
    } }));
    component.loadAttendanceOverview();
    expect(component.attendanceEmpty).toBeTrue();
    expect(component.attendanceError).toBe('');
  });

  it('clears stale attendance on failure and retries successfully', () => {
    component.attendanceChart.series = [20, 1, 0, 0, 0];
    service.getSchoolAttendanceOverview.and.returnValue(throwError(() => new Error('offline')));
    component.loadAttendanceOverview();
    expect(component.attendanceOverview).toBeNull();
    expect(component.attendanceChart.series).toEqual([0, 0, 0, 0, 0]);
    expect(component.attendanceError).not.toBe('');
    service.getSchoolAttendanceOverview.and.returnValue(of({ responseCode: 200, payload: {
      attendanceDate: '2026-09-15', timeZone: 'Asia/Kolkata', present: 4, absent: 0, late: 0, halfDay: 0, leave: 0
    } }));
    component.loadAttendanceOverview();
    expect(component.attendanceError).toBe('');
    expect(component.attendanceCount('Present')).toBe(4);
  });

  it('cancels attendance requests on destruction', () => {
    const pending = new Subject<any>();
    service.getSchoolAttendanceOverview.and.returnValue(pending);
    component.loadAttendanceOverview();
    component.ngOnDestroy();
    pending.next({ responseCode: 200, payload: { present: 99, absent: 0, late: 0, halfDay: 0, leave: 0 } });
    expect(component.attendanceOverview).toBeNull();
  });

  it('uses API counts and sorts class labels numerically without a fixed scale', () => {
    service.getSchoolStudentEnrollment.and.returnValue(of({ responseCode: 200, payload: {
      sessionName: '2026-27', classes: [{ className: 'Class 10', studentCount: 301 }, { className: 'Class 2', studentCount: 8 }]
    } }));
    component.loadEnrollment();
    expect(component.enrollmentChart.xaxis.categories).toEqual(['Class 2', 'Class 10']);
    expect(component.enrollmentChart.series[0].data).toEqual([8, 301]);
    expect(component.enrollmentChart.yaxis.max).toBeUndefined();
  });

  it('passes the selected previous academic session', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 0, 15));
      service.getSchoolStudentEnrollment.and.returnValue(of({ responseCode: 200, payload: { sessionName: '2024-25', classes: [] } }));
      component.changeEnrollmentPeriod({ target: { value: 'previous' } } as any);
      expect(service.getSchoolStudentEnrollment).toHaveBeenCalledWith('2024-25');
      expect(component.enrollmentEmpty).toBeTrue();
      expect(component.enrollmentError).toBe('');
    } finally { jasmine.clock().uninstall(); }
  });

  it('clears old values after a request fails', () => {
    component.enrollmentChart.series = [{ name: 'Students', data: [50] }];
    service.getSchoolStudentEnrollment.and.returnValue(throwError(() => new Error('offline')));
    component.loadEnrollment();
    expect(component.enrollmentChart.series[0].data).toEqual([]);
    expect(component.enrollmentError).not.toBe('');
    expect(component.enrollmentLoading).toBeFalse();
  });

  it('ignores an old response after changing periods', () => {
    const pending = new Subject<any>();
    service.getSchoolStudentEnrollment.and.returnValue(pending);
    component.loadEnrollment();
    service.getSchoolStudentEnrollment.and.returnValue(of({ responseCode: 200, payload: { sessionName: '2025-26', classes: [] } }));
    component.changeEnrollmentPeriod({ target: { value: 'previous' } } as any);
    pending.next({ responseCode: 200, payload: { sessionName: '2026-27', classes: [{ className: '1', studentCount: 99 }] } });
    expect(component.enrollmentChart.series[0].data).toEqual([]);
    expect(component.enrollmentSession).toBe('2025-26');
  });
});
