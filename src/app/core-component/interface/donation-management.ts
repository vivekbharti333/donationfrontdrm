export interface DonationManagement {}

export interface DonationDetailsRequest {
  payload: {
    receiptNumber?: string;
    id?: number;
    status?: string;
    token?: string;
    donorName?: string;
    mobileNumber?: string;
    emailId?: string;
    address?: string;
    searchParam?: string;
    panNumber?: string;
    amount?: number;
    currency?: string;
    currencyCode?: string;
    transactionId?: string;
    paymentMode?: string;
    paymentType?: string;
    notes?: string;
    programName?: string;
    firstDate?: any;
    lastDate?: any;
    roleType?: string;
    createdBy?: string;
    loginId?: string;
    invoiceHeaderDetailsId?: string;
    superadminId?: string;
    requestedFor?: string;
    requestFor?: string;
    respCode?: number;
    respMesg?: string;
  } 
  responseCode?: string;
}

export interface DonationDetails {
  id?: number;
  sessionId?: string;
  donorName?: string;
  mobileNumber?: string;
  emailId?: string;
  address?: string;
  panNumber?: string;
  currencyCode?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  paymentMode?: string;
  paymentType?: string;
  notes?: string;
  programName?: string;
  createdBy?: string;
  loginId?: string;
  superadminId?: string;
  invoiceHeaderDetailsId?: string;
}

export interface DonationListForExcel {
  fromDate: string | Date;
  toDate: string | Date;
  createdAt: string | Date;
  donorName: string;
  mobileNumber: string;
  emailId: string;
  panNumber: string;
  address: string;
  programName: string;
  currencyCode?: string;
  amount: number;
  transactionId: string;
  paymentMode: string;
  receiptNumber: string;
  invoiceNumber: string;
  createdbyName: string;
  teamLeaderId: string;
  invoiceHeaderName: string;
  superadminId: string;
}

