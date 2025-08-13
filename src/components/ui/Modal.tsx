import React, { useEffect } from "react";
import close from "../../assets/icons/close.png";
import merge from "../../utils/merge.ts";
import Button from "./Button.tsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  className?: string;
  title: string;
}

const Modal = ({ isOpen = false, onClose, children, backdropColor = "rgba(0,0,0,0.5)", className, title }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="p-5 fixed inset-0 z-50 flex items-center justify-center " style={{ backgroundColor: backdropColor }}>
      <div className={merge("bg-white rounded-lg p-6 shadow-lg z-60 max-h-[90%] overflow-y-auto", className)} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between gap-20">
          <h2 className="text-2xl">{title}</h2>
          <Button variant="plain" onClick={onClose}>
            <img src={close} alt="close" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
