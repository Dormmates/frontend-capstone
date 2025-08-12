import { useState, type ChangeEvent } from "react";
import InputLabel from "./InputLabel";

interface TextInputProps {
  label?: string | React.JSX.Element;
  name?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  isError = false,
  errorMessage = "Invalid input",
  className = "",
  disabled = false,
  required = true,
}: TextInputProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <InputLabel label={label} />}
      <input
        required={required}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded px-4 py-2 shadow-sm outline-none 
          ${isError ? "border-red" : "border-lightGrey"} 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} 
          focus:border-primary`}
      />
      {isError && <p className="text-sm text-red mt-1">{errorMessage}</p>}
    </div>
  );
};

export const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  isError = false,
  errorMessage = "Invalid input",
  className = "",
  disabled = false,
  required = true,
}: TextInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className={`w-full relative ${className}`}>
      {label && <InputLabel label={label} />}
      <input
        required={required}
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded px-4 py-2 pr-10 shadow-sm outline-none 
          ${isError ? "border-red" : "border-lightGrey"} 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} 
          focus:border-primary`}
      />
      <button
        type="button"
        className={`absolute right-3 -translate-y-1/2 text-sm text-gray-500
      ${label ? (isError ? "top-[50%]" : "top-[65%]") : "top-1/2"}`}
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? "Hide" : "Show"}
      </button>
      {isError && <p className="text-sm text-red mt-1">{errorMessage}</p>}
    </div>
  );
};

interface TextAreaProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

export const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  isError = false,
  errorMessage = "Invalid input",
  className = "",
  disabled = false,
  required = true,
  rows = 4,
}: TextAreaProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <InputLabel label={label} />}
      <textarea
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full border rounded px-4 py-2 shadow-sm outline-none resize-none
          ${isError ? "border-red" : "border-lightGrey"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          focus:border-primary`}
      />
      {isError && <p className="text-sm text-red mt-1">{errorMessage}</p>}
    </div>
  );
};

export default TextInput;
