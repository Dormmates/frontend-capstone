import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
  id?: string;
  className?: string;
}
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({ label = "", id = "", error = "", className = "", ...props }, ref) => (
  <div className="space-y-1 w-full">
    {label && (
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
    )}
    <Input
      id={id}
      ref={ref}
      className={`
          ${className} 
          ${error ? "border-red focus-visible:ring-red" : ""} 
          ${props.disabled ? "cursor-not-allowed" : "cursor-auto"}
        `}
      {...props}
    />
    {error && <p className="text-sm text-red">{error}</p>}
  </div>
));

InputField.displayName = "InputField";

export default InputField;
