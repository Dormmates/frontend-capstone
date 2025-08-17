export interface LongCardItem {
  label: string;
  value: string | number;
}

const LongCardItem = ({ label, value }: LongCardItem) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

export default LongCardItem;
