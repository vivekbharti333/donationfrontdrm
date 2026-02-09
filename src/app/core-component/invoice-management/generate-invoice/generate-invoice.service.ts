import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
      superadminId: invoiceDetails.superadminId,
      companyId: invoiceDetails.companyId,

      // ===== CUSTOMER DETAILS =====
      customerName: invoiceDetails.customerName,
      email: invoiceDetails.email,
      phone: invoiceDetails.phone,
      gstNumber: invoiceDetails.gstNumber,
      billingAddress: invoiceDetails.billingAddress,
      deliveryAddresses: invoiceDetails.deliveryAddresses,

      // ===== INVOICE DETAILS =====
      invoiceNumber: invoiceDetails.invoiceNumber,
      invoiceDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate,

      // ===== AMOUNTS =====
      subtotal: invoiceDetails.subtotal ?? 0,
      discount: invoiceDetails.discount ?? 0,

      cgstRate: invoiceDetails.cgstRate ?? 0,
      cgstAmount: invoiceDetails.cgstAmount ?? 0,

      sgstRate: invoiceDetails.sgstRate ?? 0,
      sgstAmount: invoiceDetails.sgstAmount ?? 0,

      igstRate: invoiceDetails.igstRate ?? 0,
      igstAmount: invoiceDetails.igstAmount ?? 0,

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
        amount: item.amount ?? (item.rate * item.quantity)
      }))
    }
  };

  return this.http.post<any>(
    Constant.Site_Url + 'generateInvoice',
    request
  );
}

}
