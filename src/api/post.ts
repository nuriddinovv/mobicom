const API = "http://212.83.191.99:5000";

import type { loginInterface, loginResponse } from "../interfaces";

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
  console.log(data);
  console.log(sessionId);

  const response = await fetch(`http://212.83.191.99:5000/InPayments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: sessionId,  
    },
    body: JSON.stringify(data),
  });
  const result: PaymentResponse = await response.json();

  return result;
}

