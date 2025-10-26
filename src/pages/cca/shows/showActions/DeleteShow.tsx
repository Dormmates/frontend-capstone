import { useDeleteShow } from "@/_lib/@react-client-query/show";
import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { AlertCircleIcon, Trash2Icon } from "lucide-react";

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
      className="max-w-2xl"
      description="This will permanently delete this show"
      title="Delete Show"
      actionText="Delete"
      trigger={
        <Button size="icon" disabled={deleteShow.isPending} variant="destructive">
          <Trash2Icon />
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
      <div className="border-red border  bg-red/5 p-2 rounded-sm mt-5 flex items-center gap-2">
        <AlertCircleIcon className="text-red w-4" />
        <p className=" text-sm font-medium">The operation cannot be undone</p>
      </div>
    </AlertModal>
  );
};

export default DeleteShow;
