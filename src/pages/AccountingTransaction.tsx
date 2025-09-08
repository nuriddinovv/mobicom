export default function AccountingTransaction() {
  return (
    <div className="p-4">
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
            <th className="py-2 text-center px-2 whitespace-nowrap">No</th>
            <th className="py-2 text-center px-4 whitespace-nowrap">
              Счет ГК/код БП
            </th>
            <th className="py-2 text-center px-2 whitespace-nowrap">
              Наименование счета ГК/БП
            </th>
            <th className="py-2 text-center px-2 whitespace-nowrap">
              Дебет (ИВ)
            </th>
            <th className="py-2 text-center px-2 whitespace-nowrap">
              Кредит (ИВ)
            </th>
            <th className="py-2 text-center px-6 whitespace-nowrap ">Дебет</th>
            <th className="py-2 text-center px-4 ">Кредит</th>
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
    </div>
  );
}
