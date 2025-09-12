import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import useFetch from "../../api/useFetch";
import CustomLoader from "../../components/CustomLoader";
import { formatDate } from "../../utils/formatDate";
import {
  BusinessPartnersApi,
  ChartOfAccountsApi,
  PaymentOpenApi,
  ShopsApi,
} from "../../api/get";
import type {
  businesParters,
  chartOfAccountsResponse,
  PaymentInvoices,
  shop,
} from "../../interfaces";
import toast from "react-hot-toast";
import { RotateLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

// ------------------ Helpers ------------------
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const calcTotals = (invoices: PaymentInvoices[], exRate: number) => {
  const checked = invoices.filter((x) => x.isChecked);
  const acc = checked.reduce(
    (t, it) => {
      const amt = Number(it.appliedSum) || 0;
      if (it.currency === "USD") t.usd += amt;
      else if (it.currency === "UZS") t.uzs += amt;
      return t;
    },
    { usd: 0, uzs: 0 }
  );
  const usdFromUZS = acc.uzs / exRate;
  const usdTotal = acc.usd + usdFromUZS;
  const uzsTotal = usdTotal * exRate;
  return { totalUSD: usdTotal, totalUZS: uzsTotal };
};

const buildPayload = (args: {
  shopCode: string;
  base: businesParters | null;
  invoices: PaymentInvoices[];
  totals: { totalUSD: number; totalUZS: number };
  date: string;
  currency: "USD" | "UZS" | string;
  acctCode: string;
  exRate: number;
}) => {
  const { base, invoices, totals, date, currency, acctCode, exRate, shopCode } =
    args;
  const selected = invoices
    .filter((x) => x.isChecked)
    .map((it) => {
      const { isChecked, ...rest } = it; // isChecked'ni jo'natmaymiz
      return {
        ...rest,
        appliedSum: Number(it.appliedSum) || 0,
      };
    });

  if (!base) throw new Error("Partner data is required");

  return {
    docType: "C",
    canceled: false,
    docDate: date,
    cardCode: base.cardCode,
    cardName: base.cardName,
    account: acctCode,
    noDocSum: 0,
    noDocSumFC: 0,
    payNoDoc: false,
    comments: null,
    docTotal: Number(totals.totalUSD.toFixed(2)),
    docTotalFC: Math.round(totals.totalUZS),
    docCurrency: currency,
    docRate: exRate,
    paymentInvoices: selected,
    shopCode: shopCode,
  };
};

const postInPayment = async (payload: any, sessionId: string | null) => {
  const res = await fetch("/api/InPayments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Session-Id": sessionId ?? "",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const msg =
      json?.error?.message || json?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json ?? { ok: true };
};
// ---------------- /Helpers --------------------

export default function AddIncomingPayment() {
  // ------- Local storages -------
  const sessionId = sessionStorage.getItem("sessionId");
  const CurrentExchangeRate = localStorage.getItem("CurrentExchangeRate");
  const navigate = useNavigate();
  // Kursni son qilib oling (masalan "13 000 UZS" bo‘lsa ham)
  const exRate = useMemo(() => {
    const n = Number(
      String(CurrentExchangeRate ?? "0").replace(/[^\d.-]/g, "")
    );
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [CurrentExchangeRate]);

  // ------- UI state -------
  const [paymentInvoices, setPaymentInvoices] = useState<PaymentInvoices[]>([]);
  const [partnerData, setPartnerData] = useState<businesParters | null>(null);
  const [currency, setCurrency] = useState<string>("UZS");
  const [date, setDate] = useState<string>(todayStr());
  const [acctCode, setAcctCode] = useState<string>("");
  const [acctName, setAcctName] = useState<string>("");

  // Draft qiymatlar (input ichidagi matnni tez saqlash uchun)
  const [draftValues, setDraftValues] = useState<Record<number, string>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [chartOfAccountsModalVisible, setChartModalVisible] = useState(false);

  // Search/pagination (modallarda)
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);
  // ------- API calls -------
  const { loading, error, data, refetch } = useFetch(
    () => PaymentOpenApi({ CardCode: partnerData?.cardCode || "" }),
    false
  );

  const {
    error: ChartError,
    data: ChartData,
    refetch: chartRefetch,
  } = useFetch(() =>
    ChartOfAccountsApi({
      Query: q,
      sessionId: sessionId || "123",
      Curr: currency,
    })
  );

  useEffect(() => {
    chartRefetch();
  }, [currency]);

  const {
    error: PartnersError,
    data: PartnersData,
    loading: PartnersLoading,
    refetch: partnersRefetch,
  } = useFetch(() =>
    BusinessPartnersApi({
      Query: q,
      sessionId: sessionId || "123",
      Page: page,
    })
  );

  useEffect(() => {
    setTotalPages(PartnersData?.data.totalPages || 10);
  }, [data]);

  // Partner tanlansa — ochiq invoice’larni olamiz
  useEffect(() => {
    if (partnerData?.cardCode) refetch();
  }, [partnerData]);

  // Invoicelar keldi
  useEffect(() => {
    if (data?.data) {
      setPaymentInvoices(data.data);
      setDraftValues({});
    }
  }, [data]);

  // Type-to-search debounce (faqat q inputi uchun)
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 700);
    return () => clearTimeout(t);
  }, [typing]);

  // q o‘zgarsa refetch
  useEffect(() => {
    if (!typing && q !== "") {
      setPage(1);
      partnersRefetch();
      chartRefetch();
    }
  }, [typing, q]);

  // q bo‘sh bo‘lsa ham ro‘yxatni yangilab turamiz
  useEffect(() => {
    if (q === "") {
      partnersRefetch();
      chartRefetch();
    }
  }, [q]);

  // Paging scroll top
  useEffect(() => {
    partnersRefetch();

    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Totals (faqat isChecked) — tez ishlashi uchun exRate ni son sifatida uzatdik
  const computedTotals = useMemo(
    () => calcTotals(paymentInvoices, exRate),
    [paymentInvoices, exRate]
  );
  const [useAutoTotals, setUseAutoTotals] = useState(true);
  const [manualTotalUSD, setManualTotalUSD] = useState(""); // raw string
  const [manualTotalUZS, setManualTotalUZS] = useState("");

  const usdInputValue = useAutoTotals
    ? computedTotals.totalUSD.toFixed(2)
    : manualTotalUSD;
  const uzsInputValue = useAutoTotals
    ? Math.round(computedTotals.totalUZS).toString()
    : manualTotalUZS;

  const totalsForPayload = useMemo(() => {
    if (useAutoTotals)
      return {
        totalUSD: computedTotals.totalUSD,
        totalUZS: computedTotals.totalUZS,
      };
    const usd = Number(manualTotalUSD.replace(",", ".")) || 0;
    const uzs = Math.round(Number(manualTotalUZS.replace(/[^\d.-]/g, "")) || 0);
    return { totalUSD: Math.round(usd * 100) / 100, totalUZS: uzs };
  }, [useAutoTotals, computedTotals, manualTotalUSD, manualTotalUZS]);

  const onUsdChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    setUseAutoTotals(false); // manualga o'tish
    setManualTotalUSD(raw);
    const n = Number(raw.replace(",", "."));
    if (Number.isFinite(n)) {
      setManualTotalUZS(String(Math.round(n * exRate)));
    } else {
      setManualTotalUZS("");
    }
  };
  const onUzsChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/\s/g, "");
    setUseAutoTotals(false); // manualga o'tish
    setManualTotalUZS(raw);
    const n = Number(raw.replace(",", "."));
    if (Number.isFinite(n) && exRate > 0) {
      setManualTotalUSD((n / exRate).toFixed(2));
    } else {
      setManualTotalUSD("");
    }
  };

  const onUsdBlur = () => {
    if (manualTotalUSD === "") return;
    const n = Number(manualTotalUSD.replace(",", "."));
    if (Number.isFinite(n))
      setManualTotalUSD((Math.round(n * 100) / 100).toFixed(2));
  };
  const onUzsBlur = () => {
    if (manualTotalUZS === "") return;
    const n = Number(manualTotalUZS.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) setManualTotalUZS(String(Math.round(n)));
  };
  useEffect(() => {
    if (!useAutoTotals) {
      setUseAutoTotals(true);
      setManualTotalUSD("");
      setManualTotalUZS("");
    }
  }, [paymentInvoices]);

  // ------- Submit -------
  const [postLoading, setPostLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!acctCode) return toast.error("Выберите cчет !");
      if (!partnerData) return toast.error("Выберите партнера !");
      if (!selectedShop) return toast.error("Выберите магазин !");

      const selected = paymentInvoices.filter((x) => x.isChecked);
      const payload = buildPayload({
        shopCode: selectedShop?.shopCode,
        base: partnerData,
        invoices: selected,
        totals: totalsForPayload,
        date,
        currency,
        acctCode,
        exRate,
      });

      setPostLoading(true);
      const json = await postInPayment(payload, sessionId);
      toast.success("Success");
      // reset
      setPaymentInvoices([]);
      setPartnerData(null);
      setAcctCode("");
      setAcctName("");
      setQ("");
      setPage(1);
      setDraftValues({});
      setSelectedShop();
      console.log("Server:", json);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Произошла ошибка");
    } finally {
      setPostLoading(false);
    }
  };

  // ------- Error toasts -------
  useEffect(() => {
    if (error) toast.error(data?.error?.message || "Произошла ошибка");
  }, [error, data]);
  useEffect(() => {
    if (PartnersError) toast.error("Произошла ошибка - BusinessPartners");
  }, [PartnersError]);
  useEffect(() => {
    if (ChartError) toast.error("Счетлар ro'yxatini olishda xatolik");
  }, [ChartError]);

  // ------- Handlers (tezlik uchun optimallashtirilgan) -------
  const handleCheck = (idx: number, checked: boolean) => {
    startTransition(() => {
      setPaymentInvoices((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], isChecked: checked };
        return next;
      });
    });
  };

  // Input ichida yozish — faqat draft stringni yangilaymiz (hech narsa clamp qilmaymiz)
  const handleDraftChange = (id: number, raw: string) => {
    setDraftValues((prev) => ({ ...prev, [id]: raw }));
  };

  // Blur/Enter — son qilib clamp + state’ga qo‘llaymiz (startTransition bilan)
  const commitDraft = (
    idx: number,
    id: number,
    minVal: number,
    maxVal: number
  ) => {
    const raw = draftValues[id];
    const n = raw === "" || raw == null ? 0 : Number(raw.replace(",", "."));
    const clamped = Number.isFinite(n) ? clamp(n, minVal, maxVal) : 0;

    startTransition(() => {
      setPaymentInvoices((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], appliedSum: clamped };
        return next;
      });
      setDraftValues((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    });
  };

  // SHOP
  const [shopModalVisible, setShopModalVisible] = useState<boolean>(false);
  const [selectedShop, setSelectedShop] = useState<shop>();
  const {
    error: shopError,
    data: shopData,
    loading: shopLoading,
    refetch: shopRefetch,
  } = useFetch(
    () =>
      ShopsApi({
        Page: shopPage,
      }),
    false
  );
  const [shopPage, setShopPage] = useState(1);

  useEffect(() => {
    if (shopData?.data?.totalPages) {
      setTotalPages(shopData.data.totalPages);
    }
  }, [shopData]);
  useEffect(() => {
    shopRefetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [shopPage]);

  return (
    <div className="p-4">
      {(loading || postLoading) && <CustomLoader />}

      <div className="grid grid-cols-4">
        {/* LEFT */}
        <div className="col-span-3 h-[95vh] border border-r-0 rounded-l-md">
          <p className="bg-slate-200 py-1 text-xl text-center rounded-tl-md">
            Bходящий платежи
          </p>

          <div className="grid grid-cols-8 p-1 gap-2">
            <div className="flex flex-col col-span-3 gap-1">
              <div className="flex items-center gap-1 w-full">
                <p className="text-sm w-full">Код</p>
                <input
                  type="text"
                  readOnly
                  value={partnerData?.cardCode ?? ""}
                  onClick={() => setModalVisible(true)}
                  className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1 w-full">
                <p className="text-sm w-full">Название</p>
                <input
                  type="text"
                  readOnly
                  value={partnerData?.cardName ?? ""}
                  className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                />
              </div>
            </div>

            {/* Agar kerak bo‘lsa qayta yoqing
            <div className="col-span-2 mx-auto">
              <PartyType value={type} onChange={setType} />
            </div> */}

            <div className="flex flex-col col-span-3 gap-1">
              <div className="flex items-center gap-6 w-full">
                <p className="text-sm w-full">#</p>
                <input
                  type="text"
                  className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                />
              </div>
              <div className="flex items-center gap-6 w-full">
                <p className="text-sm w-full">Дата регистрации</p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="p-1">
            <div className="overflow-x-auto overflow-y-auto rounded-md w-full h-[50vh] border border-gray-200">
              <table className="text-sm text-left w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
                  <tr>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Выбрано
                    </th>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Номер документа
                    </th>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Тип документа
                    </th>
                    <th className="py-2 px-6 whitespace-nowrap text-center">
                      Дата
                    </th>
                    <th className="py-2 px-4 whitespace-nowrap text-center">
                      Итого
                    </th>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Открытая сумма
                    </th>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Сумма платежа
                    </th>
                    <th className="py-2 px-2 whitespace-nowrap text-center">
                      Валюта
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paymentInvoices?.map((item, idx) => {
                    const absOpen = Math.abs(Number(item.openSum) || 0);
                    const minVal = -absOpen; // manfiy ruxsat
                    const maxVal = absOpen;
                    const idKey = item.invoiceDocEntry; // draft map uchun kalit
                    const shownValue =
                      draftValues[idKey] ?? (item.appliedSum ?? "").toString();

                    return (
                      <tr
                        key={item.invoiceDocEntry}
                        className="bg-white border-b border-gray-200"
                      >
                        <th className="text-center">
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={!!item.isChecked}
                            onChange={(e) => handleCheck(idx, e.target.checked)}
                          />
                        </th>
                        <td className="px-1 border-x text-center border-gray-200">
                          {item.invoiceDocNum}
                        </td>
                        <td className="px-1 border-x text-center border-gray-200">
                          {item.objectCode}
                        </td>
                        <td className="px-1 border-x border-gray-200 text-right">
                          {formatDate(item.invoiceDate)}
                        </td>
                        <td className="px-1 border-x border-gray-200 text-center">
                          {item.invoiceTotal}
                        </td>
                        <td className="px-1 border-x border-gray-200 text-center">
                          {item.openSum}
                        </td>
                        <td className="px-1 border-x text-right">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            className="outline-none text-right w-24"
                            min={minVal}
                            max={maxVal}
                            value={shownValue}
                            onChange={(e) => {
                              // faqat draftni yangilaymiz -> lag yo‘q
                              handleDraftChange(idKey, e.target.value);
                            }}
                            onBlur={() => {
                              // blurda clamp qilib massivga yozamiz
                              commitDraft(idx, idKey, minVal, maxVal);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </td>
                        <td className="px-1 border-x border-gray-200 text-right">
                          {item.currency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 py-2">
              <div className="flex flex-col col-span-1 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Сумма к оплате (USD)</p>
                  <input
                    type="text"
                    value={usdInputValue}
                    onChange={onUsdChange}
                    onBlur={onUsdBlur}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-right"
                  />
                </div>

                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Сумма к оплате (UZS)</p>
                  <input
                    type="text"
                    value={uzsInputValue}
                    onChange={onUzsChange}
                    onBlur={onUzsBlur}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-right"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center w-full justify-end">
              <button
                onClick={handleSubmit}
                disabled={postLoading}
                className="border py-1 px-2 rounded-md cursor-pointer disabled:opacity-50"
              >
                OK
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border py-1 px-2 rounded-md cursor-pointer"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-1 h-[95vh] border rounded-r-md">
          <p className="bg-slate-200 py-1 text-xl text-center rounded-tr-md">
            Методы платежа
          </p>
          <div className="p-1">
            <div className="flex flex-col col-span-1 gap-1">
              <div className="flex items-center gap-1 w-full">
                <p className="text-sm w-full">Валюта</p>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border w-full text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex items-center gap-1 w-full">
                <p className="text-sm w-full">Курс</p>
                <input
                  type="text"
                  readOnly
                  value={`${exRate} UZS`}
                  className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-end"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 w-full">
              <button
                onClick={() => setChartModalVisible(true)}
                className="flex items-center gap-1 w-full py-2"
              >
                <p className="text-sm w-full text-left">Счет: </p>
                <div className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-end">
                  <p className="text-sm w-full text-right">
                    {acctCode} - {acctName}
                  </p>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-1 w-full">
              <button
                onClick={() => setShopModalVisible(true)}
                className="flex items-center gap-1 w-full py-2"
              >
                <p className="text-sm w-full text-left">Магазин: </p>
                <div className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-end">
                  <p className="text-sm w-full text-right">
                    {selectedShop?.shopCode} - {selectedShop?.shopName}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PARTNER MODAL */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: modalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setModalVisible(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>
              <div className="w-full">
                <input
                  onChange={(e) => {
                    setQ(e.target.value);
                    setTyping(true);
                  }}
                  type="search"
                  placeholder="Поиск..."
                  className="w-full border rounded-md border-gray-300 px-2 py-2 outline-none"
                />
                {!PartnersLoading ? (
                  <div
                    ref={listRef}
                    style={{
                      scrollbarColor: "transparent",
                      scrollbarWidth: "none",
                    }}
                    className="overflow-y-scroll h-[75vh] divide-y-0"
                  >
                    {PartnersData?.data.businessPartners.map(
                      (item: businesParters) => (
                        <div
                          onClick={() => {
                            setPartnerData(item);
                            setModalVisible(false);
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
                    style={{ display: PartnersLoading ? "flex" : "none" }}
                    className="relative h-[75vh] flex justify-center items-center"
                  >
                    <RotateLoader color="black" speedMultiplier={0.8} />
                  </div>
                )}
                {PartnersData && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      aria-label="Previous page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      disabled={page === 1}
                    >
                      ‹
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-md tabular-nums">
                      <span>{page}</span>
                      <span>/</span>
                      <span>{totalPages}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Next page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      disabled={page === totalPages}
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

      {/* CHART OF ACCOUNTS MODAL */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: chartOfAccountsModalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setChartModalVisible(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>
              <div className="w-full">
                <input
                  onChange={(e) => {
                    setQ(e.target.value);
                    setTyping(true);
                  }}
                  type="search"
                  placeholder="Поиск..."
                  className="w-full border rounded-md border-gray-300 px-2 py-2 outline-none"
                />
                <div
                  style={{
                    scrollbarColor: "transparent",
                    scrollbarWidth: "none",
                  }}
                  className="overflow-y-scroll h-[75vh] divide-y-0"
                >
                  {ChartData?.map((item: chartOfAccountsResponse) => (
                    <div
                      onClick={() => {
                        setAcctCode(item.acctCode);
                        setAcctName(item.acctName);
                        setChartModalVisible(false);
                      }}
                      key={item.acctCode}
                      className="m-2 border-b border-gray-300 cursor-pointer flex gap-4 items-center"
                    >
                      <p className="w-12">{item.acctCode}</p>
                      <p>—</p>
                      <p>{item.acctName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SHOPS MODAL */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: shopModalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setShopModalVisible(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>

              <div className="w-full">
                {shopData ? (
                  <div
                    ref={listRef}
                    style={{
                      scrollbarColor: "transparent",
                      scrollbarWidth: "none",
                    }}
                    className="overflow-y-scroll h-[75vh] divide-y-0"
                  >
                    {shopData?.data.shops.map((item: shop, i: number) => (
                      <div
                        onClick={() => {
                          setSelectedShop(item);
                          setShopModalVisible(false);
                        }}
                        key={i + 1}
                        className="m-2 gap-4 border-b border-gray-300 cursor-pointer flex items-center"
                      >
                        <p>{item.shopCode}</p>
                        <p>-</p>
                        <p>{item.shopName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{ display: shopLoading ? "flex" : "none" }}
                    className="relative h-[75vh] flex justify-center items-center"
                  >
                    <RotateLoader color="black" speedMultiplier={0.8} />
                  </div>
                )}

                {shopData && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      aria-label="Previous page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() => setShopPage((p) => Math.max(1, p - 1))}
                      disabled={shopPage === 1}
                    >
                      ‹
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-md tabular-nums">
                      <span>{shopPage}</span>
                      <span>/</span>
                      <span>{totalPages}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Next page"
                      className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
                      onClick={() =>
                        setShopPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={shopPage === totalPages}
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
