import { useDeleteUser } from "@/_lib/@react-client-query/accounts";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import ToastNotification from "@/utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import deletIcon from "@/assets/icons/delete.png";

type DeleteAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers";
};

const DeleteAccount = ({ user, queryKey }: DeleteAccountProps) => {
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();

  const handleSubmit = (close: () => void) => {
    deleteUser.mutate(user.userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });

        ToastNotification.success("User Deleted");
        close();
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  return (
    <DialogPopup
      tooltip="Delete User"
      saveTitle="Delete Account"
      submitAction={(close) => handleSubmit(close)}
      triggerElement={
        <Button className="p-0" variant="ghost">
          <img src={deletIcon} alt="" />
        </Button>
      }
      title="Delete User"
      description="This will permanently delete this user"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </DialogPopup>
  );
};

export default DeleteAccount;
