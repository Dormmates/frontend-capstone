import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Distributor } from "@/types/user";

type Props = {
  openAccount: boolean;
  setOpenAccount: React.Dispatch<React.SetStateAction<boolean>>;
};

const Account = ({ openAccount, setOpenAccount }: Props) => {
  const { user } = useAuthContext();
  const [userForm, setUserForm] = useState({
    firstName: user?.firstName + "",
    lastName: user?.lastName + "",
    email: user?.email + "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    contactNumber: user?.roles.includes("distributor") ? (user as Distributor).distributor.contactNumber : "",
  });

  const closeAccountModal = () => {
    setUserForm({
      firstName: user?.firstName + "",
      lastName: user?.lastName + "",
      email: user?.email + "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      contactNumber: user?.roles.includes("distributor") ? (user as Distributor).distributor.contactNumber : "",
    });

    setOpenAccount(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={openAccount} onOpenChange={closeAccountModal}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 ">
        <ScrollArea className="max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">My Account Details</DialogTitle>
            <DialogDescription>Make changes to your profile here. </DialogDescription>
          </DialogHeader>
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

                  {user?.department?.name && <InputField label="Trainer of" disabled={true} value={user.department.name} onChange={() => {}} />}
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

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Enter your current password and input your new password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <PasswordField label="Current Password" value={userForm.currentPassword} onChange={handleInputChange} name="currentPassword" />

                <div className="flex flex-col md:flex-row gap-5">
                  <PasswordField label="New Password" value={userForm.newPassword} onChange={handleInputChange} name="newPassword" />
                  <PasswordField label="Confirm Password" value={userForm.confirmPassword} onChange={handleInputChange} name="confirmPassword" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end ">
              <Button>Change Password</Button>
            </CardFooter>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Account;
