export interface LongCardItem {
  label: string;
  value: string | number;
  className?: string;
}

const LongCardItem = ({ label, value, className = "" }: LongCardItem) => {
  return (
    <div className={`flex flex-col gap-3  whitespace-nowrap ${className}`}>
      <p className="text-sm text-slate-400 ">{label}</p>
      <p className="font-semibold ">{value}</p>
    </div>
  );
};

export default LongCardItem;
