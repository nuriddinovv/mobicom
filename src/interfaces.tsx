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
