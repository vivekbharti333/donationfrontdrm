export interface DonationManagement {}

export class DonationDetailsRequest {
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
  } = {}; // Initialized to an empty object
  responseCode?: string;
}

export class DonationDetails {
  id?: number;
  sessionId?: string;
  donorName?: string;
  mobileNumber?: string;
  emailId?: string;
  address?: string;
  panNumber?: string;
  amount?: number;
  currency?: string;
  currencyCode?: string;
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
