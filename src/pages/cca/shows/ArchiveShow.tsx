import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";

interface ArchiveShowProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: () => void;
  isPending: boolean;
}

const ArchiveShow = ({ isOpen, onClose, onArchive, isPending }: ArchiveShowProps) => {
  return (
    <Modal title="Archive Show" isOpen={isOpen} onClose={onClose}>
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

        <div className="flex justify-end gap-3 mt-5">
          <Button disabled={isPending} onClick={onArchive} className="!bg-green">
            Archive Show
          </Button>
          <Button disabled={isPending} onClick={onClose} className="!bg-red">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ArchiveShow;
