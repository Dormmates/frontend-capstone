import { useDeleteUser } from "@/_lib/@react-client-query/accounts";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

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
        <Button size="icon" variant="destructive">
          <Trash2Icon />
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
