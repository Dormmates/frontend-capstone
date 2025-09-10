import { useUnArchiveShow } from "@/_lib/@react-client-query/show";
import AlertModal from "@/components/AlertModal";
import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import ToastNotification from "@/utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "../../../../assets/icons/archive.png";
import { useAuthContext } from "@/context/AuthContext";

type UnArchiveShowProps = {
  show: ShowData;
};

const UnArchiveShow = ({ show }: UnArchiveShowProps) => {
  const queryClient = useQueryClient();
  const unarchiveShow = useUnArchiveShow();
  const { user } = useAuthContext();

  const handleSubmit = () => {
    unarchiveShow.mutate(
      { showId: show.showId as string, actionByName: user?.firstName + " " + user?.lastName, actionById: user?.userId as string },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["shows"] });
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
        <Button variant="ghost" className="p-0" disabled={unarchiveShow.isPending}>
          <img src={archiveIcon} alt="" />
        </Button>
      }
    />
  );
};

export default UnArchiveShow;
