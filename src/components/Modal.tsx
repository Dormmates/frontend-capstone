import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className={`max-w-xl ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] mt-4">
          <div className="pl-1 pr-4 pt-1">{children}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
