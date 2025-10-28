import { useResetPassword } from "@/_lib/@react-client-query/accounts";
import { toast } from "sonner";
import AlertModal from "./AlertModal";
import { Button } from "./ui/button";

type ResetPasswordButtonProps = {
  firstName: string;
  lastName: string;
  userId: string;
};

const ResetPasswordButton = ({ firstName, lastName, userId }: ResetPasswordButtonProps) => {
  const resetPassword = useResetPassword();

  const submit = () => {
    toast.promise(resetPassword.mutateAsync({ userId }), {
      success: "User password reset",
      loading: "Reseting user password...",
      error: (err) => err.message || "Failed to reset user password",
      position: "top-center",
    });
  };
  return (
    <AlertModal
      confirmation="Confirm"
      actionText="Reset Password"
      onConfirm={submit}
      trigger={<Button variant="secondary">Reset User Password</Button>}
      title="Reset User Password"
      description="This will reset the password of user to default"
    >
      <div>User Name: {firstName + " " + lastName}</div>
    </AlertModal>
  );
};

export default ResetPasswordButton;
