import { useEffect, useState } from "react";
import useFetch from "../api/useFetch";
import { ChartOfAccountsApi as fetchChartOfAccounts } from "../api/get";
import type { chartOfAccountsResponse } from "../interfaces";

export default function ChartOfAccounts() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => {
        setTyping(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [typing]);

  useEffect(() => {
    if (!typing && q !== "") {
      refetch();
    }
  }, [typing, q]);

  useEffect(() => {
    const sid = sessionStorage.getItem("sessionId");
    setSessionId(sid);
  }, []);

  const { loading, error, data, refetch } = useFetch(
    () => fetchChartOfAccounts({ sessionId: sessionId ?? "", Query: q }),
    false
  );

  useEffect(() => {
    if (sessionId) refetch();
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && q === "") refetch();
  }, [sessionId, q]);

  return (
    <div className="container mx-auto px-4">
      {/* header */}
      <div className="fixed left-0 z-10 bg-white w-full h-[10vh]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
          className="fixed left-0 right-0 top-4 mx-auto w-full max-w-[1280px] px-4 "
        >
          <div className="relative shadow-sm rounded-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="search"
              id="default-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setTyping(true);
              }}
              className="block w-full rounded-md border border-gray-200 bg-gray-50 p-4 pl-10 text-md text-gray-900 outline-0"
              placeholder="Поиск..."
            />

            <button
              onSubmit={(e) => {
                e.preventDefault();
                refetch();
              }}
              type="submit"
              className="absolute bottom-2.5 right-2.5 cursor-pointer rounded-md bg-red-500 px-4 py-2 text-md font-medium text-white"
            >
              Поиск
            </button>
          </div>
        </form>
      </div>

      <div className="pt-20" />
      {/* Kontent */}
      <div className="">
        {loading && (
          <div className="py-10 text-center text-gray-500">Yuklanmoqda...</div>
        )}
        {error && (
          <div className="py-10 text-center text-red-600">{error.message}</div>
        )}
        {!error && !loading && sessionId && data && (
          <div
            className="overflow-x-auto max-h-[85vh] rounded-md border border-gray-200 bg-white shadow-sm"
            style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
          >
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50"
                  >
                    Имя Фамилия
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right font-semibold text-gray-700 bg-gray-50"
                  >
                    Баланс (USD)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right font-semibold text-gray-700 bg-gray-50"
                  >
                    Баланс (UZS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item: chartOfAccountsResponse, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900">
                      {item.acctCode} - {item.acctName}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">
                      {item.balanceUSD.toLocaleString()} $
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">
                      {item.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
