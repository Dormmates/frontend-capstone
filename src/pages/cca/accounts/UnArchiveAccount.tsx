import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "@/assets/icons/archive.png";
import type { User } from "@/types/user";
import ToastNotification from "@/utils/toastNotification";
import { useUnArchiveAccount } from "@/_lib/@react-client-query/accounts";

type ArchiveAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers";
};

const UnArchiveAccount = ({ user, queryKey }: ArchiveAccountProps) => {
  const queryClient = useQueryClient();
  const unarchive = useUnArchiveAccount();

  const handleSubmit = (close: () => void) => {
    unarchive.mutate(user.userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
        ToastNotification.success("User UnArchived");
        close();
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };
  return (
    <DialogPopup
      tooltip="Unarchive Account"
      saveTitle="Unarchive Account"
      submitAction={(close) => handleSubmit(close)}
      triggerElement={
        <Button className="p-0" variant="ghost">
          <img src={archiveIcon} alt="" />
        </Button>
      }
      title="Archive User"
      description="This will unarchive the user and move the user from the main list"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </DialogPopup>
  );
};

export default UnArchiveAccount;
