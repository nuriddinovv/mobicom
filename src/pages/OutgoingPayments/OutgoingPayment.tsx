import { useEffect, useRef, useState } from "react";
import useFetch from "../../api/useFetch";
import { PaymentsApi } from "../../api/get";
import type { Payment } from "../../interfaces";
import { formatDate } from "../../utils/formatDate";
import "react-responsive-pagination/themes/classic.css";
import CustomLoader from "../../components/CustomLoader";
import { NavLink } from "react-router-dom";

export default function OutgoingPayment() {
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const listRef = useRef<HTMLDivElement>(null);
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
      setPage(1);
      refetch();
    }
  }, [typing, q]);

  const { loading, error, data, refetch } = useFetch(
    () => PaymentsApi({ Query: q, Page: page }),
    false
  );
  useEffect(() => {
    setTotalPages(data?.data.totalPages || 10);
  }, [data]);

  useEffect(() => {
    setPage(1);
    if (q === "") refetch();
  }, [q]);

  useEffect(() => {
    refetch();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="container py-2 h-[100vh] ">
      <div className="flex items-center gap-4">
        <input
          onChange={(e) => {
            setQ(e.target.value);
            setTyping(true);
          }}
          type="search"
          name=""
          id=""
          placeholder="Поиск..."
          className="w-full border rounded-md border-gray-300 px-2 py-2 outline-none"
        />
        <NavLink to={"/outgoing-payment-add"}>
          <button className="px-10 py-2 rounded-md border-green-500 border bg-green-500 font-bold text-white">
            +
          </button>
        </NavLink>
      </div>
      <div
        ref={listRef}
        className="h-[85vh] mt-2 overflow-x-auto overflow-y-auto "
        style={{ scrollbarColor: "transparent", scrollbarWidth: "none" }}
      >
        {loading && <CustomLoader />}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {data &&
          data.data.payments.map((item: Payment) => {
            return (
              <NavLink
                key={item.docEntry}
                to={`/outgoing-payment/${item.docEntry}`}
              >
                <div className=" m-2 grid grid-cols-3 gap-4 border-b border-gray-300 cursor-pointer">
                  <div className="text-center">
                    <p>{item.cardName}</p>
                    <p>{item.docTotal}</p>
                  </div>
                  <div className="text-center flex justify-center items-center">
                    <p>{item.docNum}</p>
                  </div>
                  <div className="text-center">
                    <p>{formatDate(item.docDate)}</p>
                    <p>{item.docTotalFC}</p>
                  </div>
                </div>
              </NavLink>
            );
          })}
      </div>
      {data && (
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
  );
}
