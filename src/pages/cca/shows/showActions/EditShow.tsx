import ShowForm from "../ShowForm";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateShow } from "@/_lib/@react-client-query/show";
import ToastNotification from "@/utils/toastNotification";
import { useAuthContext } from "@/context/AuthContext";
import { getFileId } from "@/utils";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";

type EditShowProps = {
  show: ShowData;
};

const EditShow = ({ show }: EditShowProps) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const updateShow = useUpdateShow();

  return (
    <DialogPopup
      triggerElement={<Button>Edit Show Details</Button>}
      description="Edit show information and click save"
      title="Edit Show"
      className="w-full max-w-4xl"
    >
      <ShowForm
        showType={show.showType === "majorProduction" ? "major" : "group"}
        isLoading={updateShow.isPending}
        onSubmit={(data) => {
          ToastNotification.info("Saving Changes");
          updateShow.mutate(
            {
              showId: show.showId as string,
              showTitle: data.title,
              description: data.description,
              department: show.department ? show.department.departmentId : null,
              genre: data.genre.join(", "),
              createdBy: user?.userId as string,
              showType: show.showType === "majorProduction" ? "majorProduction" : show.showType,
              image: data.image as File,
              oldFileId: data.image ? (getFileId(show?.showCover as string) as string) : undefined,
            },
            {
              onSuccess: (data) => {
                queryClient.setQueryData<ShowData>(["show", data.showId], data);
                queryClient.setQueryData(
                  ["shows", ...(show.showType === "majorProduction" ? ["majorProduction"] : []), user?.department?.departmentId].filter(Boolean),
                  (oldData: ShowData[] | undefined) => {
                    if (!oldData) return oldData;
                    return oldData.map((show) => (show.showId === data.showId ? data : show));
                  }
                );

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
          group: show.department?.departmentId as string,
          showImagePreview: show.showCover as string,
          image: null,
        }}
      />
    </DialogPopup>
  );
};

export default EditShow;
