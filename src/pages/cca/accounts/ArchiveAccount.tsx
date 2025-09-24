import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

import type { User } from "@/types/user";
import { useArchiveAccount } from "@/_lib/@react-client-query/accounts";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import { ArchiveIcon } from "lucide-react";

type ArchiveAccountProps = {
  user: User;
  queryKey: "distributors" | "trainers" | "heads";
};

const ArchiveAccount = ({ user, queryKey }: ArchiveAccountProps) => {
  const queryClient = useQueryClient();
  const archive = useArchiveAccount();

  const handleSubmit = () => {
    toast.promise(archive.mutateAsync(user.userId), {
      position: "top-center",
      loading: "Archiving user...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
        return "User Archived ";
      },
      error: (err) => err.message || "Failed to archive user",
    });
  };
  return (
    <AlertModal
      confirmation="Archive"
      tooltip="Archive Account"
      actionText="Archive Account"
      onConfirm={handleSubmit}
      trigger={
        <Button variant="outline">
          <ArchiveIcon />
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
