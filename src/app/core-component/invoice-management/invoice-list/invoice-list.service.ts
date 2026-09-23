import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface InvoiceItem {
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
}

export interface InvoiceListEntry {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstNumber?: string;
  billingAddress?: string;
  deliveryAddresses?: string;
  companyName?: string;
  officeAddress?: string;
  gstNumber?: string;
  invoiceDate?: string | number;
  dueDate?: string | number;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  totalTaxAmount?: number;
  paymentMode?: string;
  transactionId?: string;
  paymentStatus?: string;
  invoiceStatus?: string;
  items: InvoiceItem[];
}

export interface InvoiceListResponse {
  responseCode: number;
  responseMessage?: string;
  listPayload?: InvoiceListEntry[];
}

@Injectable({ providedIn: 'root' })
export class InvoiceListService {
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

  getInvoices(): Observable<InvoiceListResponse> {
    const superadminId = this.authenticationService.getLoginUser()?.superadminId;
    if (superadminId == null || !String(superadminId).trim()) {
      return throwError(() => new Error('Your account is missing a superadmin ID. Please sign in again.'));
    }
    return this.http.post<InvoiceListResponse>(
      `${Constant.Site_Url}getInvoiceDetailsBySuperadminId`,
      { payload: { superadminId: String(superadminId).trim() } }
    );
  }
}
