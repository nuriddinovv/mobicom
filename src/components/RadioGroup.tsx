// RadioGroup.tsx
import { useId } from "react";

type Role = "CUSTOMER" | "SUPPLIER";

export default function PartyType({
  value,
  onChange,
}: {
  value: Role;
  onChange: (val: Role) => void;
}) {
  const name = useId(); // bitta guruh uchun yagona name

  const Item = ({ val, label }: { val: Role; label: string }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 text-sm hidden">
      <input
        type="radio"
        name={name}
        value={val}
        checked={value === val}
        onChange={() => onChange(val)}
        className="h-4 w-4 accent-blue-600"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col gap-2">
      <Item val="CUSTOMER" label="Заказчик" />
      <Item val="SUPPLIER" label="Поставщик" />
    </div>
  );
}
