import React, { useState, useEffect } from "react";
import PasswordField from "./PasswordField";
import { CheckIcon, XIcon } from "lucide-react";

type PasswordWithValidationProps = {
  error?: string;
  password: {
    value: string;
    isValid: boolean;
  };
  setPassword: React.Dispatch<
    React.SetStateAction<{
      value: string;
      isValid: boolean;
    }>
  >;
};

const PasswordWithValidation = ({ error, password, setPassword }: PasswordWithValidationProps) => {
  const [rules, setRules] = useState({
    withLowerCase: false,
    withUpperCase: false,
    withNumber: false,
    withSpecialCharacter: false,
    withinLength: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setPassword((prev) => ({ ...prev, value: newValue }));
  };

  useEffect(() => {
    const { value } = password;
    const updatedRules = {
      withLowerCase: /[a-z]/.test(value),
      withUpperCase: /[A-Z]/.test(value),
      withNumber: /[0-9]/.test(value),
      withSpecialCharacter: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      withinLength: value.length >= 8 && value.length <= 20,
    };

    setRules(updatedRules);

    const isValid = Object.values(updatedRules).every(Boolean);
    setPassword((prev) => ({ ...prev, isValid }));
  }, [password.value]);

  const renderRule = (label: string, passed: boolean) => (
    <p className={`flex items-center gap-2 text-sm ${passed ? "text-green" : "text-red"}`}>
      {passed ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
      <span>{label}</span>
    </p>
  );

  return (
    <div className="space-y-3">
      <PasswordField error={error} label="Enter New Password" value={password.value} onChange={handlePasswordChange} />

      <div className="p-3 rounded-md bg-gray-50 border border-gray-200 space-y-1">
        {renderRule("Must include at least one lowercase letter", rules.withLowerCase)}
        {renderRule("Must include at least one uppercase letter", rules.withUpperCase)}
        {renderRule("Must include at least one number", rules.withNumber)}
        {renderRule("Must include at least one special character (!@#$...)", rules.withSpecialCharacter)}
        {renderRule("Must be 8 - 20 characters long", rules.withinLength)}
      </div>
    </div>
  );
};

export default PasswordWithValidation;
