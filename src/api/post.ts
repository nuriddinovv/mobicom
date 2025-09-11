const API = "http://212.83.191.99:5000";

import type {
  accountingTransaction,
  loginInterface,
  loginResponse,
} from "../interfaces";

export async function loginUser({ username, password }: loginInterface) {
  const response = await fetch(`${API}/Login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      CompanyDB: "MEGA_TEST3",
      Password: password,
      UserName: username,
    }),
  });
  const result: loginResponse = await response.json();
  return result;
}

export async function PaymentOpenPostApi({ data, sessionId }) {
  const response = await fetch(`http://212.83.191.99:5000/InPayments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Session-Id": sessionId ?? "",
    },
    body: JSON.stringify(data),
  });
  const result: PaymentResponse = await response.json();

  return result;
}
export async function JournalEntryApi({ payload, sessionId }) {
  const response = await fetch(`/api/JournalEntries`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Session-Id": sessionId ?? "",
    },
    body: JSON.stringify(payload),
  });
  const result: accountingTransaction = await response.json();

  return result;
}

export const postPaymentCancel = async ({
  id,
  sessionId,
}: {
  id: number | string;
  sessionId: string | null;
}) => {
  const res = await fetch(`/api/InPayments/${id}/Cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Session-Id": sessionId ?? "",
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* server oddiy matn qaytargan bo‘lishi mumkin */
  }

  if (!res.ok) {
    const msg =
      json?.error?.message || json?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json ?? { ok: true };
};
export const postJournalEntryCancel = async ({
  id,
  sessionId,
}: {
  id: number | string;
  sessionId: string | null;
}) => {
  const res = await fetch(`/api/JournalEntries/${id}/Cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Session-Id": sessionId ?? "",
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* server oddiy matn qaytargan bo‘lishi mumkin */
  }

  if (!res.ok) {
    const msg =
      json?.error?.message || json?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json ?? { ok: true };
};
