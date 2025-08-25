import type {
  businessPartnersResponse,
  chartOfAccountsResponse,
} from "../interfaces";

const API = "https://api.lorettoeletronics.uz:5000";

export async function BusinessPartners({
  sessionId,
  Query,
}: {
  sessionId: string;
  Query: string | null;
}) {
  const url =
    Query !== null
      ? `${API}/BusinessPartners?q=${Query}`
      : `${API}/BusinessPartners`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: sessionId,
    },
  });
  const result: businessPartnersResponse[] = await response.json();

  return result;
}

export async function ChartOfAccounts({
  sessionId,
  Query,
}: {
  sessionId: string;
  Query: string | null;
}) {
  const url =
    Query !== null
      ? `${API}/ChartOfAccounts?q=${Query}`
      : `${API}/ChartOfAccounts`;

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
