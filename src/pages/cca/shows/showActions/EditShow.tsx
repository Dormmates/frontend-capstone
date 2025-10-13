import ShowForm from "../ShowForm";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateShow } from "@/_lib/@react-client-query/show";
import { getFileId } from "@/utils";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { EditIcon } from "lucide-react";

type EditShowProps = {
  show: ShowData;
};

const EditShow = ({ show }: EditShowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const updateShow = useUpdateShow();

  return (
    <DialogPopup
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      triggerElement={
        <Button size="icon" variant="secondary">
          <EditIcon />
        </Button>
      }
      description="Edit show information and click save"
      title="Edit Show"
      className="w-full max-w-4xl"
    >
      <ShowForm
        showType={"group"}
        isLoading={updateShow.isPending}
        onSubmit={(data) => {
          toast.promise(
            updateShow.mutateAsync({
              showId: show.showId as string,
              showTitle: data.title,
              description: data.description,
              department: data.group,
              genre: data.genre.join(", "),
              showType: data.productionType,
              image: data.image as File,
              oldFileId: data.image ? (getFileId(show?.showCover as string) as string) : undefined,
            }),
            {
              loading: "Updating show...",
              position: "top-center",
              success: (updated) => {
                setIsOpen(false);
                queryClient.setQueryData<ShowData>(["show", updated.showId], updated);
                queryClient.invalidateQueries({ queryKey: ["shows"] });
                return "Show updated successfully ";
              },
              error: (err: Error) => err.message || "Failed to update show",
            }
          );
        }}
        formType="edit"
        showFormValue={{
          title: show.title as string,
          productionType: show.showType,
          description: show.description as string,
          genre: show.genreNames as string[],
          imageCover: show.showCover as string,
          group: show.department ? (show.department.departmentId as string) : null,
          showImagePreview: show.showCover as string,
          image: null,
        }}
      />
    </DialogPopup>
  );
};

export default EditShow;
