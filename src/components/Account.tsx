import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Distributor } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useChangePassword } from "@/_lib/@react-client-query/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PasswordWithValidation from "./PasswordWithValidation";

type Props = {
  openAccount: boolean;
  setOpenAccount: React.Dispatch<React.SetStateAction<boolean>>;
};

const Account = ({ openAccount, setOpenAccount }: Props) => {
  const { user, setUser, setToken } = useAuthContext();
  const changePassword = useChangePassword();
  const navigate = useNavigate();

  const [userForm, setUserForm] = useState({
    firstName: user?.firstName + "",
    lastName: user?.lastName + "",
    email: user?.email + "",
    contactNumber: user?.roles.includes("distributor") ? (user as Distributor).distributor.contactNumber : "",
  });

  const [newPassword, setNewPassword] = useState({ value: "", isValid: false });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
  });

  const [passwordsError, setPasswordsError] = useState<{ currentPassword?: string; newPassword?: string }>({});

  const closeAccountModal = () => {
    setOpenAccount(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUserForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handlePasswordInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({ ...prev, [name]: value.trim() }));
    setPasswordsError((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePasswordChange = () => {
    const errors: typeof passwordsError = {};
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Please enter your current password";
      isValid = false;
    }

    if (newPassword.value == passwordForm.currentPassword) {
      errors.newPassword = "New password should not be the same with your current password";
      isValid = false;
    }

    setPasswordsError(errors);
    return isValid;
  };

  const submitChangePassword = () => {
    if (!validatePasswordChange()) return;

    toast.promise(
      changePassword.mutateAsync({
        userId: user?.userId as string,
        currentPassword: passwordForm.currentPassword,
        newPassword: newPassword.value,
      }),
      {
        success: () => {
          setPasswordForm({
            currentPassword: "",
          });

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
              success: "Please Login again to your account with your new password",
              error: "Failed to logout, please try again",
            }
          );

          return "Password Updated";
        },
        error: (err) => err.message || "Failed to change password, please try again later",
        loading: "Changing password...",
        position: "top-center",
      }
    );
  };

  return (
    <Dialog open={openAccount} onOpenChange={closeAccountModal}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 ">
        <ScrollArea className="max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">My Account Details</DialogTitle>
            <DialogDescription>Make changes to your profile here. </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="information" className="mt-5">
            <TabsList>
              <TabsTrigger value="information">Personal Information</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="information">
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>To update your personal informations, please contact CCA Head</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-5 ">
                    <div className="flex flex-col md:flex-row gap-5">
                      <InputField
                        disabled={!user?.roles.includes("head")}
                        label="First Name"
                        value={userForm.firstName}
                        onChange={handleInputChange}
                        name="firstName"
                      />
                      <InputField
                        disabled={!user?.roles.includes("head")}
                        label="Last Name"
                        value={userForm.lastName}
                        onChange={handleInputChange}
                        name="lastName"
                      />
                    </div>
                    <InputField
                      disabled={!user?.roles.includes("head")}
                      label="Email"
                      type="email"
                      value={userForm.email}
                      onChange={handleInputChange}
                      name="email"
                    />
                    <div className="flex gap-5">
                      {user?.roles.includes("distributor") && (
                        <InputField
                          disabled={!user.roles.includes("head")}
                          label="Contact Number"
                          type="number"
                          value={userForm.contactNumber + ""}
                          onChange={handleInputChange}
                          name="contactNumber"
                        />
                      )}

                      {/* {user?.department?.name && <InputField label="Trainer of" disabled={true} value={user.department.name} onChange={() => {}} />} */}
                    </div>

                    {user?.roles.includes("distributor") && (
                      <div className="flex gap-5 mb-5">
                        <InputField
                          label="Distributor Type (Cannot Edit)"
                          disabled={true}
                          value={(user as Distributor).distributor.distributorType + ""}
                          onChange={() => {}}
                        />

                        {(user as Distributor).distributor.distributorType === "cca" && (
                          <InputField
                            label="Performing Group (Cannot Edit)"
                            disabled={true}
                            value={(user as Distributor).distributor.department?.name}
                            onChange={() => {}}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Enter your current password and input your new password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-5">
                    <PasswordField
                      error={passwordsError.currentPassword}
                      label="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputsChange}
                      name="currentPassword"
                    />

                    <div className="flex flex-col gap-5">
                      <PasswordWithValidation error={passwordsError.newPassword} password={newPassword} setPassword={setNewPassword} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end ">
                  <Button disabled={!newPassword.isValid || changePassword.isPending} onClick={submitChangePassword}>
                    Change Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Account;
