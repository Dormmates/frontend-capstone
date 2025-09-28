import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user";
import { useUnArchiveAccount } from "@/_lib/@react-client-query/accounts";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { ArchiveIcon } from "lucide-react";

type ArchiveAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers" | "heads";
};

const UnArchiveAccount = ({ user, queryKey }: ArchiveAccountProps) => {
  const queryClient = useQueryClient();
  const unarchive = useUnArchiveAccount();

  const handleSubmit = () => {
    toast.promise(unarchive.mutateAsync(user.userId), {
      position: "top-center",
      loading: "Unarchiving user...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
        close();
        return "User Unarchived";
      },
      error: (err) => err.message || "Failed to unarchive user",
    });
  };
  return (
    <AlertModal
      tooltip="Unarchive Account"
      actionText="Unarchive Account"
      onConfirm={handleSubmit}
      trigger={
        <Button variant="outline">
          <ArchiveIcon />
        </Button>
      }
      title="Archive User"
      description="This will unarchive the user and move the user from the main list"
    >
      <div>{user.firstName + " " + user.lastName}</div>
    </AlertModal>
  );
};

export default UnArchiveAccount;
