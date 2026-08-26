import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolManagementService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  addStudent(studentDetails: any): Observable<any> {

    const request: any = {
      payload: {
        // Auth / audit
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('superadminId'),
        createdByName: this.cookieService.get('superadminName'),
        superadminId: this.cookieService.get('superadminId'),

        // Student Basic Details
        admissionNo: studentDetails.admissionNo,
        rollNumber: studentDetails.rollNumber,
        studentPicture: studentDetails.studentPicture,
        grade: studentDetails.grade,
        gradeSection: studentDetails.gradeSection,
        firstName: studentDetails.firstName,
        middleName: studentDetails.middleName,
        lastName: studentDetails.lastName,
        dob: studentDetails.dob,
        dobPlace: studentDetails.dobPlace,
        gender: studentDetails.gender,
        bloodGroup: studentDetails.bloodGroup,
        nationality: studentDetails.nationality,
        category: studentDetails.category,
        religion: studentDetails.religion,
        aadharNumber: studentDetails.aadharNumber,
        birthCertificateNumber: studentDetails.birthCertificateNumber,
        permanentEducationNumber: studentDetails.permanentEducationNumber,
        eShikshaUniqueId: studentDetails.eShikshaUniqueId,
        sessionName: studentDetails.sessionName,
        siblingAdmissionNumber: studentDetails.siblingAdmissionNumber,

        // Parent Details
        fatherName: studentDetails.fatherName,
        fatherMobileNo: studentDetails.fatherMobileNo,
        motherName: studentDetails.motherName,
        motherMobileNo: studentDetails.motherMobileNo,

        // Current Address
        currentAddress: studentDetails.currentAddress,
        currentCity: studentDetails.currentCity,
        currentState: studentDetails.currentState,
        currentPin: studentDetails.currentPin,

        // Permanent Address
        permanentAddress: studentDetails.permanentAddress,
        permanentCity: studentDetails.permanentCity,
        permanentState: studentDetails.permanentState,
        permanentPin: studentDetails.permanentPin,

        // Previous School
        previousSchool: studentDetails.previousSchool,
        reasonForChange: studentDetails.reasonForChange,
        lastClassAttended: studentDetails.lastClassAttended
      }
    };

    return this.http.post<any>(Constant.Site_Url + 'addStudent', request);
  }

  updateStudent(studentDetails: any): Observable<any> {

    const request: any = {
      payload: {
        // Auth / audit
        token: this.cookieService.get('token'),
        id: studentDetails.id ?? studentDetails.studentId,
        createdBy: studentDetails.createdBy || this.cookieService.get('loginId'),
        createdByName: studentDetails.createdByName || this.cookieService.get('userName'),
        superadminId: studentDetails.superadminId || this.cookieService.get('superadminId'),

        // Student Basic Details
        admissionNo: studentDetails.admissionNo,
        rollNumber: studentDetails.rollNumber,
        studentPicture: studentDetails.studentPicture,
        grade: studentDetails.grade,
        gradeSection: studentDetails.gradeSection,
        firstName: studentDetails.firstName,
        middleName: studentDetails.middleName,
        lastName: studentDetails.lastName,
        dob: studentDetails.dob,
        dobPlace: studentDetails.dobPlace,
        gender: studentDetails.gender,
        bloodGroup: studentDetails.bloodGroup,
        nationality: studentDetails.nationality,
        category: studentDetails.category,
        religion: studentDetails.religion,
        aadharNumber: studentDetails.aadharNumber,
        birthCertificateNumber: studentDetails.birthCertificateNumber,
        permanentEducationNumber: studentDetails.permanentEducationNumber,
        eShikshaUniqueId: studentDetails.eShikshaUniqueId,
        sessionName: studentDetails.sessionName,
        siblingAdmissionNumber: studentDetails.siblingAdmissionNumber,

        // Parent Details
        fatherName: studentDetails.fatherName,
        fatherMobileNo: studentDetails.fatherMobileNo,
        motherName: studentDetails.motherName,
        motherMobileNo: studentDetails.motherMobileNo,

        // Current Address
        currentAddress: studentDetails.currentAddress,
        currentCity: studentDetails.currentCity,
        currentState: studentDetails.currentState,
        currentPin: studentDetails.currentPin,

        // Permanent Address
        permanentAddress: studentDetails.permanentAddress,
        permanentCity: studentDetails.permanentCity,
        permanentState: studentDetails.permanentState,
        permanentPin: studentDetails.permanentPin,

        // Previous School
        previousSchool: studentDetails.previousSchool,
        reasonForChange: studentDetails.reasonForChange,
        lastClassAttended: studentDetails.lastClassAttended
      }
    };

    return this.http.post<any>(Constant.Site_Url + 'updateStudent', request);
  }


  getStudentDetails(): Observable<any> {
    let request: any = {
      payload: {
        requestFor: 'ALL',
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        // superadminId: 'SA001'
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getStudentDetails", request);
  }

  getStudentAcademicDetails(filters: {
    sessionName?: string;
    grade?: string;
    gradeSection?: string;
    status?: string;
  } = {}): Observable<any> {
    const token = this.cookieService.get('token');
    const currentUser = this.authenticationService.getLoginUser();
    const superadminId = currentUser?.superadminId
      || this.cookieService.get('superadminId');
    const payload: any = {
      superadminId,
      sessionName: filters.sessionName?.trim() || undefined
    };
    if (filters.grade?.trim()) payload.grade = filters.grade.trim();
    if (filters.gradeSection?.trim()) payload.gradeSection = filters.gradeSection.trim();
    if (filters.status?.trim()) payload.status = filters.status.trim();

    let request: any = {
      payload
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + "getStudentAcademicDetails", request, options);
  }

  updateStudentAcademic(academicDetails: any): Observable<any> {
    const token = this.cookieService.get('token');
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        studentId: academicDetails.studentId,
        sessionName: academicDetails.sessionName,
        grade: academicDetails.grade,
        gradeSection: academicDetails.gradeSection,
        rollNumber: academicDetails.rollNumber,
        status: academicDetails.status,
        createdBy: currentUser?.loginId || this.cookieService.get('loginId'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateStudentAcademic', request, options);
  }

  addStudentAcademic(academicDetails: any): Observable<any> {
    const token = this.cookieService.get('token');
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        studentId: academicDetails.studentId,
        gradeId: Number(academicDetails.gradeId),
        sessionName: String(academicDetails.sessionName ?? '').trim(),
        grade: String(academicDetails.grade ?? '').trim(),
        gradeSection: String(academicDetails.gradeSection ?? '').trim(),
        rollNumber: String(academicDetails.rollNumber ?? '').trim(),
        createdBy: currentUser?.loginId
          || this.cookieService.get('loginId')
          || this.cookieService.get('superadminId'),
        createdByName: currentUser?.name || this.cookieService.get('superadminName'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'addStudentAcademic', request, options);
  }

  getFeeTypeDetails(): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'getFeeTypeDetails', request, options);
  }

  addFeeType(feeType: any): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        feeTypeName: feeType.feeTypeName?.trim(),
        feeTypeDescription: feeType.feeTypeDescription?.trim(),
        createdBy: currentUser?.loginId
          || this.cookieService.get('loginId')
          || this.cookieService.get('superadminId'),
        createdByName: currentUser?.name || this.cookieService.get('superadminName'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'addFeeType', request, options);
  }

  updateFeeType(feeType: any): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        id: feeType.id,
        feeTypeName: feeType.feeTypeName?.trim(),
        feeTypeDescription: feeType.feeTypeDescription?.trim(),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateFeeType', request, options);
  }

  getFeeStructure(filters?: { academicYearId?: string; gradeId?: number | null; feeTypeName?: string }): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId'),
        ...(filters?.academicYearId ? { academicYearId: filters.academicYearId } : {}),
        ...(filters?.gradeId ? { gradeId: Number(filters.gradeId) } : {}),
        ...(filters?.feeTypeName?.trim() ? { feeTypeName: filters.feeTypeName.trim() } : {})
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'getFeeStructure', request, options);
  }

  addFeeStructure(feeStructure: any): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        academicYearId: feeStructure.academicYearId?.trim(),
        gradeId: Number(feeStructure.gradeId),
        feeStructures: (feeStructure.feeStructures || []).map((item: any) => ({
          feeTypeId: Number(item.feeTypeId),
          amount: Number(item.amount),
          frequency: item.frequency?.trim()
        })),
        createdBy: currentUser?.loginId
          || this.cookieService.get('loginId')
          || this.cookieService.get('superadminId'),
        createdByName: currentUser?.name || this.cookieService.get('superadminName'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'addFeeStructure', request, options);
  }

  updateFeeStructure(feeStructure: any): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        id: feeStructure.id,
        academicYearId: feeStructure.academicYearId?.trim(),
        gradeId: Number(feeStructure.gradeId),
        feeTypeId: Number(feeStructure.feeTypeId),
        amount: Number(feeStructure.amount),
        frequency: feeStructure.frequency?.trim(),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateFeeStructure', request, options);
  }

  getAssignedFeeToStudentDetails(studentId: number, sessionName: string): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        studentId: Number(studentId),
        sessionName: String(sessionName ?? '').trim(),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'getAssignedFeeToStudentDetails', request, options);
  }

  updateAssignedFeeToStudent(fee: any): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        id: Number(fee.id),
        studentAcademicId: Number(fee.studentAcademicId),
        feeStructureId: Number(fee.feeStructureId),
        assignedAmount: Number(fee.amount || 0),
        discountAmount: Number(fee.discount || 0),
        fineAmount: Number(fee.fine || 0),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateAssignedFeeToStudent', request, options);
  }

  deleteFeeStructure(id: number): Observable<any> {
    const token = this.getAuthenticationToken();
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        id: Number(id),
        updatedBy: currentUser?.loginId || this.cookieService.get('loginId'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'deleteFeeStructure', request, options);
  }

  getGradeDetails(): Observable<any> {
    const token = this.cookieService.get('token');
    const request = { payload: {} };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'getGradeDetails', request, options);
  }

  addGrade(grade: any): Observable<any> {
    const token = this.cookieService.get('token');
    const request = {
      payload: {
        gradeName: grade.gradeName?.trim(),
        gradeCode: grade.gradeCode?.trim()
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'addGrade', request, options);
  }

  updateGrade(grade: any): Observable<any> {
    const token = this.cookieService.get('token');
    const request = {
      payload: {
        id: grade.id,
        gradeName: grade.gradeName?.trim(),
        gradeCode: grade.gradeCode?.trim()
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateGrade', request, options);
  }

  private getAuthenticationToken(): string {
    return this.authenticationService.getLoginUser()?.token
      || this.cookieService.get('token');
  }
}
