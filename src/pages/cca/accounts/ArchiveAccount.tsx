import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "@/assets/icons/archive.png";
import type { User } from "@/types/user";
import ToastNotification from "@/utils/toastNotification";
import { useArchiveAccount } from "@/_lib/@react-client-query/accounts";
import AlertModal from "@/components/AlertModal";

type ArchiveAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers" | "heads";
};

const ArchiveAccount = ({ user, queryKey }: ArchiveAccountProps) => {
  const queryClient = useQueryClient();
  const archive = useArchiveAccount();

  const handleSubmit = () => {
    archive.mutate(user.userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
        ToastNotification.success("User Archived");
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };
  return (
    <AlertModal
      confirmation="Archive"
      tooltip="Archive Account"
      actionText="Archive Account"
      onConfirm={handleSubmit}
      trigger={
        <Button className="p-0" variant="ghost">
          <img src={archiveIcon} alt="" className="w-7 h-7" />
        </Button>
      }
      title="Archive User"
      description="This will archive the user and remove the user from the main list"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </AlertModal>
  );
};

export default ArchiveAccount;
