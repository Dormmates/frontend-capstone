import DialogPopup from "@/components/DialogPopup";
import archiveIcon from "../../../../assets/icons/archive.png";
import { Button } from "@/components/ui/button";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useArchiveShow } from "@/_lib/@react-client-query/show";
import { useAuthContext } from "@/context/AuthContext";
import ToastNotification from "@/utils/toastNotification";

type ArchiveShowProps = {
  show: ShowData;
};

const ArchiveShow = ({ show }: ArchiveShowProps) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const archiveShow = useArchiveShow();

  const handleSubmit = (close: () => void) => {
    archiveShow.mutate(
      { showId: show.showId as string },
      {
        onSuccess: () => {
          queryClient.setQueryData<ShowData[]>(
            ["shows", ...(show.showType === "majorProduction" ? ["majorProduction"] : []), user?.department?.departmentId].filter(Boolean),
            (oldData) => {
              if (!oldData) return oldData;
              return oldData.map((s) => (s.showId === show?.showId ? { ...s, isArchived: true } : s));
            }
          );
          close();
          ToastNotification.success("Show Archived");
        },
        onError: (err) => {
          ToastNotification.error(err.message);
        },
      }
    );
  };

  return (
    <DialogPopup
      tooltip="Archive Show"
      className="max-w-2xl"
      submitAction={(close) => {
        handleSubmit(close);
      }}
      saveTitle="Archive"
      title="Archive Show"
      description="This will move this show on the archive list"
      triggerElement={
        <Button disabled={archiveShow.isPending} variant="ghost" className="p-0">
          <img src={archiveIcon} alt="archive" />
        </Button>
      }
    >
      <div className="mt-5">
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
    </DialogPopup>
  );
};

export default ArchiveShow;
