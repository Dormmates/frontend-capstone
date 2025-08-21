export interface LongCardItem {
  label: string;
  value: string | number;
}

const LongCardItem = ({ label, value }: LongCardItem) => {
  return (
    <div className="flex flex-col gap-3  whitespace-nowrap">
      <p className="text-sm text-slate-400 truncate">{label}</p>
      <p className="font-semibold truncate">{value}</p>
    </div>
  );
};

export default LongCardItem;
