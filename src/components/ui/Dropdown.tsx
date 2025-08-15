import { useEffect, useRef, useState } from "react";
import InputLabel from "./InputLabel";
import icon from "../../assets/icons/dropdown.png";
import merge from "../../utils/merge";

export interface DropdownOption<T extends string = string> {
  label: string;
  value?: T;
  onClick?: () => void;
  disabled?: boolean;
}

interface DropdownProps<T extends string = string> {
  className?: string;
  label?: string;
  options: ReadonlyArray<DropdownOption<T>>;
  value: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const Dropdown = <T extends string>({ label, options, value, onChange, className, disabled = false, isError, errorMessage }: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption<T>) => {
    setIsOpen(false);
    option.onClick?.();
    if (option.value !== undefined && onChange) {
      onChange(option.value);
    }
  };

  const selectedLabel = options.find((o) => o.value === value)?.label || "Select Value";

  return (
    <div className={merge("relative inline-block text-left", className)} ref={dropdownRef}>
      {label && <InputLabel label={label} />}
      <div
        className={merge(
          "border rounded px-4 py-2 shadow-sm flex justify-between items-center transition-colors duration-150 gap-5",
          isOpen ? "border-primary" : isError ? "border-red" : "border-lightGrey",
          disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-white cursor-pointer"
        )}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        {selectedLabel}
        <img src={icon} alt="" className={`transition-all duration-200 ease-linear ${isOpen ? "-rotate-90" : "rotate-0"}`} />
      </div>
      {isError && errorMessage && <p className="text-sm text-red mt-1">{errorMessage}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg overflow-y-auto max-h-[150px]">
          {options.map((option, idx) => {
            const isSelected = option.value === value;

            return (
              <div
                key={idx}
                className={`px-4 py-2 
                  ${isSelected ? "bg-darkGrey text-gray-400 opacity-20 cursor-not-allowed" : "hover:bg-blue-100 cursor-pointer"} 
                  ${option.disabled ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => !isSelected && !option.disabled && handleSelect(option)}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
