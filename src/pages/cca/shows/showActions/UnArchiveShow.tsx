import { useUnArchiveShow } from "@/_lib/@react-client-query/show";
import AlertModal from "@/components/AlertModal";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import type { ShowData } from "@/types/show";
import ToastNotification from "@/utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "../../../../assets/icons/archive.png";

type UnArchiveShowProps = {
  show: ShowData;
};

const UnArchiveShow = ({ show }: UnArchiveShowProps) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const unarchiveShow = useUnArchiveShow();

  const handleSubmit = () => {
    unarchiveShow.mutate(
      { showId: show.showId as string },
      {
        onSuccess: () => {
          queryClient.setQueryData<ShowData[]>(
            ["shows", ...(show.showType === "majorProduction" ? ["majorProduction"] : []), user?.department?.departmentId].filter(Boolean),
            (oldData) => {
              if (!oldData) return oldData;
              return oldData.map((s) => (s.showId === show?.showId ? { ...show, isArchived: false } : s));
            }
          );
          ToastNotification.success("Show Archived");
        },
        onError: (err) => {
          ToastNotification.error(err.message);
        },
      }
    );
  };

  return (
    <AlertModal
      actionText="Confirm"
      onConfirm={handleSubmit}
      title="Unarchive Show"
      description="This action will unarchive this show and move it to the show lists"
      tooltip="Unarchive Show"
      trigger={
        <Button variant="ghost" className="p-0">
          <img src={archiveIcon} alt="" />
        </Button>
      }
    />
  );
};

export default UnArchiveShow;
