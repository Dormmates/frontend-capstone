import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useArchiveShow } from "@/_lib/@react-client-query/show";
import { useAuthContext } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { ArchiveIcon } from "lucide-react";

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

  return (
    <AlertModal
      className="max-w-2xl"
      onConfirm={handleSubmit}
      actionText="Archive"
      title="Archive Show"
      description="This will move this show on the archive list"
      trigger={
        <Button disabled={archiveShow.isPending} variant="outline">
          <ArchiveIcon />
        </Button>
      }
    >
      <div>
        <h1 className="font-semibold mb-2">Archiving this show will permanently:</h1>
        <ul className="list-disc ml-6 space-y-1">
          <li>Remove the show from the active and archived shows list.</li>
          <li>
            Delete <strong>all schedules</strong> associated with this show.
          </li>
          <li>
            Delete <strong>all allocated tickets</strong> linked to these schedules.
          </li>
          <li>
            Delete <strong>all seat reservations</strong> for the schedules.
          </li>
          <li>
            Delete <strong>all remittance and sales records</strong> for the show.
          </li>
          <li>
            Delete <strong>all logs and history</strong> related to this show.
          </li>
        </ul>
        <div className="border-red border  bg-gray p-2 rounded-sm mt-5">
          <p className=" font-medium">This action will erase all data related to this show and cannot be undone.</p>
        </div>
      </div>
    </AlertModal>
  );
};

export default ArchiveShow;
