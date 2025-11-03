import { useDeleteUser } from "@/_lib/@react-client-query/accounts";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { InfoIcon, Trash2Icon } from "lucide-react";
import { formatSectionName } from "@/utils/seatmap";

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
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        return "User Deleted";
      },
      error: (err) => err.message || "Failed to delete user",
    });
  };

  return (
    <AlertModal
      confirmation="Delete"
      actionText="Delete User"
      onConfirm={handleSubmit}
      trigger={
        <Button size="icon" variant="destructive">
          <Trash2Icon />
        </Button>
      }
      title={`Delete ${formatSectionName(queryKey.replace(/s$/, ""))}`}
      description="This will permanently delete this user"
    >
      <div>User Name: {user.firstName + " " + user.lastName}</div>
      <div className="flex  gap-2 border border-orange-400 bg-orange-50 p-3">
        <InfoIcon className="w-5 text-orange-400" />
        <p className="text-sm font-semibold">Account Deletion will fail if the system detects that the user contains important data.</p>
      </div>
    </AlertModal>
  );
};

export default DeleteAccount;
