import { useEffect, useState } from "react";
import PartyType from "../../components/RadioGroup";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../api/useFetch";
import CustomLoader from "../../components/CustomLoader";
import { formatDate } from "../../utils/formatDate";
import { OutgoingPaymentApi } from "../../api/get";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";

export default function OutgoingPaymentID() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = sessionStorage.getItem("sessionId");

  const { loading, error, data, refetch } = useFetch(
    () => OutgoingPaymentApi({ ID: id ?? 1 }),
    false
  );

  useEffect(() => {
    if (id !== undefined) refetch();
  }, [id]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [type, setType] = useState<"CUSTOMER" | "SUPPLIER">("CUSTOMER");

  // ---- Cancel API helper
  const postPaymentCancel = async ({
    id,
    sessionId,
  }: {
    id: number | string;
    sessionId: string | null;
  }) => {
    const res = await fetch(`/api/OutPayments/${id}/Cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Session-Id": sessionId ?? "",
      },
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* server oddiy matn qaytargan bo‘lishi mumkin */
    }

    if (!res.ok) {
      const msg =
        json?.error?.message || json?.message || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json ?? { ok: true };
  };

  // ---- Cancel button handler
  const CancelPayment = async () => {
    setModalLoading(true);
    const docEntry = data?.data?.docEntry;

    if (docEntry == null) {
      toast.error("docEntry topilmadi");
      return;
    }
    try {
      await postPaymentCancel({ id: docEntry, sessionId });
      toast.success("Success");
      navigate(-1);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Произошла ошибка");
    } finally {
      setModalLoading(false);
      setModalVisible(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <div className="p-4">
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <div className="">
        <div className="grid grid-cols-4">
          <div className="col-span-3 h-[95vh] border border-r-0 rounded-l-md">
            <p className="bg-slate-200 py-1 text-xl text-center rounded-tl-md">
              Исходящий платежи
            </p>
            <div className="grid grid-cols-8 p-1 gap-2 ">
              <div className="flex flex-col col-span-3 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Код</p>
                  <input
                    type="text"
                    defaultValue={data?.data.cardCode}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Название</p>
                  <input
                    type="text"
                    defaultValue={data?.data.cardName}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
              </div>
              <div className="col-span-2 mx-auto ">
                <PartyType value={type} onChange={setType} />
              </div>
              <div className="flex flex-col col-span-3 gap-1">
                <div className="flex items-center gap-6 w-full">
                  <p className="text-sm w-full">#</p>
                  <input
                    type="text"
                    defaultValue={data?.data.docNum}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-6 w-full">
                  <p className="text-sm w-full">Дата регистрации</p>
                  <input
                    type="text"
                    defaultValue={formatDate(
                      (data?.data.docDate ?? "").toString()
                    )}
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
                    {data?.data.paymentInvoices.map((item, i) => {
                      return (
                        <tr className="bg-white border-b border-gray-200">
                          <th className="">
                            <input
                              className="mx-auto w-full text-8xl bg-amber-400 p-5"
                              type="checkbox"
                              name=""
                              id=""
                            />
                          </th>
                          <td className="px-1 border-x-1 text-center border-gray-200 ">
                            {item.invoiceDocNum}
                          </td>
                          <td className="px-1 border-x-1 text-center border-gray-200 ">
                            {item.objectCode}
                          </td>
                          <td className="px-1 border-x-1 border-gray-200 text-right">
                            {formatDate(item.invoiceDate)}
                          </td>
                          <td className="px-1 border-x-1 border-gray-200 text-center">
                            {item.invoiceTotal}
                          </td>
                          <td className="px-1 border-x-1 border-gray-200 text-center">
                            {item.openSum}
                          </td>
                          <td className="px-1 border-x-1 border-gray-200 text-center">
                            {item.appliedSum}
                          </td>
                          <td className="px-1 border-x-1 border-gray-200 text-right">
                            {item.currency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 py-2">
                <div className=""></div>
                <div className="flex flex-col col-span-1 gap-1">
                  <div className="flex items-center gap-1 w-full">
                    <p className="text-sm w-full">Сумма к оплате (ИВ)</p>
                    <input
                      type="text"
                      defaultValue={data?.data.docTotalFC}
                      className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-full">
                    <p className="text-sm w-full">Сумма к оплате (HВ)</p>
                    <input
                      type="text"
                      defaultValue={data?.data.docTotal}
                      className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center w-full justify-end">
                <button
                  onClick={() => navigate(-1)}
                  className="border py-1 px-2 rounded-md cursor-pointer"
                >
                  OK
                </button>

                <button
                  onClick={() => setModalVisible(true)}
                  className="border py-1 px-2 rounded-md cursor-pointer"
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1 h-[95vh] border rounded-r-md">
            <p className="bg-slate-200 py-1 text-xl text-center rounded-tr-md">
              Методы платежа
            </p>
            <div className="p-1">
              <div className="flex flex-col col-span-1 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Валюта</p>
                  <select
                    defaultValue={data?.data.docCurrency}
                    className="border w-full text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Курс</p>
                  <input
                    type="text"
                    defaultValue={`${data?.data.docRate} UZS`}
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300 text-end"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 w-full py-2">
                <p className="text-sm w-16">Счет</p>
                <input
                  type="text"
                  defaultValue={"12350"}
                  className="border w-16  text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                />
                <p className="text-sm w-full">Schet nomi</p>
                <p>{data?.data.account}</p>
              </div>
              <div className="flex items-center my-2 gap-1 w-full">
                <p className="text-sm w-1/3">Статья ДДС</p>
                <select
                  name=""
                  id=""
                  className="border w-full text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                >
                  <option value="1">option 1</option>
                  <option value="2">option 2</option>
                  <option value="3">option 3</option>
                </select>
              </div>
              <div className="flex  items-center my-2 gap-1 w-full">
                <p className="text-sm w-full">
                  Магазин: {data?.data.shopCode} -{data?.data.shopName}
                </p>
              </div>
            </div>
          </div>
        </div>
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
                  disabled={modalLoading}
                  onClick={CancelPayment}
                  className="p-1 bg-green-500 text-white rounded-md px-4 w-full cursor-pointer"
                >
                  {modalLoading ? (
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
