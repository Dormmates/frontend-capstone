import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import archiveIcon from "@/assets/icons/archive.png";
import type { User } from "@/types/user";
import { useUnArchiveAccount } from "@/_lib/@react-client-query/accounts";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";

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
        <Button className="p-0" variant="ghost">
          <img src={archiveIcon} alt="" className="w-7 h-7" />
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
