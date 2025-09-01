import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ trigger, title, description, cancelText = "Cancel", actionText = "Continue", onConfirm }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger || <Button variant="outline">Show Dialog</Button>}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertModal;
