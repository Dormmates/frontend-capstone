import { useUpdatePassword } from "@/_lib/@react-client-query/auth";
import PasswordField from "@/components/PasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import type { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const UpdatePassword = ({ closeModal }: { closeModal: () => void }) => {
  const { user, setUser, setToken } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updatePassword = useUpdatePassword();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!form.password || form.password.length < 8) {
      newErrors.password = "Password length must be atleast 8 characters";
      isValid = false;
    }

    if (!form.confirmPassword || form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = () => {
    if (!validate()) return;

    toast.promise(updatePassword.mutateAsync({ userId: user?.userId as string, newPassword: form.password }), {
      position: "top-center",
      success: () => {
        queryClient.setQueryData<User>(["user"], (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, isDefaultPassword: false };
        });
        closeModal();

        return "Password Updated";
      },
      loading: "Updating Password...",
      error: (err) => err.message || "Failed to update password, try again later",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <p>Please provide your new password</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <PasswordField
            disabled={updatePassword.isPending}
            error={errors.password}
            required={true}
            label="New Password"
            onChange={handleInputChange}
            name="password"
            value={form.password}
          />
          <PasswordField
            disabled={updatePassword.isPending}
            error={errors.confirmPassword}
            required={true}
            label="Confirm New Password"
            onChange={handleInputChange}
            name="confirmPassword"
            value={form.confirmPassword}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" disabled={updatePassword.isPending} onClick={submit}>
            Update Password
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={updatePassword.isPending}
            onClick={() => {
              toast.promise(
                new Promise<void>((resolve) => {
                  setUser(null);
                  setToken("");
                  navigate("/login");
                  resolve();
                }),
                {
                  position: "top-center",
                  loading: "Logging Out...",
                  success: "Logged Out",
                  error: "Failed to logout, please try again",
                }
              );
            }}
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default UpdatePassword;
