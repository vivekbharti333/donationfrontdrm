import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { InvoiceRequest, InvoiceDetails } from '../../interface/receipt-management'; 
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class GenerateInvoiceService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  saveInvoiceDetails(invoiceDetails: any): Observable<any> {

    const request = {
      payload: {

        // ===== CORE CONTEXT =====
        superadminId: this.loginUser['superadminId'],
        companyId: invoiceDetails.companyId,

        companyLogo: invoiceDetails.companyLogo,
        companyName: invoiceDetails.companyName,
        officeAddress: invoiceDetails.officeAddress,
        regAddress: invoiceDetails.regAddress,
        mobileNo: invoiceDetails.mobileNo,
        emailId: invoiceDetails.emailId,
        website: invoiceDetails.website,
        gstNumber: invoiceDetails.gstNumber,
        panNumber: invoiceDetails.panNumber,

        // ===== CUSTOMER DETAILS =====
        customerName: invoiceDetails.customerName,
        customerEmail: invoiceDetails.email,
        customerPhone: invoiceDetails.phone,
        customerGstNumber: invoiceDetails.gstNumber,
        billingAddress: invoiceDetails.billingAddress,
        deliveryAddresses: invoiceDetails.deliveryAddresses,

        // ===== INVOICE DETAILS =====
        invoiceNumber: invoiceDetails.invoiceNumber,
        invoiceDate: invoiceDetails.invoiceDate,
        dueDate: invoiceDetails.dueDate,

        // ===== AMOUNTS =====
        subtotal: invoiceDetails.subtotal ?? 0,
        discount: invoiceDetails.discount ?? 0,
        totalTaxAmount: invoiceDetails.taxAmount ?? 0,
        totalAmount: invoiceDetails.totalAmount ?? 0,

        // ===== PAYMENT & STATUS =====
        status: invoiceDetails.status,
        paymentMode: invoiceDetails.paymentMode,
        transactionId: invoiceDetails.transactionId,
        paymentStatus: invoiceDetails.paymentStatus,
        invoiceStatus: invoiceDetails.invoiceStatus,

        // ===== AUDIT =====
        createdAt: invoiceDetails.createdAt,
        createdBy: invoiceDetails.createdBy,

        // ===== ITEMS =====
        items: invoiceDetails.items.map((item: any) => ({
          productName: item.productName,
          description: item.description,
          rate: item.rate,
          quantity: item.quantity,

          cgstRate: item.cgstRate ?? 0,
          cgstAmount: item.cgstAmount ?? 0,

          sgstRate: item.sgstRate ?? 0,
          sgstAmount: item.sgstAmount ?? 0,

          igstRate: item.igstRate ?? 0,
          igstAmount: item.igstAmount ?? 0,

          amount: item.amount ?? ((item.rate * item.quantity)+item.igstAmount)
        }))
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'generateInvoice', request);
  }


  getCustomerDetails(): Observable<any> {
    const request: any = {
      payload: {
        requestFor: 'BY_SUPERADMIN',
        // superadminId: '1234567890',
        superadminId: this.loginUser['superadminId'],
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getCustomerDetails', request);
  }

 getInvoiceHeaderList(){
    let request: InvoiceRequest = {
      payload: {
        requestFor: 'BYSUPERADMINID',
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<InvoiceRequest>(Constant.Site_Url + "getInvoiceHeaderList", request);
  }

  getProductList(){
    let request: InvoiceRequest = {
      payload: {
        requestFor: 'BY_SUPERADMIN',
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<InvoiceRequest>(Constant.Site_Url + "getProductDetails", request);
  }
}
