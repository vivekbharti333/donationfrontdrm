import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { DonationDetailsRequest, DonationDetails } from '../interface/donation-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DonationManagementService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  getFundrisingOfficerByTeamLeaderId(): Observable<any> {
    let request: DonationDetailsRequest = {
      payload: {
        requestedFor: "OPTION",
        roleType: this.cookieService.get('roleType'),
        createdBy: this.cookieService.get('loginId'),
        loginId: this.cookieService.get('loginId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "getFundRisingOfficersBySuperadminId", request);
  }

  
  saveLeadDetails(donationDetails: DonationDetails): Observable<DonationDetailsRequest> {
    this.loginUser = this.authenticationService.getLoginUser();

    let request: DonationDetailsRequest = {
      payload: {
        id: donationDetails.id,
        donorName: donationDetails.donorName,
        mobileNumber: donationDetails.mobileNumber,
        emailId: donationDetails.emailId,
        notes: donationDetails.notes,
        status: donationDetails.status,
        followupDate: donationDetails.followupDate,
        createdBy: this.cookieService.get('loginId'),
        loginId: this.cookieService.get('loginId'),
        token: this.cookieService.get('token'),
        teamLeaderId: this.cookieService.get('teamLeaderId'),
        superadminId: this.cookieService.get('superadminId'),
        createdbyName: (this.cookieService.get('firstName')+" "+this.cookieService.get('lastName'))

      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "createLead", request);
  }

  saveDonationDetails(donationDetails: DonationDetails): Observable<DonationDetailsRequest> {
    this.loginUser = this.authenticationService.getLoginUser();

    let createdBy = this.loginUser['loginId'];

    if (donationDetails.createdBy !== 'N/A' && donationDetails.createdBy !== 'Select Fundrising Officer') {
      createdBy = donationDetails.createdBy;
  }

    let request: DonationDetailsRequest = {
      payload: {
        createdBy: donationDetails.createdBy,
        invoiceHeaderDetailsId: donationDetails.invoiceHeaderDetailsId,
        donorName: donationDetails.donorName,
        mobileNumber: donationDetails.mobileNumber,
        emailId: donationDetails.emailId,
        address: donationDetails.address,
        panNumber: donationDetails.panNumber,
        programName: donationDetails.programName,
        amount: donationDetails.amount,
        currency: donationDetails.currency,
        currencyCode: donationDetails.currencyCode,
        transactionId: donationDetails.transactionId,
        paymentMode: donationDetails.paymentMode,
        notes: donationDetails.notes,
        paymentType: 'OFFLINE',
        roleType: this.cookieService.get('roleType'),
        loginId: this.cookieService.get('loginId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),

      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "addDonation", request);
  }


  // Donation List
  getDonationList(tabName:string): Observable<DonationDetailsRequest> {
    let request: DonationDetailsRequest = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "getDonationList", request);
  }

  getDonationListForLead(event:any){
    // const createdBy = this.cookieService.get('teamLeaderId');
    // alert("createdBy : "+createdBy);
    // const roleType = this.cookieService.get('roleType');
    // if(roleType === 'SUPERADMIN'){
    //     createdBy == event;
    //     roleType == roleType
    // } else {
    //   roleType == 'elsepart';
    // }

    let request: DonationDetailsRequest = {
      payload: {
        // requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        createdBy: event,
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "getDonationListForLead", request);
  }

  updateDonationDetails(donationDetails: DonationDetails): Observable<DonationDetailsRequest> {
    let request: DonationDetailsRequest = {
      payload: {
        id: donationDetails.id,
        invoiceHeaderDetailsId: donationDetails.invoiceHeaderDetailsId,
        donorName: donationDetails.donorName,
        mobileNumber: donationDetails.mobileNumber,
        emailId: donationDetails.emailId,
        address: donationDetails.address,
        panNumber: donationDetails.panNumber,
        programName: donationDetails.programName,
        amount: donationDetails.amount,
        transactionId: donationDetails.transactionId,
        paymentMode: donationDetails.paymentMode,
        notes: donationDetails.notes,
        paymentType: 'OFFLINE',
        roleType: this.cookieService.get('roleType'),
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
  
    // Ensure the function returns the Observable
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "updateDonation", request);
  }
 

}
