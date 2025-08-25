const API = "https://api.lorettoeletronics.uz:5000";

import type { loginInterface, loginResponse } from "../interfaces";

export async function loginUser({ username, password }: loginInterface) {
  const response = await fetch(`${API}/Login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      CompanyDB: "LORETTO",
      Password: password,
      UserName: username,
    }),
  });
  const result: loginResponse = await response.json();
  return result;
}
