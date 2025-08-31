import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
  className?: string;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(({ label = "", id = "", error = "", className = "", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1 w-full">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          id={id}
          ref={ref}
          className={`${className} ${error ? "border-red focus-visible:ring-red" : ""} pr-10`}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-2 flex items-center text-sm  "
        >
          {showPassword ? "Hide" : "Show"}
        </Button>
      </div>
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
});

PasswordField.displayName = "PasswordField";

export default PasswordField;
