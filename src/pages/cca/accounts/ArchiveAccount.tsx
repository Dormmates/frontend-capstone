import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "@/assets/icons/archive.png";
import type { Distributor, User } from "@/types/user";
import ToastNotification from "@/utils/toastNotification";
import { useArchiveAccount } from "@/_lib/@react-client-query/accounts";

type ArchiveAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers";
};

type QueryDataMap = {
  distributors: Distributor[];
  trainers: User[];
};

const ArchiveAccount = ({ user, queryKey }: ArchiveAccountProps) => {
  const queryClient = useQueryClient();
  const archive = useArchiveAccount();

  const handleSubmit = (close: () => void) => {
    archive.mutate(user.userId, {
      onSuccess: () => {
        // queryClient.setQueryData<QueryDataMap[typeof queryKey]>([queryKey], (oldData) => {
        //   if (!oldData) return oldData;
        //   return oldData.filter((s) => (s.userId == user.userId ? { ...s, isArchived: true } : s)) as QueryDataMap[typeof queryKey];
        // });

        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });

        ToastNotification.success("User Archived");
        close();
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };
  return (
    <DialogPopup
      tooltip="Archive Account"
      saveTitle="Archive Account"
      submitAction={(close) => handleSubmit(close)}
      triggerElement={
        <Button className="p-0" variant="ghost">
          <img src={archiveIcon} alt="" />
        </Button>
      }
      title="Archive User"
      description="This will archive the user and remove the user from the main list"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </DialogPopup>
  );
};

export default ArchiveAccount;
