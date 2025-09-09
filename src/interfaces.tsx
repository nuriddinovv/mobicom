export interface loginInterface {
  username: string;
  password: string;
}
export interface loginResponse {
  status: string;
  data: {
    version: string;
    sessionId: string;
    sessionTimeout: number;
  } | null;
  error: null | {
    code: string;
    message: string;
  };
}
export interface businessPartnersResponse {
  status: string;
  data: {
    pageSize: number;
    totalPages: number;
    currentPage: number;
    businessPartners: businesParters[];
  };
  error: null | {
    code: string;
    message: string;
  };
}
export interface businesParters {
  cardCode: string;
  cardName: string;
  groupCode: number;
  groupName: string;
  phone1: any;
  phone2: any;
  balance: number;
  currency: string;
  balanceFC: number;
  currencyFC: string;
  slpCode: number;
  slpName: string;
}

export interface chartOfAccountsResponse {
  acctCode: string;
  acctName: string;
  balance: number;
  currency: string;
  balanceUSD: number;
}

export interface PaymentsResponse {
  status: string;
  data: {
    payments: Payment[];
    pageSize: number;
    totalPages: number;
    currentPage: number;
  };
  error: any;
}

export interface Payment {
  docEntry: number;
  docNum: number;
  docType: string;
  canceled: boolean;
  docDate: string;
  cardCode: string;
  cardName: string;
  account: string;
  sum: number;
  sumFC: number;
  noDocSum: number;
  noDocSumFC: number;
  payNoDoc: boolean;
  comments: any;
  docTotal: number;
  docTotalFC: number;
  docCurrency: string;
  docRate: number;
  paymentInvoices: PaymentInvoices[];
  shopCode: string;
  shopName: string;
}

export interface PaymentResponse {
  status: string;
  data: Payment;
  error: any;
}

export interface PaymentInvoices {
  isChecked: boolean;
  invoiceDocEntry: number;
  invoiceDocNum: number;
  invoiceDate: string;
  invoiceTotal: number;
  invoiceTotalFC: number;
  appliedSum: number;
  appliedSumFC: number;
  objectCode: number;
  shopCode: string;
  shopName: string;
  currency: string;
  openSum: number;
}

export interface CurrentExchangeRateResponse {
  currency: string;
  rate: number;
  rateDate: string;
}
