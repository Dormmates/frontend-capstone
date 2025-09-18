import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogOverlay } from "@/components/ui/dialog";

interface ModalProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  isOpen: boolean;
  isTransparent?: boolean;
  onClose: () => void;
}

const Modal = ({ children, title, description, className, isOpen, isTransparent = false, onClose }: ModalProps) => {
  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogOverlay className={isTransparent ? "bg-transparent" : "bg-white/10"} />
      <DialogContent className={`max-w-xl w-[95%]  ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="overflow-x-auto w-full">
          <div className="pl-1 pr-4 pt-1">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
