interface TimeInputProps {
  label?: string;
  name?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const TimeInput = ({ label, name, value, onChange, disabled = false, required = false, isError = false, errorMessage = "" }: TimeInputProps) => {
  return (
    <div className={`w-full`}>
      <input
        type="time"
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
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

export default TimeInput;
