import { useEffect, useRef, useState } from "react";
import { RotateLoader } from "react-spinners";
import { ChartOfAccountsApi, ReconciliationApi } from "../api/get";
import useFetch from "../api/useFetch";
import { useNavigate } from "react-router-dom";
import type { chartOfAccountsResponse } from "../interfaces";
import { formatDate } from "../utils/formatDate";

export default function Reconciliation() {
  const navigate = useNavigate();
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    navigate("/");
  }
  const [account, setAccount] = useState<chartOfAccountsResponse>();
  const [total, setTotal] = useState(123);

  const { data, loading, error, refetch } = useFetch(() =>
    ReconciliationApi({
      CardCode: selectedCardCode,
    })
  );

  const [selectedCardCode, setSelectedCardCode] = useState<string | null>(
    "3130_31"
  );

  // chart of accounts
  const [chartsModalVisible, setChartsModalVisible] = useState(false);
  const [chartQ, setChartQ] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chartQ === "") chartRefetch();
  }, [chartQ, chartsModalVisible]);
  useEffect(() => {
    if (!typing && chartQ !== "") chartRefetch();
  }, [typing, chartQ]);
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 700);
    return () => clearTimeout(t);
  }, [typing]);
  const {
    error: chartError,
    data: chartData,
    loading: chartLoading,
    refetch: chartRefetch,
  } = useFetch(
    () =>
      ChartOfAccountsApi({
        Query: chartQ,
        sessionId: sessionId || "123",
        Curr: null,
      }),
    false
  );

  return (
    <div className="p-4 h-full">
      <div
        style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
        className="overflow-x-auto overflow-y-auto rounded-md w-full h-[90vh] border border-gray-200"
      >
        <table className="text-sm text-left w-full">
          <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
            <tr>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Object code
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Object name
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Num at card
              </th>
              <th className="py-2 px-6 whitespace-nowrap text-center">
                Card code
              </th>
              <th className="py-2 px-4 whitespace-nowrap text-center">
                Credit or debit
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Doc entry
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Doc number
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Doc date
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">Total</th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Open sum
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                transid
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Shop code
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Shop name
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Doc line
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.objectCode}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.objectName}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.numAtCard}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.cardCode}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.creditOrDebit}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.invoiceDocEntry}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.invoiceDocNum}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {formatDate(item.invoiceDate)}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.invoiceTotal}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.openSum}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.transId}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.shopCode}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.shopName}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.docLine}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 h-full mt-4 ">
        <div className="flex gap-4 items-center">
          <input id="activeAccount" className="text-[16px]" type="checkbox" />
          <label htmlFor="activeAccount" className="text-[16px]">
            Cчет:{" "}
          </label>
          <p
            onClick={() => {
              setChartsModalVisible(true);
            }}
            className="text-[16px]"
          >
            {account?.acctName ? account.acctName : "Выберите счет"}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <p className="text-[16px] min-w-12">Total: {total}</p>
          <button>Otpravit</button>
        </div>
      </div>

      {/* CHARTOFACCOUNTS DATA */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: chartsModalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setChartsModalVisible(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>

              <div className="w-full">
                <input
                  onChange={(e) => {
                    setChartQ(e.target.value);
                    setTyping(true);
                  }}
                  type="search"
                  placeholder="Поиск..."
                  className="w-full border rounded-md border-gray-300 px-2 py-2 outline-none"
                />

                {chartData ? (
                  <div
                    ref={listRef}
                    style={{
                      scrollbarColor: "transparent",
                      scrollbarWidth: "none",
                    }}
                    className="overflow-y-scroll h-[75vh] divide-y-0"
                  >
                    {chartData?.map((item: chartOfAccountsResponse) => (
                      <div
                        onClick={() => {
                          setAccount(item);
                          setChartsModalVisible(false);
                        }}
                        key={item.acctCode}
                        className="m-2 gap-4 border-b border-gray-300 cursor-pointer flex items-center"
                      >
                        <p>{item.acctCode}</p>
                        <p>-</p>
                        <p>{item.acctName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{ display: chartLoading ? "flex" : "none" }}
                    className="relative h-[75vh] flex justify-center items-center"
                  >
                    <RotateLoader color="black" speedMultiplier={0.8} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
