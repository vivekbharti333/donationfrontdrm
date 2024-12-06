/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
// import { UserDetails, UserDetailsRequest } from '../interface/user-management';
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

  saveLeadDetails(lead: any): Observable<any> {
    const request: any = {
      payload: this.saveLeadPayload(lead),
    };
    return this.http.post<any>(Constant.Site_Url + 'registerLead', request);
  }

  updateLeadDetails(lead: any): Observable<any> {
    const request: any = {
      payload: this.updateLeadPayload(lead),
    };
    return this.http.post<any>(Constant.Site_Url + 'registerLead', request);
  }

  saveLeadPayload(lead: any) {
    const payload = {
      companyName: lead.companyName,
      enquirySource: lead.enquirySource,
      // superCategory: lead.superCategory,
      // category: lead.category,
      // subCategory: lead.subCategory,
      categoryTypeId: lead.categoryTypeId?.id,
      superCategoryId: lead.superCategoryId?.id,
      categoryId: lead.categoryId?.id,
      subCategoryId: lead.subCategoryId?.id,
      categoryTypeName: lead.categoryTypeId?.categoryTypeName, // Need to add in payload
      superCategory: lead.superCategoryId?.superCategory, //
      category: lead.categoryId?.category, //
      subCategory: lead.subCategoryId?.subCategory, //
      // itemName: lead.itemName,
      pickupDateTime: lead.pickupDateTime,
      pickupLocation: lead.pickupLocation,
      pickupPoint: lead.pickupPoint,
      dropDateTime: lead.dropDateTime,
      dropLocation: lead.dropLocation,
      dropPoint: lead.dropPoint,
      customeName: lead.customeName,
      countryDialCode: lead.countryDialCode,
      customerMobile: lead.customerMobile,
      customerEmailId: lead.customerEmailId,
      totalDays: lead.totalDays,
      quantity: lead.quantity,
      childrenQuantity: '',
      infantQuantity: '',
      vendorRate: lead.vendorRate,
      payToVendor: lead.payToVendor,
      companyRate: lead.companyRate,
      payToCompany: lead.payToCompany,
      bookingAmount: lead.bookingAmount,
      balanceAmount: lead.balanceAmount,
      totalAmount: lead.totalAmount,
      securityAmount: lead.securityAmount,
      // vendorName: lead.,
      status: lead.status,
      leadOrigine: lead.leadOrigine,
      leadType: lead.leadType,
      createdBy: lead.createdBy,
      loginId: this.cookieService.get('loginId'),
      notes: lead.notes,
      remarks: lead.remarks,
      roleType: this.cookieService.get('roleType'),
      token: this.cookieService.get('token'),
      // createdBy: this.cookieService.get('loginId'),
      superadminId: this.cookieService.get('superadminId'),
      teamleaderId: this.cookieService.get('teamleaderId'),
      adminId: this.cookieService.get('adminId')
    };
    return payload;
  }

  updateLeadPayload(lead: any) {
    const payload = {
      id: lead.id,
      companyName: lead.companyName,
      enquirySource: lead.enquirySource,
      categoryTypeId: lead?.categoryType?.id,
      superCategoryId: lead?.superCategory?.id,
      categoryId: lead?.category?.id,
      subCategoryId: lead?.subCategory?.id,
      categoryTypeName: lead?.categoryType?.categoryTypeName,
      superCategory: lead?.superCategory?.superCategory, //
      category: lead?.category?.category, //
      subCategory: lead?.subCategory?.subCategory, //
      // itemName: lead.itemName,
      pickupDateTime: lead?.pickUpDateTime,
      pickupLocation: lead?.pickUpLocation,
      pickupPoint: lead.pickupPoint,
      dropDateTime: lead?.dropDateTime,
      dropLocation: lead?.dropLocation,
      dropPoint: lead.dropPoint,
      customeName: lead?.customerName,
      countryDialCode: lead?.dialCode,
      customerMobile: lead?.mobile,
      customerEmailId: lead?.emailId,
      totalDays: lead?.totalDays,
      quantity: lead?.quantity,
      vendorRate: lead?.vendorRate,
      payToVendor: lead?.payToVendor,
      companyRate: lead?.companyRate,
      payToCompany: lead?.payToCompany,
      bookingAmount: lead?.bookingAmount,
      balanceAmount: lead?.balanceAmount,
      totalAmount: lead?.totalAmount,
      securityAmount: lead?.securityAmount,
      // vendorName: lead.,
      status: lead.status,
      leadOrigine: lead.leadOrigine,
      leadType: lead.leadType,
      // createdBy: lead.createdBy,
      createdBy: this.cookieService.get('loginId'),
      notes: lead.notes,
      roleType: this.cookieService.get('roleType'),
      token: this.cookieService.get('token'),
      // createdBy: this.cookieService.get('loginId'),
      superadminId: this.cookieService.get('superadminId'),
    };
    return payload;
  }

  changeLeadStatus(lead: any): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        id: lead.id,
        status: lead.status,
        token: this.cookieService.get('token'),
        loginId: this.cookieService.get('loginId'),
        adminId: this.cookieService.get('adminId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'changeLeadStatus', request);
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

  getAllLeadList(roleType:string): Observable<any> {
    const request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: roleType,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        adminId: this.cookieService.get('adminId'),
        superadminId: this.cookieService.get('superadminId'),
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getAllLeadList', request);
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
