import { Label } from "./ui/label";

export interface LongCardItem {
  label: string;
  value: string | number;
  className?: string;
}

const LongCardItem = ({ label, value, className = "" }: LongCardItem) => {
  return (
    <div className={`flex flex-col gap-3  whitespace-nowrap ${className}`}>
      <Label className="text-lightGrey font-normal">{label}</Label>
      <Label className="font-normal text-md">{value}</Label>
    </div>
  );
};

export default LongCardItem;
