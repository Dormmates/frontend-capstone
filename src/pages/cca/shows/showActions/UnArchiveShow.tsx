import { useUnArchiveShow } from "@/_lib/@react-client-query/show";
import AlertModal from "@/components/AlertModal";
import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArchiveIcon } from "lucide-react";

type UnArchiveShowProps = {
  show: ShowData;
};

const UnArchiveShow = ({ show }: UnArchiveShowProps) => {
  const queryClient = useQueryClient();
  const unarchiveShow = useUnArchiveShow();
  const { user } = useAuthContext();

  const handleSubmit = () => {
    toast.promise(
      unarchiveShow.mutateAsync({
        showId: show.showId as string,
        actionByName: user?.firstName + " " + user?.lastName,
        actionById: user?.userId as string,
      }),
      {
        position: "top-center",
        loading: "Unarchiving show...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["shows"] });
          return "Show Unarchived";
        },
        error: (err) => err.message || "Failed to unarchive show",
      }
    );
  };

  return (
    <AlertModal
      actionText="Confirm"
      onConfirm={handleSubmit}
      title="Unarchive Show"
      description="This action will unarchive this show and move it to the show lists"
      trigger={
        <Button variant="outline" disabled={unarchiveShow.isPending}>
          <ArchiveIcon />
        </Button>
      }
    />
  );
};

export default UnArchiveShow;
