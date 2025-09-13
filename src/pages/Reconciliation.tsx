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
        docLine: x.docLine,
        transId: x.transId,
        cardCode: x.cardCode,
        creditOrDebit: x.creditOrDebit,
      }));

    return {
      docTotal: activeAccount ? total : null,
      account: activeAccount ? account?.acctCode : null,
      docDate: todayStr(),
      cardCode: partnerData?.cardCode ?? "",
      paymentInvoices: invoices,
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
  }, [partnerData?.cardCode]);

  // 2) data yangilanganda - postData'ni to'ldirish (default fieldlar bilan)
  useEffect(() => {
    if (data?.data) {
      setPostData(
        data.data.map((row: reconciliation) => ({
          ...row,
          isChecked: row.isChecked ?? false,
          appliedSum: row.openSum ?? 0,
        }))
      );
    }
  }, [data]);
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
  }, [partnersPage, partnersModalVisible]);
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
    const payload = buildPayload();
    try {
      setPosting(true);
      await postReconciliation({ payload: payload, sessionId: sessionId });
      toast.success("Success");
      setAccount();
      setPostData();
      setPartnerData();
      setActiveAccount(false);
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
            {partnerData?.cardCode &&
              postData?.map((item, idx) => (
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
                      type="text"
                      className="outline-none text-right w-24"
                      defaultValue={item.appliedSum.toString()}
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
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setPartnersModalVisible(true)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-[16px] leading-tight"
        >
          {partnerData?.cardName || "Выберите клиент"}
        </button>

        {/* O'ng panel: hisob + total + yuborish */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Hisob tanlash + checkbox */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
            <label htmlFor="activeAccount" className="flex items-center gap-2">
              <input
                id="activeAccount"
                type="checkbox"
                checked={activeAccount}
                onChange={(e) => setActiveAccount(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-700"
              />
              <span className="text-[16px]">Счёт</span>
            </label>

            <button
              type="button"
              onClick={() => setChartsModalVisible(true)}
              className="truncate text-[16px] underline-offset-4"
              title={account?.acctName || "Выберите счёт"}
            >
              {account?.acctName || "Выберите счёт"}
            </button>
          </div>

          {/* Total + Yuborish */}
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <p className="min-w-0 truncate text-[16px]">
              <span className="">Total:</span> {total}
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={posting}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-[16px] leading-tight transition cursor-pointer"
            >
              Отправить
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
