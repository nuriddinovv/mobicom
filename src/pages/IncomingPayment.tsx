import { useState } from "react";
import PartyType from "../components/RadioGroup";

export default function IncomingPayment() {
  const [type, setType] = useState<"customer" | "supplier" | "account">(
    "customer"
  );
  return (
    <div className="p-4 h-[100vh]">
      <div className="">
        <h1 className="text-3xl font-bold mb-4 pt-4 text-center">
          Bходящий платеж
        </h1>
        <div className="grid grid-cols-4">
          <div className="col-span-3 h-[85vh] border border-r-0 rounded-l-md">
            <p className="bg-slate-200 py-1 text-xl text-center rounded-tl-md">
              Bходящий платежи
            </p>
            <div className="grid grid-cols-8 p-1 gap-2 ">
              <div className="flex flex-col col-span-3 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Код</p>
                  <input
                    type="text"
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Название</p>
                  <input
                    type="text"
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
              </div>
              <div className="col-span-2 mx-auto">
                <PartyType value={type} onChange={setType} />
              </div>
              <div className="flex flex-col col-span-3 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm">#</p>
                  <input
                    type="text"
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                  <input
                    type="text"
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-6 w-full">
                  <p className="text-sm w-full">Дата регистрации</p>
                  <input
                    type="text"
                    className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  />
                </div>
              </div>
            </div>
            <div className="p-1">
              <div className="overflow-x-auto overflow-y-auto rounded-md w-full h-[50vh] border border-gray-200">
                <table className="text-sm text-left ">
                  <thead className="sticky top-0 z-10 bg-gray-50 uppercase">
                    <tr>
                      <th className="py-2 px-2 whitespace-nowrap">Выбрано</th>
                      <th className="py-2 px-2 whitespace-nowrap">
                        Номер документа
                      </th>
                      <th className="py-2 px-2 whitespace-nowrap">Взнос</th>
                      <th className="py-2 px-2 whitespace-nowrap">
                        Тип документа
                      </th>
                      <th className="py-2 px-2 whitespace-nowrap">
                        Тип документа
                      </th>
                      <th className="py-2 px-6 whitespace-nowrap ">Дата</th>
                      <th className="py-2 px-4 ">*</th>
                      <th className="py-2 pr-4 whitespace-nowrap">
                        Дни просрочки
                      </th>
                      <th className="py-2 px-4 whitespace-nowrap">Итого</th>
                      <th className="py-2 px-2 whitespace-nowrap">
                        Открытая сумма
                      </th>
                      <th className="py-2 px-2 whitespace-nowrap">
                        Сумма платежа
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="">
                        <input
                          className="mx-auto w-full text-8xl bg-amber-400 p-5"
                          type="checkbox"
                          name=""
                          id=""
                        />
                      </th>
                      <td className="px-1 border-x-1 border-gray-200 ">
                        Silver
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 ">
                        Laptop
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-right">
                        $2999
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-center">
                        —
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-center">
                        2025-08-26
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-center">
                        •
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-right">
                        0
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-right">
                        1 200 000
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-right">
                        200 000
                      </td>
                      <td className="px-1 border-x-1 border-gray-200 text-right">
                        50 000
                      </td>
                    </tr>
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
                      className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-full">
                    <p className="text-sm w-full">Сумма к оплате (HВ)</p>
                    <input
                      type="text"
                      className="w-full border rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center w-full justify-end">
                <button className="border py-1 px-2 rounded-md cursor-pointer">
                  OK
                </button>
                <button className="border py-1 px-2 rounded-md cursor-pointer">
                  Отменить
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1 h-[85vh] border rounded-r-md">
            <p className="bg-slate-200 py-1 text-xl text-center rounded-tr-md">
              Методы платежа
            </p>
            <div className="p-1">
              <div className="flex flex-col col-span-1 gap-1">
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Валюта</p>
                  <select
                    name=""
                    id=""
                    className="border w-full text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                  >
                    <option value="1">USD</option>
                    <option value="2">UZS</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-full">
                  <p className="text-sm w-full">Курс</p>
                  <input
                    type="text"
                    defaultValue={"12350 UZS"}
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
              </div>
              <div className="flex items-center gap-1 w-full">
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
              <div className="flex items-center gap-1 w-full my-20">
                <p className="text-sm w-1/3">Итого</p>
                <input
                  type="text"
                  defaultValue={"12350"}
                  className="border w-full  text-center rounded-md text-sm outline-none px-1 py-0.5 border-gray-300"
                />
              </div>
              <div className="flex gap-4 items-center w-full justify-end mt-10">
                <button className="border py-1 px-2 rounded-md cursor-pointer">
                  OK
                </button>
                <button className="border py-1 px-2 rounded-md cursor-pointer">
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
