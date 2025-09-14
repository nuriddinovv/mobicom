import { useEffect, useRef, useState } from "react";
import useFetch from "../api/useFetch";
import { JournalEntriesApi } from "../api/get";
import { formatDate } from "../utils/formatDate";
import CustomLoader from "../components/CustomLoader";
import { postJournalEntryCancel } from "../api/post";
import { SyncLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function AccountingTransactionHistory() {
  const sessionId = sessionStorage.getItem("sessionId");
  const { loading, error, data, refetch } = useFetch(() =>
    JournalEntriesApi({ Page: page, Q: q, DateFrom: dateFrom, DateTo: dateTo })
  );

  const {
    loading: cancelLoading,
    error: cancelError,
    data: cancelData,
    refetch: runCancel,
  } = useFetch(
    () =>
      postJournalEntryCancel({
        id: selectedJdtNum!,
        sessionId: sessionId ?? "",
      }),
    false
  );

  const CancelPayment = async () => {
    try {
      if (!sessionId) return toast.error("Сессия не найдена");
      await runCancel();

      if (cancelData && cancelData.status !== "success") {
        const msg =
          cancelData?.error?.message || "Не удалось отменить документ";
        throw new Error(msg);
      }
      toast.success("Отменено");
      setModalVisible(false);
      if (page !== 1) setPage(1);
      else refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Произошла ошибка");
    }
  };

  const [selectedJdtNum, setSelectedJdtNum] = useState<number>();

  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // PAGES and q
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotalPages(data?.data.totalPages || 10);
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
      refetch();
    }
  }, [typing, q]);
  useEffect(() => {
    if (q === "") {
      refetch();
    }
  }, [q]);
  useEffect(() => {
    setPage(1);
    refetch();
  }, [dateFrom, dateTo]);

  // Paging scroll top
  useEffect(() => {
    refetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="p-4">
      {loading && <CustomLoader />}
      <h1 className="text-3xl font-bold text-center">История</h1>
      <div className="grid grid-cols-6 gap-4 my-4">
        <input
          type="search"
          onChange={(e) => {
            setQ(e.target.value);
            setTyping(true);
          }}
          className="w-full border rounded-md border-slate-300 p-1 text-sm outline-none col-span-4"
          placeholder="search"
        />
        <div className="flex p-1 items-center justify-between gap-2 border rounded-md border-slate-300">
          <p>....от: </p>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value.toString());
            }}
            className="w-fit p-1 text-sm outline-none"
            placeholder="Дата"
          />
        </div>
        <div className="flex p-1 items-center justify-between gap-2 border rounded-md border-slate-300">
          <p>....до: </p>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value.toString());
            }}
            className="w-fit p-1 text-sm outline-none"
            placeholder="Дата"
          />
        </div>
      </div>

      <div
        className="h-[75vh] overflow-y-auto border rounded-md overflow-hidden border-slate-300"
        style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
      >
        <table className="w-full table-fixed text-sm">
          {/* Ustun kengliklari — kerak bo'lsa pxlarni o'zingiz moslang */}
          <colgroup>
            <col className="max-w-[240px] min-w-[150px]" /> {/* Дата */}
            <col className="max-w-[240px] min-w-[150px]" /> {/* jdt Num */}
            <col className="max-w-[240px] min-w-[150px]" /> {/* Сумма UZS */}
            <col className="max-w-[240px] min-w-[150px]" /> {/* Сумма USD */}
            <col /> {/* Description (qolgan joy) */}
            <col className="max-w-[240px] min-w-[150px]" /> {/* Action */}
          </colgroup>

          <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
            <tr>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Дата
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                jdt Num
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Сумма UZS
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Сумма USD
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Description
              </th>
              <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="min-h-[70vh]">
            {data?.data.journalEntries.map((item, i) => (
              <tr key={item.jdtNum ?? i}>
                <td className="border border-slate-300 p-2 text-center whitespace-nowrap">
                  {formatDate(item.referenceDate)}
                </td>
                <td className="border border-slate-300 p-2 text-center whitespace-nowrap">
                  {item.jdtNum}
                </td>
                <td className="border border-slate-300 p-2 text-right whitespace-nowrap">
                  {item.docTotalFC.toLocaleString()} UZS
                </td>
                <td className="border border-slate-300 p-2 text-right whitespace-nowrap">
                  {item.docTotal.toLocaleString()} USD
                </td>
                <td className="border border-slate-300 p-2">
                  <div className="truncate" title={item.memo}>
                    {item.memo}
                  </div>
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  <button
                    onClick={() => {
                      setModalVisible(true);
                      setSelectedJdtNum(item.jdtNum);
                    }}
                    className="cursor-pointer"
                  >
                    <svg
                      className="w-8"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      color="#FF0000"
                    >
                      <path
                        fill="currentColor"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-2">
        <button
          type="button"
          aria-label="Previous page"
          className="px-4 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white transition-colors"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          ›
        </button>
      </div>
      {/* Confirm modal */}
      <div className="relative flex justify-center items-center">
        <div
          style={{
            display: modalVisible ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
          className="w-full h-full top-0 fixed"
        >
          <div className="2xl:container w-[100vw] h-[100vh] mx-auto flex justify-center items-center">
            <div className="relative bg-white p-4">
              <div className="w-full">
                <p className="text-xl text-center">
                  Вы действительно хотите отменить?
                </p>
              </div>
              <div className="my-4 w-full gap-4 flex items-center justify-center">
                <button
                  disabled={cancelLoading}
                  onClick={CancelPayment}
                  className="p-1 bg-green-500 text-white rounded-md px-4 w-full cursor-pointer"
                >
                  {cancelLoading ? (
                    <SyncLoader size={8} color="#fff" speedMultiplier={0.7} />
                  ) : (
                    "Да"
                  )}
                </button>
                <button
                  onClick={() => setModalVisible(false)}
                  className="p-1 bg-red-500 text-white rounded-md px-4 w-full cursor-pointer"
                >
                  Нет
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
