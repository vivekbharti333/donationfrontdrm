import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class LeadManagementService {
  public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'))
  }



  saveLeadDetails(donationDetails: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();

    let request: any = {
      payload: {
        id: donationDetails.id,
        donorName: donationDetails.donorName,
        mobileNumber: donationDetails.mobileNumber,
        emailId: donationDetails.emailId,
        notes: donationDetails.notes,
        status: donationDetails.status,
        followupDate: donationDetails.followupDate,
        createdBy: this.loginUser['loginId'],
        loginId: this.loginUser['loginId'],
        token: this.loginUser['token'],
        teamLeaderId: this.loginUser['teamLeaderId'],
        superadminId: this.loginUser['superadminId'],
        createdbyName: (this.loginUser['firstName']+" "+this.loginUser['lastName'])
      }
    };
    return this.http.post<any>(Constant.Site_Url + "createLead", request);
  }

updateLeadDetails(leadDetails: any): Observable<any> {
  const request: any = {
    payload: {
      id: leadDetails.id,
      donorName: leadDetails.donorName,
      mobileNumber: leadDetails.mobileNumber,
      emailId: leadDetails.emailId,
      notes: leadDetails.notes,
      status: leadDetails.status,
      followupDate: leadDetails.followupDate,
      loginId: this.loginUser['loginId'],
      token: this.loginUser['token'],
      superadminId: this.loginUser['superadminId'],
    }
  };
  return this.http.post<any>(Constant.Site_Url + 'updateLead', request);
}


getAllLeadList(roleType:string, tabName:string): Observable<any> {
  const request: any = {
    payload: {
      requestedFor: tabName,
      roleType: this.loginUser['roleType'],
      token: this.loginUser['token'],
      createdBy: this.loginUser['loginId'],
      adminId: this.loginUser['adminId'],
      superadminId: this.loginUser['superadminId'],
    },
  };
  return this.http.post<any>(Constant.Site_Url + 'getLeadList', request);
}


changeLeadStatus(lead: any): Observable<any> {
  const request: any = {
    payload: {
      requestedFor: 'ALL',
      id: lead.id,
      status: lead.status,
      token: this.loginUser['token'],
      loginId: this.loginUser['loginId'],
      adminId: this.loginUser['adminId'],
      superadminId: this.loginUser['superadminId'],
    },
  };
  return this.http.post<any>(Constant.Site_Url + 'changeLeadStatus', request);
}










































  getCategoryTypeList(): Observable<any> {
    const request: any = {
      payload: {
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getCategoryType', request);
  }

  getSuperCategoryList(categoryTypeId: any): Observable<any> {
    const request: any = {
      payload: {
        categoryTypeId: categoryTypeId,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(
      Constant.Site_Url + 'getSuperCategoryDetailsByCategoryTypeId',
      request
    );
  }

  getCategoryList(superCategoryId: any): Observable<any> {
    const request: any = {
      payload: {
        superCategoryId: superCategoryId,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(
      Constant.Site_Url + 'getCategoryDetailsBySuperCategoryId',
      request
    );
  }

  getSubCategoryList(categoryId: any): Observable<any> {
    const request: any = {
      payload: {
        categoryId: categoryId,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(
      Constant.Site_Url + 'getSubCategoryDetailsByCategoryId',
      request
    );
  }


  getFollowupOneList(): Observable<any> {
    const roleType = this.cookieService.get('roleType');
    let requestPayload: any = {
      requestedFor: 'ALL',
      roleType,
      token: this.cookieService.get('token'),
    };
    requestPayload = {
      ...requestPayload,
      ...(roleType === 'SUPERADMIN'
        ? { superadminId: this.cookieService.get('superadminId') }
        : {}),
      ...(roleType === 'ADMIN'
        ? {
            superadminId: this.cookieService.get('superadminId'),
            adminId: this.cookieService.get('adminId'),
          }
        : {}),
      ...(roleType === 'TEAM_LEADER'
        ? {
            superadminId: this.cookieService.get('superadminId'),
            adminId: this.cookieService.get('adminId'),
            teamleaderId: this.cookieService.get('teamleaderId'),
          }
        : {}),
      ...(roleType !== 'SUPERADMIN' &&
      roleType !== 'ADMIN' &&
      roleType !== 'TEAM_LEADER'
        ? {
            superadminId: this.cookieService.get('superadminId'),
            adminId: this.cookieService.get('adminId'),
            createdBy: this.cookieService.get('loginId'),
          }
        : {}),
    };
    const request: any = {
      payload: requestPayload,
    };
    // return this.http.post<any>(Constant.Site_Url + 'getFollowupOne', request);
    return this.http.post<any>(
      Constant.Site_Url + 'getLeadListByStatus',
      request
    );
  }

  

  getAllLeadListByDate(firstDate: string, lastDate: string): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'BYDATE',
        firstDate: firstDate,
        lastDate: lastDate,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
  }

  getFollowUpOneByDate(): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'BYDATE',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
        adminId: this.cookieService.get('adminId'),
        teamleaderId: this.cookieService.get('teamleaderId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getLeadListByStatus', request);
  }

  getLeadListByStatus(status: string): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        status: status,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getLeadListByStatus', request);
  }

  getLeadListByDate(status: string, firstDate: string, lastDate: string): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'BYDATE',
        status: status,
        firstDate: firstDate,
        lastDate: lastDate,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
       
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getLeadListByStatus', request);
  }                                                 
  
  getAllHotLeadList(): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getAllHotLeadList', request);
  }

  // getAllReservedList(): Observable<any> {
  //   const request: any = {
  //     payload: {
  //       requestedFor: 'ALL',
  //       status: "RESERVED",
  //       roleType: this.cookieService.get('roleType'),
  //       token: this.cookieService.get('token'),
  //       createdBy: this.cookieService.get('loginId'),
  //       superadminId: this.cookieService.get('superadminId'),
  //     },
  //   };
  //   return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
  // }

  // getAllReservedListByDate(
  //   firstDate: string,
  //   lastDate: string
  // ): Observable<any> {
  //   const request: any = {
  //     payload: {
  //       requestedFor: 'BYDATE',
  //       status: "RESERVED",
  //       firstDate: firstDate,
  //       lastDate: lastDate,
  //       roleType: this.cookieService.get('roleType'),
  //       token: this.cookieService.get('token'),
  //       superadminId: this.cookieService.get('superadminId'),
  //     },
  //   };
  //   return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
  // }

  getAllLostList(): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
  }

  getAllLostListByDate(firstDate: string, lastDate: string): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        firstDate: firstDate,
        lastDate: lastDate,
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
  }
}
