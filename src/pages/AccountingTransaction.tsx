import { useEffect, useRef, useState } from "react";
import useFetch from "../api/useFetch";
import { BusinessPartnersApi, ChartOfAccountsApi, ShopsApi } from "../api/get";
import { useNavigate } from "react-router-dom";
import type {
  accountingTransaction,
  businesParters,
  chartOfAccountsResponse,
  journalEntryLines,
  shop,
} from "../interfaces";
import { RotateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { JournalEntryApi } from "../api/post";

export default function AccountingTransaction() {
  const sessionId = sessionStorage.getItem("sessionId");
  const CurrentExchangeRate = localStorage.getItem("CurrentExchangeRate");
  const navigate = useNavigate();

  // Kursni xavfsiz raqamga aylantiramiz
  const rateRaw = Number(CurrentExchangeRate);
  const rate = Number.isFinite(rateRaw) && rateRaw > 0 ? rateRaw : 1;

  const [accountingTransaction, setAccountingTransaction] =
    useState<accountingTransaction>({
      memo: "",
      referenceDate: "",
      shopCode: "",
      journalEntryLines: [],
    });
  const [journalEntryLines, setJournalEntryLines] = useState<
    journalEntryLines[]
  >([]);
  const [selectedShop, setSelectedShop] = useState<shop>();
  const [memo, setMemo] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const handleSubmit = async () => {
    try {
      if (!journalEntryLines || journalEntryLines.length === 0) {
        return toast.error("Выберите cчет или клиента !");
      }
      if (!selectedShop) {
        return toast.error("Выберите магазин !");
      }
      const sanitizedLines = journalEntryLines.map(
        ({ accountName, ...rest }) => rest
      );
      const payload: accountingTransaction = {
        ...accountingTransaction,
        memo,
        referenceDate: accountingTransaction.referenceDate,
        shopCode: selectedShop.shopCode,
        journalEntryLines: sanitizedLines,
      };
      console.log("POST payload:", payload);
      setPostLoading(true);
      // 2) POST bevosita payload bilan
      const json = await JournalEntryApi(payload, sessionId);

      toast.success("Success");
      setAccountingTransaction({
        memo: "",
        referenceDate: "",
        shopCode: "",
        journalEntryLines: [],
      });
      setMemo("");
      setJournalEntryLines([]);
      setSelectedShop(undefined);

      console.log("Server:", json);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Произошла ошибка");
    } finally {
      setPostLoading(false);
    }
  };

  // SET SHOP in ACCTR
  useEffect(() => {
    if (selectedShop) {
      setAccountingTransaction((prev) => ({
        ...prev,
        shopCode: selectedShop.shopCode,
      }));
    }
  }, [selectedShop]);

  // MODALS
  const [partnersModalVisible, setPartnersModalVisible] =
    useState<boolean>(false);
  const [chOfAccModalVisible, setChOfAccModalVisible] =
    useState<boolean>(false);
  const [shopModalVisible, setShopModalVisible] = useState<boolean>(false);

  // Search/pagination (modallarda)
  const [chartQ, setChartQ] = useState("");
  const [partnersQ, setPartnersQ] = useState("");

  const [typing, setTyping] = useState(false);
  const [partnersPage, setPartnersPage] = useState(1);
  const [shopPage, setShopPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const listRef = useRef<HTMLDivElement>(null);

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

  // Type-to-search debounce
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 700);
    return () => clearTimeout(t);
  }, [typing]);

  // q o‘zgarsa refetch
  useEffect(() => {
    if (!typing && chartQ !== "") chartRefetch();
  }, [typing, chartQ]);

  useEffect(() => {
    if (!typing && partnersQ !== "") {
      setPartnersPage(1);
      partnersRefetch();
    }
  }, [typing, partnersQ]);

  // q bo‘sh bo‘lsa ham ro‘yxatni yangilab turish
  useEffect(() => {
    if (chartQ === "") chartRefetch();
  }, [chartQ, chOfAccModalVisible]);

  useEffect(() => {
    if (partnersQ === "") partnersRefetch();
  }, [partnersQ, partnersModalVisible]);

  // Paging scroll top
  useEffect(() => {
    partnersRefetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [partnersPage]);

  useEffect(() => {
    shopRefetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [shopPage]);

  useEffect(() => {
    if (partnersData?.data?.totalPages) {
      setTotalPages(partnersData.data.totalPages);
    } else if (shopData?.data?.totalPages) {
      setTotalPages(shopData.data.totalPages);
    }
  }, [partnersData, shopData]);

  // UZS to USD
  const handleChangeDebitUZS = (rowIndex: number, uzs: number) => {
    setJournalEntryLines((prev) =>
      prev.map((line, i) =>
        i === rowIndex
          ? { ...line, fcdebit: uzs, debit: Number((uzs / rate).toFixed(2)) }
          : line
      )
    );
  };
  const handleChangeCreditUZS = (rowIndex: number, uzs: number) => {
    setJournalEntryLines((prev) =>
      prev.map((line, i) =>
        i === rowIndex
          ? { ...line, fccredit: uzs, credit: Number((uzs / rate).toFixed(2)) }
          : line
      )
    );
  };

  // USD
  const handleChangeDebitUSD = (rowIndex: number, usd: number) => {
    setJournalEntryLines((prev) =>
      prev.map((line, i) => (i === rowIndex ? { ...line, debit: usd } : line))
    );
  };
  const handleChangeCreditUSD = (rowIndex: number, usd: number) => {
    setJournalEntryLines((prev) =>
      prev.map((line, i) => (i === rowIndex ? { ...line, credit: usd } : line))
    );
  };

  // ADD JournalEntryLines
  const addChart = (item: chartOfAccountsResponse) => {
    setJournalEntryLines((prev) => [
      ...prev,
      {
        accountCode: item.acctCode,
        accountName: item.acctName,
        bplid: 1,
        credit: 0,
        debit: 0,
        fccredit: 0,
        fcdebit: 0,
        shortName: item.acctCode,
      },
    ]);
  };
  const addPartner = (item: businesParters) => {
    setJournalEntryLines((prev) => [
      ...prev,
      {
        accountCode: null,
        accountName: item.cardName,
        bplid: 1,
        credit: 0,
        debit: 0,
        fccredit: 0,
        fcdebit: 0,
        shortName: item.cardCode,
      },
    ]);
  };

  return (
    <div className="p-4 ">
      <h1 className="text-3xl font-bold mb-4 pt-4 text-center">
        Бухгалтерская операция
      </h1>

      <div className="grid grid-cols-5 gap-4 my-4">
        <input
          type="date"
          onChange={(e) => {
            setAccountingTransaction((prev) => ({
              ...prev,
              referenceDate: e.target.value.toString(),
            }));
          }}
          className="w-full border rounded-md p-1 text-sm outline-none"
          placeholder="Дата"
        />
        <input
          readOnly
          className="w-full border rounded-md p-1 text-sm outline-none"
          placeholder="ссылка 1"
        />
        <input
          className="w-full border rounded-md p-1 text-sm outline-none"
          placeholder="ссылка 2"
        />
        <input
          readOnly
          className="w-full border rounded-md p-1 text-sm outline-none"
          placeholder="ссылка 3"
        />
        <input
          type="text"
          onClick={() => {
            setShopModalVisible(true);
          }}
          readOnly
          className="w-full border rounded-md p-1 text-sm outline-none"
          placeholder={
            selectedShop?.shopName ? selectedShop.shopName : "Выберите магазин"
          }
        />
      </div>

      <div
        className="h-[70vh] overflow-y-auto"
        style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
      >
        <table className="text-sm text-left w-full">
          <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
            <tr>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                No
              </th>
              <th className="py-2 border-x border-slate-300 whitespace-nowrap flex items-center">
                <button
                  onClick={() => setPartnersModalVisible(true)}
                  className="cursor-pointer w-full border-r px-2"
                >
                  Счет ГК
                </button>
                <button
                  onClick={() => setChOfAccModalVisible(true)}
                  className="cursor-pointer w-full  border-l px-2"
                >
                  Счет ГК
                </button>
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Наименование счета ГК/БП
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Дебет UZS
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Кредит UZS
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-6 whitespace-nowrap ">
                Дебет USD
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-4 ">
                Кредит USD
              </th>
            </tr>
          </thead>

          <tbody className="overflow-y-auto min-h-[70vh]">
            {journalEntryLines?.map((item, i) => (
              <tr
                key={`${item.shortName}-${i}`}
                className="bg-white border-b border-gray-200"
              >
                <th className="text-center">{i + 1}</th>

                <td className="px-1 text-[16px] border-x-1 border-gray-200 ">
                  {item.shortName}
                </td>

                <td className="px-1 text-[16px] border-x-1 border-gray-200 ">
                  {item.accountName}
                </td>

                {/* ДЕБЕТ UZS */}
                <td className="px-1 text-[16px] border-x-1 border-gray-200 text-right">
                  <input
                    value={item.fcdebit ?? 0}
                    onChange={(e) =>
                      handleChangeDebitUZS(i, Number(e.target.value))
                    }
                    type="number"
                    step="any"
                    className="w-full text-right outline-none"
                  />
                </td>

                {/* КРЕДИТ UZS */}
                <td className="px-1 text-[16px] border-x-1 border-gray-200 text-right">
                  <input
                    value={item.fccredit ?? 0}
                    onChange={(e) =>
                      handleChangeCreditUZS(i, Number(e.target.value))
                    }
                    type="number"
                    step="any"
                    className="w-full text-right outline-none"
                  />
                </td>

                {/* ДЕБЕТ USD */}
                <td className="px-1 text-[16px] border-x-1 border-gray-200 text-right">
                  <input
                    value={item.debit ?? 0}
                    onChange={(e) =>
                      handleChangeDebitUSD(i, Number(e.target.value))
                    }
                    type="number"
                    step="any"
                    className="w-full text-right outline-none"
                  />
                </td>

                {/* КРЕДИТ USD */}
                <td className="px-1 text-[16px] border-x-1 border-gray-200 text-right">
                  <input
                    value={item.credit ?? 0}
                    onChange={(e) =>
                      handleChangeCreditUSD(i, Number(e.target.value))
                    }
                    type="number"
                    step="any"
                    className="w-full text-right outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="">
        <button onClick={handleSubmit}>press</button>
      </div>

      {/* MODALS */}
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
                            addPartner(item);
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
      {/* CHARTOFACCOUNTS DATA */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: chOfAccModalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed sticky-0"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4 w-[560px]">
              <div className="w-full justify-end flex mb-4">
                <button
                  onClick={() => setChOfAccModalVisible(false)}
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
                          addChart(item);
                          setChOfAccModalVisible(false);
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
                    style={{ display: partnersLoading ? "flex" : "none" }}
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
