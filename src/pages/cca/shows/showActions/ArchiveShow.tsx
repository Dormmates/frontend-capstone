import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useArchiveShow } from "@/_lib/@react-client-query/show";
import { useAuthContext } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { ArchiveIcon } from "lucide-react";
import DialogPopup from "@/components/DialogPopup";

type ArchiveShowProps = {
  show: ShowData;
};

const ArchiveShow = ({ show }: ArchiveShowProps) => {
  const queryClient = useQueryClient();
  const archiveShow = useArchiveShow();
  const { user } = useAuthContext();

  const handleSubmit = () => {
    toast.promise(
      archiveShow.mutateAsync({
        showId: show.showId as string,
        actionByName: user?.firstName + " " + user?.lastName,
        actionById: user?.userId as string,
      }),
      {
        position: "top-center",
        loading: "Archiving show...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["shows"] });
          close();
          return "Show Archived";
        },
        error: (err: Error) => err.message || "Failed to archive show",
      }
    );
  };

  return show.showschedules.some((s) => s.isOpen) ? (
    <DialogPopup
      title="Cannot Archive Show"
      triggerElement={
        <Button size="icon" disabled={archiveShow.isPending} variant="outline">
          <ArchiveIcon />
        </Button>
      }
    >
      <p>This show cannot be archived because it has open schedules. Please close all active schedules before archiving the show.</p>
    </DialogPopup>
  ) : (
    <AlertModal
      className="max-w-2xl"
      onConfirm={handleSubmit}
      actionText="Archive"
      title="Archive Show"
      description="This will move this show on the archive list"
      trigger={
        <Button size="icon" disabled={archiveShow.isPending} variant="outline">
          <ArchiveIcon />
        </Button>
      }
    >
      <div>
        <h1 className="font-semibold mb-2">Archiving this show will permanently:</h1>
        <ul className="list-disc ml-6 space-y-1">
          <li>Remove the show from the active and moved to archived shows list.</li>
          <li>Cannot perform any operations on the schedule.</li>
        </ul>
      </div>
    </AlertModal>
  );
};

export default ArchiveShow;
