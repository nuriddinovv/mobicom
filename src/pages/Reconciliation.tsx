import { startTransition, useEffect, useRef, useState } from "react";
import { RotateLoader } from "react-spinners";
import {
  BusinessPartnersApi,
  ChartOfAccountsApi,
  ReconciliationApi,
} from "../api/get";
import useFetch from "../api/useFetch";
import { useNavigate } from "react-router-dom";
import type {
  businesParters,
  chartOfAccountsResponse,
  reconciliation,
} from "../interfaces";
import { formatDate } from "../utils/formatDate";
import CustomLoader from "../components/CustomLoader";
import toast from "react-hot-toast";
import { postReconciliation } from "../api/post";

export default function Reconciliation() {
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const buildPayload = () => {
    const invoices = (postData ?? [])
      .filter((x: reconciliation) => x.isChecked) // faqat belgilanganlar
      .map((x: reconciliation) => ({
        invoiceDocEntry: x.invoiceDocEntry,
        invoiceDocNum: x.invoiceDocNum,
        invoiceDate: x.invoiceDate,
        invoiceTotal: x.invoiceTotal,
        appliedSum: x.appliedSum ?? 0,
        openSum: x.openSum,
        objectCode: x.objectCode,
        objectName: x.objectName,
        shopCode: x.shopCode,
        shopName: x.shopName,
        numAtCard: x.numAtCard,
        currency: x.currency,
        isForeignCurrency: x.isForeignCurrency,
        docLine: x.docLine, // agar backend ketma-ket bo‘lishini talab qilsa, i bo‘yicha berib chiqish mumkin
        transId: x.transId,
        cardCode: x.cardCode,
        creditOrDebit: x.creditOrDebit,
      }));

    return {
      docDate: todayStr(), // "2025-09-12"
      cardCode: partnerData?.cardCode ?? "", // "К00887"
      paymentInvoices: invoices, // faqat checked bo'lganlar
    };
  };
  const navigate = useNavigate();
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    navigate("/");
  }
  const [account, setAccount] = useState<chartOfAccountsResponse>();
  const [activeAccount, setActiveAccount] = useState(false);
  const [postData, setPostData] = useState<reconciliation[]>();
  const [partnerData, setPartnerData] = useState<businesParters | null>(null);
  const { data, loading, error, refetch } = useFetch(
    () =>
      ReconciliationApi({
        CardCode: partnerData?.cardCode,
      }),
    false
  );

  useEffect(() => {
    if (partnerData?.cardCode) {
      refetch();
    }
    if (data) {
      setPostData(data.data);
    }
  }, [partnerData]);

  // total
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!postData || postData.length === 0) {
      setTotal(0);
      return;
    }
    const sum = postData
      .filter((x) => x.isChecked) // faqat belgilanganlar
      .reduce((acc, item) => acc + (item.appliedSum || 0), 0);
    setTotal(sum);
  }, [postData]);

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

  // Partners
  const [partnersModalVisible, setPartnersModalVisible] =
    useState<boolean>(false);
  const [partnersQ, setPartnersQ] = useState("");
  const [partnersPage, setPartnersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    error: partnersError,
    data: partnersData,
    loading: partnersLoading,
    refetch: partnersRefetch,
  } = useFetch(
    () =>
      BusinessPartnersApi({
        Query: partnersQ,
        sessionId: sessionId || "123",
        Page: partnersPage,
      }),
    false
  );
  useEffect(() => {
    if (partnersData?.data?.totalPages) {
      setTotalPages(partnersData.data.totalPages);
    }
  }, [partnersData]);
  useEffect(() => {
    partnersRefetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [partnersPage]);
  useEffect(() => {
    if (partnersQ === "") partnersRefetch();
  }, [partnersQ, partnersModalVisible]);

  // check
  const handleCheck = (idx: number, checked: boolean) => {
    startTransition(() => {
      setPostData((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], isChecked: checked };
        return next;
      });
    });
  };

  // SEND TO BACKEND

  const [posting, setPosting] = useState(false);

  const handleSubmit = async () => {
    const checkedItems = (postData ?? []).filter((x) => x.isChecked);
    if (checkedItems.length === 0) {
      toast.error("Пожалуйста, выберите хотя бы одну строку.");
      return;
    }

    const totalSelected = checkedItems.reduce(
      (acc, it) => acc + (Number(it.appliedSum) || 0),
      0
    );

    if (Math.abs(totalSelected) > 1e-9) {
      toast.error(`Сумма AppliedSum должна быть 0 (сейчас: ${totalSelected})`);
      return;
    }

    const payload = buildPayload();

    try {
      setPosting(true);
      await postReconciliation({ payload: payload, sessionId: sessionId });
      toast.success("Success");
    } catch (e: any) {
      toast.error(e?.message || "Yuborishda xatolik.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="px-4 py-3">
      {(loading || posting) && <CustomLoader />}
      <div
        style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
        className="overflow-x-auto overflow-y-auto rounded-md w-full h-[90vh] border border-gray-200"
      >
        <table className="text-sm text-left w-full">
          <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
            <tr>
              <th className="py-2 px-2 text-center">Select</th>
              <th className="py-2 px-2 text-center">Object code</th>
              <th className="py-2 px-2 text-center">Object name</th>
              <th className="py-2 px-2 text-center">Num at card</th>
              <th className="py-2 px-6 whitespace-nowrap text-center">
                Card code
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
                Applied sum
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                transid
              </th>
              <th className="py-2 px-2 whitespace-nowrap text-center">
                Shop code
              </th>
            </tr>
          </thead>
          <tbody>
            {postData?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={!!item.isChecked}
                    onChange={(e) => handleCheck(idx, e.target.checked)}
                  />
                </td>

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

                {/* Applied sum input — controlled */}
                <td className="px-1 border-x-1 text-center border-gray-200">
                  <input
                    type="number"
                    className="outline-none text-right w-24"
                    onChange={(e) => {
                      const value =
                        Number(e.target.value.replace(",", ".")) || 0;
                      setPostData((prev) => {
                        if (!prev) return prev; // safety
                        const next = [...prev];
                        next[idx] = { ...next[idx], appliedSum: value };
                        return next;
                      });
                    }}
                  />
                </td>

                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.transId}
                </td>
                <td className="px-1 border-x-1 text-center border-gray-200">
                  {item.shopCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 h-full mt-4 ">
        <div className="w-full">
          <p
            onClick={() => {
              setPartnersModalVisible(true);
            }}
            className="text-[16px]"
          >
            {partnerData?.cardName ? partnerData.cardName : "Выберите клиент "}
          </p>
        </div>
        <div className="flex justify-between gap-4 items-center">
          <div className="flex justify-between gap-4 items-center ">
            <div className="flex items-center gap-4">
              <input
                id="activeAccount"
                className="text-[16px]"
                type="checkbox"
                checked={activeAccount}
                onChange={(e) => setActiveAccount(e.target.checked)}
              />
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
          </div>
          <div className="flex gap-4 items-center">
            <p className="text-[16px] min-w-12">Total: {total}</p>
            <button onClick={handleSubmit} disabled={posting}>
              Otpravit
            </button>
          </div>
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

      {/* PARTNERS DATA */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: partnersModalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setPartnersModalVisible(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>

              <div className="w-full">
                <input
                  onChange={(e) => {
                    setPartnersQ(e.target.value);
                    setTyping(true);
                  }}
                  type="search"
                  placeholder="Поиск..."
                  className="w-full border rounded-md border-gray-300 px-2 py-2 outline-none"
                />

                {partnersData ? (
                  <div
                    ref={listRef}
                    style={{
                      scrollbarColor: "transparent",
                      scrollbarWidth: "none",
                    }}
                    className="overflow-y-scroll h-[75vh] divide-y-0"
                  >
                    {partnersData?.data.businessPartners.map(
                      (item: businesParters) => (
                        <div
                          onClick={() => {
                            setPartnerData(item);
                            setPartnersModalVisible(false);
                          }}
                          key={item.cardCode}
                          className="m-2 gap-4 border-b border-gray-300 cursor-pointer flex items-center"
                        >
                          <p>{item.cardCode}</p>
                          <p>-</p>
                          <p>{item.cardName}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{ display: partnersLoading ? "flex" : "none" }}
                    className="relative h-[75vh] flex justify-center items-center"
                  >
                    <RotateLoader color="black" speedMultiplier={0.8} />
                  </div>
                )}

                {partnersData && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      aria-label="Previous page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() => setPartnersPage((p) => Math.max(1, p - 1))}
                      disabled={partnersPage === 1}
                    >
                      ‹
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-md tabular-nums">
                      <span>{partnersPage}</span>
                      <span>/</span>
                      <span>{totalPages}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Next page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() =>
                        setPartnersPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={partnersPage === totalPages}
                    >
                      ›
                    </button>
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
