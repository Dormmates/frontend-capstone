import React from "react";
import merge from "../../utils/merge.ts";

export type ButtonVariant = "primary" | "outline" | "danger" | "plain";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
}

const baseStyles = "px-4 py-2 rounded-md text-white font-medium transition duration-200";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary hover:opacity-50",
  danger: "bg-red hover:opacity-50",
  outline: "bg-transparent !text-black  border border-black hover:opacity-50",
  plain: "hover:opacity-50 p-0",
};

const disabledStyles = "opacity-50 cursor-not-allowed";

const Button = ({
  variant = "primary",
  loading = false,
  children,
  disabled = false,
  className,
  loadingMessage = "Loading...",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={merge(baseStyles, variants[variant], disabled || loading ? disabledStyles : "", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? loadingMessage : children}
    </button>
  );
};

export default Button;
