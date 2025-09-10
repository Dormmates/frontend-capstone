import ShowForm from "../ShowForm";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateShow } from "@/_lib/@react-client-query/show";
import ToastNotification from "@/utils/toastNotification";
import { getFileId } from "@/utils";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
      triggerElement={<Button>Edit Show Details</Button>}
      description="Edit show information and click save"
      title="Edit Show"
      className="w-full max-w-4xl"
    >
      <ShowForm
        showType={"group"}
        isLoading={updateShow.isPending}
        onSubmit={(data) => {
          ToastNotification.info("Saving Changes");

          updateShow.mutate(
            {
              showId: show.showId as string,
              showTitle: data.title,
              description: data.description,
              department: data.group,
              genre: data.genre.join(", "),
              showType: data.productionType,
              image: data.image as File,
              oldFileId: data.image ? (getFileId(show?.showCover as string) as string) : undefined,
            },
            {
              onSuccess: (data) => {
                setIsOpen(false);
                queryClient.setQueryData<ShowData>(["show", data.showId], data);
                queryClient.invalidateQueries({ queryKey: ["shows"] });
                ToastNotification.success("Updated Show");
              },
              onError: (err) => {
                ToastNotification.error(err.message);
              },
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
