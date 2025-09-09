import { useEffect, useRef, useState } from "react";
import useFetch from "../api/useFetch";
import { BusinessPartnersApi, ChartOfAccountsApi } from "../api/get";
import { useNavigate } from "react-router-dom";
import type { businesParters } from "../interfaces";
import { RotateLoader } from "react-spinners";

export default function AccountingTransaction() {
  const sessionId = sessionStorage.getItem("sessionId");
  const CurrentExchangeRate = localStorage.getItem("CurrentExchangeRate");
  const navigate = useNavigate();

  const [partnersModalVisible, setPartnersModalVisible] =
    useState<boolean>(false);
  // Search/pagination (modallarda)
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  const {
    error: ChartError,
    data: ChartData,
    refetch: chartRefetch,
  } = useFetch(() =>
    ChartOfAccountsApi({
      Query: q,
      sessionId: sessionId || "123",
      Curr: null,
    })
  );

  useEffect(() => {
    chartRefetch();
  }, []);

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
  return (
    <div className="p-4 ">
      <h1 className="text-3xl font-bold mb-4 pt-4 text-center">
        Бухгалтерская операция
      </h1>
      <div className="grid grid-cols-5 gap-4 my-4">
        <input
          type="date"
          className="w-full border rounded-md p-1 text-sm "
          placeholder="Дата"
        />
        <input
          className="w-full border rounded-md p-1 text-sm "
          placeholder="ссылка 1"
        />
        <input
          className="w-full border rounded-md p-1 text-sm "
          placeholder="ссылка 2"
        />
        <input
          className="w-full border rounded-md p-1 text-sm "
          placeholder="ссылка 3"
        />
        <select name="" id="" className="w-full border rounded-md p-1 text-sm">
          <option value="">Период</option>
          <option value="">Период</option>
          <option value="">Период</option>
          <option value="">Период</option>
        </select>
      </div>

      <table className="text-sm text-left w-full">
        <thead className="sticky top-0 z-10 bg-gray-100 uppercase">
          <tr>
            <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
              No
            </th>
            <th className="py-2 border-x border-slate-300 whitespace-nowrap flex items-center">
              <button className="cursor-pointer w-full border-r px-2">
                Счет ГК
              </button>
              <button className="cursor-pointer w-full  border-l px-2">
                Счет ГК
              </button>
            </th>
            <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
              Наименование счета ГК/БП
            </th>
            <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
              Дебет (ИВ)
            </th>
            <th className="py-2 border-x border-slate-300 text-center px-2 whitespace-nowrap">
              Кредит (ИВ)
            </th>
            <th className="py-2 border-x border-slate-300 text-center px-6 whitespace-nowrap ">
              Дебет
            </th>
            <th className="py-2 border-x border-slate-300 text-center px-4 ">
              Кредит
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="bg-white border-b border-gray-200">
            <th className="text-center">1</th>
            <td className="px-1 border-x-1 border-gray-200 ">Silver</td>
            <td className="px-1 border-x-1 border-gray-200 ">Laptop</td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th className="text-center">2</th>
            <td className="px-1 border-x-1 border-gray-200 ">Silver</td>
            <td className="px-1 border-x-1 border-gray-200 ">Laptop</td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th className="text-center">3</th>
            <td className="px-1 border-x-1 border-gray-200 ">Silver</td>
            <td className="px-1 border-x-1 border-gray-200 ">Laptop</td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
            <td className="px-1 border-x-1 border-gray-200 text-right">
              $2999
            </td>
          </tr>
        </tbody>
      </table>

      {/* MODALS */}
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
    </div>
  );
}
