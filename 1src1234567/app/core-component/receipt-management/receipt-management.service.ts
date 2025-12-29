import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptManagementService {
  public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'))
  }

  getInvoiceHeaderList(){
    let request: any = {
      payload: {
        requestFor: 'BYSUPERADMINID',
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getInvoiceHeaderList", request);
  }

  getInvoiceHeaderBySuperadminId(superadminId:any, id:any, requestFor:string){
    let request: any = {
      payload: {
        id:id,
        requestFor: requestFor,
        token: this.loginUser['token'],
        createdBy: superadminId,
        superadminId: superadminId,
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getInvoiceHeaderList", request);
  }

  saveInvoiceHeader(superadninId: any,invoiceHeader: any){
    let request: any = {
      payload: {
        invoiceInitial: invoiceHeader.invoiceInitial,
        companyLogo: invoiceHeader.companyLogo,
        companyFirstName: invoiceHeader.companyFirstName,
        companyFirstNameColor: invoiceHeader.companyFirstNameColor,
        companyLastName: invoiceHeader.companyLastName,
        companyLastNameColor: invoiceHeader.companyLastNameColor,
        backgroundColor: invoiceHeader.backgroundColor,
        // address: invoiceHeader.address,
        officeAddress: invoiceHeader.officeAddress,
        regAddress: invoiceHeader.regAddress,
        mobileNo: invoiceHeader.mobileNo,
        alternateMobile: invoiceHeader.alternateMobile,
        emailId: invoiceHeader.emailId,
        website: invoiceHeader.website,
        gstNumber: invoiceHeader.gstNumber,
        panNumber: invoiceHeader.panNumber,
        accountHolderName: invoiceHeader.accountHolderName,
        accountNumber: invoiceHeader.accountNumber,
        ifscCode: invoiceHeader.ifscCode,
        bankName: invoiceHeader.bankName,
        branchName: invoiceHeader.branchName,
        thankYouNote: invoiceHeader.thankYouNote,
        footer: invoiceHeader.footer,
        token: this.loginUser['token'],
        createdBy: superadninId,
        superadminId: superadninId,
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addInvoiceHeader", request);
}

}
