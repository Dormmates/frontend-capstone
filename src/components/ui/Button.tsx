import React from "react";
import merge from "../../utils/merge.ts";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "plain";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const baseStyles = "px-4 py-2 rounded-md text-white font-medium transition duration-200";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary hover:opacity-50",
  secondary: "bg-gray-600  hover:bg-gray-700",
  danger: "bg-red-600 hover:bg-red-700",
  outline: "bg-transparent !text-black  border border-black hover:opacity-50",
  plain: "hover:opacity-50",
};

const disabledStyles = "opacity-50 cursor-not-allowed";

const Button = ({ variant = "primary", loading = false, children, disabled = false, className, ...props }: ButtonProps) => {
  return (
    <button
      className={merge(baseStyles, variants[variant], disabled || loading ? disabledStyles : "", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
