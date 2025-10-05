import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type DialogPopupProps = {
  children: React.ReactNode;
  triggerElement: React.ReactNode;
  title: string;
  submitAction?: () => void;
  saveTitle?: string;
  description?: string | React.ReactNode;
  className?: string;
  tooltip?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
};

const DialogPopup = ({
  className,
  triggerElement,
  title,
  description,
  submitAction,
  saveTitle = "Save",
  children,
  tooltip,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}: DialogPopupProps) => {
  // Internal state if not controlled
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined && controlledSetIsOpen !== undefined;

  const open = isControlled ? controlledIsOpen : internalOpen;
  const setOpen = isControlled ? controlledSetIsOpen : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{triggerElement}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      )}

      <DialogContent className={`overflow-y-auto ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="overflow-y-auto">{children}</div>

        {submitAction && (
          <DialogFooter className="flex gap-3 flex-col-reverse md:flex-row md:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitAction}>{saveTitle}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogPopup;
