import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
// import { UserDetails, UserDetailsRequest } from '../interface/user-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { UserDetailsRequest } from '../interface/user-management';
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

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

  getUserListToGetDataForCall(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType:  Constant.superAdmin,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('superadminId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserDetails",request);
  }

  getTeamleaderList(): Observable<UserDetailsRequest> {
    let request: UserDetailsRequest = {
      payload: {
        roleType: Constant.teamLeader,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<UserDetailsRequest>(Constant.Site_Url + "getUserListForDropDown", request);
  }


  getUserDetailsByLoginId(): Observable<any> {
    let request: any = {
      payload: {
        token:  this.loginUser['token'],
        loginId: this.loginUser['loginId'],
        superadminId:  this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserDetailsByLoginId",request);
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
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        adminId: this.cookieService.get('adminId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserListForDropDown",request);
  }

  getUserListForByRoleType(roleType: string): Observable<any> {
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));
    let request: any = {
      payload: {
        roleType: roleType,
        token:  this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getUserDetailsByUserRole",request);
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


  saveUserDetails(userDetails: any): Observable<UserDetailsRequest> {
    this.loginId = this.cookieService.get('loginId');
    this.superadminId = this.cookieService.get('superadminId');
    var creatBy ="";
    if(userDetails.roleType === Constant.fundraisingOfficer){
      creatBy = userDetails.createdBy;
    }else {
      creatBy = this.loginUser['loginId'];
    }

    let request: any = {
      payload: {
        userPicture: userDetails.userPicture,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        roleType: userDetails.roleType,
        permissions: JSON.stringify(userDetails.permissions),
        // permissions: userDetails.permissions,
        mobileNo: userDetails.mobileNo,
        alternateMobile: userDetails.alternateMobile,
        emailId: userDetails.emailId,
        service: userDetails.service,
        dob: userDetails.dob,
        addressList: userDetails.addressList,
        requestedFor: 'WEB',
        token: this.loginUser['token'],
        createdBy: creatBy,
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<UserDetailsRequest>(Constant.Site_Url+"userRegistration",request);
  }

  updateUserDetails(userDetails: any): Observable<any> {
    let request: any = {
      payload: {
        loginId: userDetails.loginId,
        userPicture: userDetails.userPicture,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        roleType: userDetails.roleType,
        mobileNo: userDetails.mobileNo,
        alternateMobile: userDetails.alternateMobile,
        emailId: userDetails.emailId,
        dob: userDetails.dob,
        addressList: userDetails.addressList,
        requestedFor: 'WEB',
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"updateUserDetails",request);
  }

  // updateUserDetails(user: any): Observable<any> {
  //   user.firstname
  //   let request: any = {
  //     payload: {
  //       // userPicture: user.userPicture,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       emailId: user.emailId,
  //       roleType: user.roleType,
  //       mobileNo: user.mobileNo,
  //       dob: user.dob,
  //       alternateMobile: user.alternateMobile,
  //       idDocumentType: user.idDocumentType,
  //       idDocumentPicture: user.idDocumentPicture,
  //       panNumber: user.panNumber,
  //       permissions: user.permissions,
        
  //       emergencyContactRelation1: user.emergencyContactRelation1,
  //       emergencyContactName1: user.emergencyContactName1,
  //       emergencyContactNo1: user.emergencyContactNo1,
  //       emergencyContactRelation2: user.emergencyContactRelation2,
  //       emergencyContactName2: user.emergencyContactName2,
  //       emergencyContactNo2: user.emergencyContactNo2,
  //       addressList: user.addressList,

  //       token: this.loginUser['token'],
  //       createdBy: this.loginUser['createdBy'],
  //       superadminId: this.loginUser['superadminId'],

  //     }
  //   };
  //   return  this.http.post<any>(Constant.Site_Url+"updateUserDetails",request);
  // }

  getAddressDetailsByUserId(user:any): Observable<UserDetailsRequest> {
    let request: UserDetailsRequest = {
      payload: {
        requestedFor: 'ALL',
        id: user.id,
        token: this.loginUser['token'],
        roleType: this.loginUser['roleType'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<UserDetailsRequest>(Constant.Site_Url + "getAddressDetails", request);
  }

  getUserDetailsListBySelectingTeamLeader(teamLeader:any): Observable<UserDetailsRequest> {
    let request: UserDetailsRequest = {
      payload: {
        requestedFor: 'ALL',
        roleType: "TEAM_LEADER",
        token: this.loginUser['token'],
        createdBy: teamLeader.teamLeaderId,
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<UserDetailsRequest>(Constant.Site_Url + "getUserDetails", request);
  }

  changeUserPassword(userDetails: any): Observable<UserDetailsRequest> {
    this.loginId = localStorage.getItem('loginId');
    this.superadminId = localStorage.getItem('superadminId');

    let request: any = {
      payload: {
        loginId: userDetails['loginId'],
        password: userDetails['password'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeUserPassword",request);
  }

  changeTeamLeader(userDetails: any): Observable<UserDetailsRequest> {
    let request: any = {
      payload: {
        loginId: userDetails['loginId'],
        teamLeaderId: userDetails['teamLeaderId'],
        token: this.loginUser['token'],
        // createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeTeamLeader",request);
  }

  changeUserRole(userDetails: any): Observable<UserDetailsRequest> {
    let request: any = {
      payload: {
        loginId: userDetails['loginId'],
        roleType: userDetails['roleType'],
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeUserRole",request);
  }

  removeUserParmanent(loginId: any): Observable<UserDetailsRequest> {
    let request: any = {
      payload: {
        loginId:loginId,
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"removeUserParmanent",request);
  }

}
