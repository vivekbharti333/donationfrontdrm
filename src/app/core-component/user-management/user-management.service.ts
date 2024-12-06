import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
// import { UserDetails, UserDetailsRequest } from '../interface/user-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'))
  }

  doLogin(login: any): Observable<any> {
    let request: any = {
      payload: {
        loginId: login.loginId,
        password: login.password,
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"doLogin",request);
  }

  getUserDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserDetails",request);
  }

  getUserDetailsByRoleType(roleType:any): Observable<any> {
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));
    let request: any = {
      payload: {
        roleType: roleType,
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserDetailsByRoleType",request);
  }

  getUserListForDropDown(): Observable<any> {
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.loginUser['roleType'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserListForDropDown",request);
  }

  changeUserStatus(rowData:any): Observable<any> {
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));
    let request: any = {
      payload: {
        loginId: rowData.loginId,
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeUserStatus",request);
  }


  getAddressListByUserId(userId:any): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: 'MAINADMIN',
        token: '',
        loginId: userId,
        superadminId: 'MAINADMIN',
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getAddressDetails",request);
  }


  saveUserDetails(user: any): Observable<any> {
    
    let request: any = {
      payload: {
        userPicture: user.userPicture,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        gender: user.gender,
        roleType: user.roleType,
        // permissions: "'"+user.permissions+"'",
        permissions: JSON.stringify(user.permissions),
        mobileNo: user.mobileNo,
        dob: user.dob,
        alternateMobile: user.alternateMobile,
        idDocumentType: user.idDocumentType,
        idDocumentPicture: user.idDocumentPicture,
        panNumber: user.panNumber,
        
        emergencyContactRelation1: user.emergencyContactRelation1,
        emergencyContactName1: user.emergencyContactName1,
        emergencyContactNo1: user.emergencyContactNo1,
        emergencyContactRelation2: user.emergencyContactRelation2,
        emergencyContactName2: user.emergencyContactName2,
        emergencyContactNo2: user.emergencyContactNo2,
        addressList: user.addressList,

        token: this.loginUser['token'],
        adminId: '',
        teamleaderId: '',
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],

      }
    };
    return  this.http.post<any>(Constant.Site_Url+"userRegistration",request);
  }

  updateUserDetails(user: any): Observable<any> {
    user.firstname
    let request: any = {
      payload: {
        userPicture: user.userPicture,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        roleType: user.roleType,
        mobileNo: user.mobileNo,
        dob: user.dob,
        alternateMobile: user.alternateMobile,
        idDocumentType: user.idDocumentType,
        idDocumentPicture: user.idDocumentPicture,
        panNumber: user.panNumber,
        
        emergencyContactRelation1: user.emergencyContactRelation1,
        emergencyContactName1: user.emergencyContactName1,
        emergencyContactNo1: user.emergencyContactNo1,
        emergencyContactRelation2: user.emergencyContactRelation2,
        emergencyContactName2: user.emergencyContactName2,
        emergencyContactNo2: user.emergencyContactNo2,
        addressList: user.addressList,

        token: '',
        createdBy: 'MAINADMIN',
        superadminId: 'MAINADMIN',

      }
    };
    return  this.http.post<any>(Constant.Site_Url+"userRegistration",request);
  }


}
