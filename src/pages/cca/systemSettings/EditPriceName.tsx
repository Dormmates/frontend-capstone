import { useEditPriceName } from "@/_lib/@react-client-query/ticketpricing";
import DialogPopup from "@/components/DialogPopup";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { EditIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type EditPriceNameProps = {
  priceName: string;
  priceId: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditPriceName = ({ priceName, priceId, isOpen, setIsOpen }: EditPriceNameProps) => {
  const queryClient = useQueryClient();
  const editName = useEditPriceName();
  const [newName, setNewName] = useState(priceName);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    setError("");
  };

  const edit = () => {
    const n = newName.trim();

    if (!n || n.length < 4) {
      setError("Input must be atleast 4 characters");
      return;
    }

    toast.promise(editName.mutateAsync({ newName, priceId }), {
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["pricings"] });
        setIsOpen(false);
        return "Price Name Updated";
      },
      loading: "Price Name Updating...",
      error: (err) => err.message,
      position: "top-center",
    });
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Edit Price Name"
      description="You are only allowed to edit the price name."
      triggerElement={
        <Button size="icon" variant="secondary">
          <EditIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-2 justify-center">
        <InputField error={error} value={newName} onChange={handleInputChange} label="Enter Price Name" />
        <Button onClick={edit} disabled={priceName.trim() === newName.trim() || editName.isPending} className="w-fit self-end">
          Update
        </Button>
      </div>
    </DialogPopup>
  );
};

export default EditPriceName;
