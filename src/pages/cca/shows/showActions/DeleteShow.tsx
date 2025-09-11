import { useDeleteShow } from "@/_lib/@react-client-query/show";
import { Button } from "@/components/ui/button";
import deleteIcon from "../../../../assets/icons/delete.png";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";

type DeleteShowProps = {
  show: ShowData;
};

const DeleteShow = ({ show }: DeleteShowProps) => {
  const queryClient = useQueryClient();
  const deleteShow = useDeleteShow();
  const { user } = useAuthContext();

  const handleDelete = () => {
    toast.promise(
      deleteShow.mutateAsync({
        showId: show.showId,
        actionByName: user?.firstName + " " + user?.lastName,
        actionById: user?.userId as string,
      }),
      {
        position: "top-center",
        loading: "Deleting show...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["shows"] });
          return "Show Deleted Permanently";
        },
        error: (err: Error) => err.message || "Failed to delete show",
      }
    );
  };

  return (
    <AlertModal
      tooltip="Permanently Delete Show"
      className="max-w-2xl"
      description="This will permanently delete this show"
      title="Delete Show"
      actionText="Delete"
      trigger={
        <Button disabled={deleteShow.isPending} variant="ghost" className="p-0">
          <img src={deleteIcon} alt="delete" className="w-7 h-7" />
        </Button>
      }
      onConfirm={handleDelete}
    >
      <div className="flex gap-5 mt-5">
        <div className="w-[200px] flex items-center justify-center">
          <img className="object-cover min-w-[200px] h-full" src={show.showCover} alt="Show Image" />
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-[100px_auto] gap-2">
            <p className="text-lightGrey">Show Title</p>
            <p className="font-medium">{show.title}</p>
          </div>
          <div className="grid grid-cols-[100px_auto] gap-2">
            <p className="text-lightGrey">Group</p>
            <p className="font-medium">{show.department ? show.department.name : "All Department"}</p>
          </div>
          <div className="grid grid-cols-[100px_auto] gap-2">
            <p className="text-lightGrey">Show Type</p>
            <p className="font-medium">{show?.showType?.toUpperCase()}</p>
          </div>
          <div className="grid grid-cols-[100px_auto] gap-2">
            <p className="text-lightGrey">Description</p>
            <p className="line-clamp-5 max-w-[300px] font-medium">{show?.description}</p>
          </div>
          <div className="grid grid-cols-[100px_auto] gap-2">
            <p className="text-lightGrey">Genre</p>
            <p className="font-medium">{show.genreNames.join(", ")}</p>
          </div>
        </div>
      </div>
      <div className="border-red border  bg-gray p-2 rounded-sm mt-5">
        <p className=" font-medium">The operation cannot be undone</p>
      </div>
    </AlertModal>
  );
};

export default DeleteShow;
