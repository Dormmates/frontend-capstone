interface DateInputProps {
  label?: string;
  name?: string;
  value: Date | undefined;
  onChange: (value: Date) => void;
  disabled?: boolean;
  required?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const formatDate = (date: Date | undefined): string => {
  return date ? date.toISOString().split("T")[0] : "";
};

const DateInput = ({ label, name, value, onChange, disabled = false, required = false, isError = false, errorMessage = "" }: DateInputProps) => {
  const today = new Date();
  const currentDateStr = today.toISOString().split("T")[0];
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  const endOfYearStr = endOfYear.toISOString().split("T")[0];

  return (
    <div className={`w-full`}>
      <input
        min={currentDateStr}
        max={endOfYearStr}
        type="date"
        name={name}
        value={formatDate(value)}
        onChange={(e) => onChange(new Date(e.target.value))}
        disabled={disabled}
        required={required}
        className={`w-full border rounded px-4 py-2 shadow-sm outline-none 
          ${isError ? "border-red" : "border-lightGrey"} 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} 
          focus:border-primary`}
      />
      {isError && errorMessage && <span className="text-sm text-red">{errorMessage}</span>}
    </div>
  );
};

export default DateInput;
