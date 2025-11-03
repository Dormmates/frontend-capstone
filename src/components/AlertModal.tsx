import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import InputField from "./InputField";

interface AlertModalProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onConfirm: () => void;
  tooltip?: string;
  confirmation?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  trigger,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onConfirm,
  tooltip,
  confirmation = "Confirm",
  children,
  className,
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (input.trim() !== confirmation) {
      setError(`Please input "${confirmation}" to proceed with the action`);
      return;
    }
    setInput("");
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>{trigger || <Button variant="outline">Show Dialog</Button>}</AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <AlertDialogTrigger asChild>{trigger || <Button variant="outline">Show Dialog</Button>}</AlertDialogTrigger>
      )}

      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <div>
          <InputField
            error={error}
            label={
              <p>
                Type "<span className="text-red">{confirmation}</span>" to continue
              </p>
            }
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            value={input}
          />
        </div>
        <AlertDialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setError("");
            }}
          >
            {cancelText}
          </Button>
          <Button disabled={disabled} onClick={handleConfirm}>
            {actionText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertModal;
