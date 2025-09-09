import type {
  businessPartnersResponse,
  chartOfAccountsResponse,
  PaymentsResponse,
  PaymentResponse,
  CurrentExchangeRateResponse,
} from "../interfaces";

const API = "http://212.83.191.99:5000";

export async function BusinessPartnersApi({
  sessionId,
  Query,
  Page,
}: {
  sessionId: string;
  Query: string | null;
  Page: number;
}) {
  const url =
    Query !== null
      ? `${API}/BusinessPartners?q=${Query}&page=${Page}`
      : `${API}/BusinessPartners&page=${Page}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: sessionId,
    },
  });
  const result: businessPartnersResponse = await response.json();

  return result;
}

export async function ChartOfAccountsApi({
  sessionId,
  Query,
  Curr,
}: {
  sessionId: string;
  Query: string | null;
  Curr: string | null;
}) {
  const url =
    Query !== null
      ? `${API}/ChartOfAccounts?q=${Query}&curr=${Curr}`
      : `${API}/ChartOfAccounts?curr=${Curr}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: sessionId,
    },
  });
  const result: chartOfAccountsResponse[] = await response.json();

  return result;
}

export async function CurrentExchangeRateApi({
  sessionId,
}: {
  sessionId: string;
}) {
  const response = await fetch(`${API}/CurrentExchangeRate`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: sessionId,
    },
  });
  const result: CurrentExchangeRateResponse = await response.json();

  return result;
}

export async function PaymentsApi({
  Query,
  Page,
}: {
  Query: string | null | number;
  Page: number;
}) {
  const url =
    Query !== null
      ? `http://212.83.191.99:5000/InPayments?&q=${Query}&page=${Page}`
      : `http://212.83.191.99:5000/InPayments?&page=${Page}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const result: PaymentsResponse = await response.json();

  return result;
}

export async function PaymentApi({ ID }: { ID: string | number }) {
  const response = await fetch(`http://212.83.191.99:5000/InPayments/${ID}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const result: PaymentResponse = await response.json();

  return result;
}

export async function PaymentOpenApi({ CardCode }: { CardCode: string }) {
  const response = await fetch(
    `http://212.83.191.99:5000/InPayments/Open/${CardCode}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const result: PaymentResponse = await response.json();

  return result;
}

export async function OutgoingPaymentsApi({
  Query,
  Page,
}: {
  Query: string | null | number;
  Page: number;
}) {
  const url =
    Query !== null
      ? `http://212.83.191.99:5000/OutPayments?&q=${Query}&page=${Page}`
      : `http://212.83.191.99:5000/OutPayments?&page=${Page}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const result: PaymentsResponse = await response.json();

  return result;
}

export async function OutgoingPaymentApi({ ID }: { ID: string | number }) {
  const response = await fetch(`http://212.83.191.99:5000/InPayments/${ID}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const result: PaymentResponse = await response.json();

  return result;
}

export async function OutgoingPaymentOpenApi({
  CardCode,
}: {
  CardCode: string;
}) {
  const response = await fetch(
    `http://212.83.191.99:5000/InPayments/Open/${CardCode}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const result: PaymentResponse = await response.json();

  return result;
}
