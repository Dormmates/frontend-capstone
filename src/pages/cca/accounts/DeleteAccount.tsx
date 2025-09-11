import { useDeleteUser } from "@/_lib/@react-client-query/accounts";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import deletIcon from "@/assets/icons/delete.png";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";

type DeleteAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers" | "heads";
};

const DeleteAccount = ({ user, queryKey }: DeleteAccountProps) => {
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();

  const handleSubmit = () => {
    toast.promise(deleteUser.mutateAsync(user.userId), {
      position: "top-center",
      loading: "Deleting user...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
        return "User Deleted";
      },
      error: (err) => err.message || "Failed to delete user",
    });
  };

  return (
    <AlertModal
      tooltip="Delete User"
      confirmation="Delete"
      actionText="Delete User"
      onConfirm={handleSubmit}
      trigger={
        <Button className="p-0" variant="ghost">
          <img src={deletIcon} alt="" className="w-7 h-7" />
        </Button>
      }
      title="Delete User"
      description="This will permanently delete this user"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </AlertModal>
  );
};

export default DeleteAccount;
