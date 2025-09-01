import { PageWrapper, ContentWrapper } from "../../components/layout/Wrapper";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "@/_lib/@react-client-query/auth.ts";
import { useAuthContext } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import InputField from "@/components/InputField";
import PasswordField from "@/components/PasswordField";

import { isValidEmail } from "@/utils";

const DistributorLogin = () => {
  const login = useLogin();
  const { setUser } = useAuthContext();
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [formContent, setFormContent] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormContent((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formContent.email) newErrors.email = "Email is required";
    else if (!isValidEmail(formContent.email)) newErrors.email = "Invalid email format";

    if (!formContent.password) newErrors.password = "Password is required";
    else if (formContent.password.length < 6) newErrors.password = "Password too short";

    setErrors(newErrors);
    setLoginError("");
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = () => {
    if (!validate()) return;

    login.mutate(
      { ...formContent, expectedRole: "distributor" },
      {
        onSuccess: (data) => {
          setUser(data);
        },
        onError: (er) => {
          setLoginError(er.message);
        },
      }
    );
  };

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center w-full">
      <ContentWrapper className="w-full flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Welcome Distributor</CardTitle>
            <CardDescription>You are logging in as Distributor</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="w-full flex flex-col gap-5">
              <InputField
                error={errors.email}
                label="Email"
                name="email"
                value={formContent.email}
                type="email"
                onChange={handleInputChange}
                placeholder="(eg. cca@slu.edu.ph)"
              />
              <PasswordField
                error={errors.password}
                label="Password"
                name="password"
                value={formContent.password}
                onChange={handleInputChange}
                placeholder="Password"
              />
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={submitForm}>
              Login
            </Button>
            {loginError && <h1 className="mx-auto text-red">{loginError}</h1>}
            <Button className="w-full" variant="outline">
              <Link className="mx-auto hover:opacity-50 duration-500 ease-linear " to="/">
                Login as CCA Staff
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default DistributorLogin;

// const distributorOptions = [
//   { label: "CCA Member", value: "1" },
//   { label: "Faculty", value: "2" },
//   { label: "Visitor", value: "3" },
// ];

// const groups = [
//   { label: "Group 1", value: "1" },
//   { label: "Group 2", value: "2" },
//   { label: "Group 3", value: "3" },
// ];

// const [openModal, setOpenModal] = useState(false);

// const [newDistributor, setNewDistributor] = useState({
//   firstName: "",
//   lastName: "",
//   email: "",
//   contactNumber: "",
//   distributorType: "",
//   group: "",
//   password: "",
//   confirmPassword: "",
// });

// const handleNewAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const { name, value } = e.target;
//   setNewDistributor((prev) => ({ ...prev, [name]: value }));
// };

{
  /* <Modal className="w-[95%] lg:w-[65%]" isOpen={openModal} onClose={() => setOpenModal(false)} title="Request Distributor Account">
          <form onSubmit={submitForm}>
            <ContentWrapper className="border border-lightGrey  rounded-md mt-5">
              <h1 className="text-xl mb-5">Basic Information</h1>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
                  <TextInput
                    label="First Name"
                    name="firstName"
                    value={newDistributor.firstName}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. Juan"
                  />

                  <TextInput
                    label="Last Name"
                    name="lastName"
                    value={newDistributor.lastName}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. DelaCruz"
                  />
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
                  <TextInput
                    label="Email"
                    name="email"
                    value={newDistributor.email}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. juandelacruz@gmail.com"
                  />
                  <TextInput
                    label="Contact Number"
                    name="contactNumber"
                    type="number"
                    value={newDistributor.contactNumber}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. 09823678231"
                  />
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
                  <Dropdown
                    className="w-full"
                    label="Distributor Type"
                    options={distributorOptions}
                    value={newDistributor.distributorType}
                    onChange={(val) => setNewDistributor((prev) => ({ ...prev, distributorType: val }))}
                  />

                  {newDistributor.distributorType == "1" && (
                    <Dropdown
                      className="w-full"
                      label="Performing Group"
                      options={groups}
                      value={newDistributor.group}
                      onChange={(val) => setNewDistributor((prev) => ({ ...prev, group: val }))}
                    />
                  )}
                </div>
              </div>
            </ContentWrapper>

            <ContentWrapper className="border border-lightGrey rounded-md mt-5">
              <h1 className="text-xl mb-5">Security</h1>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
                  <PasswordInput
                    label="Password"
                    name="password"
                    value={newDistributor.password}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. password123"
                  />
                  <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    value={newDistributor.confirmPassword}
                    onChange={handleNewAccountInputChange}
                    placeholder="eg. password123"
                  />
                </div>
              </div>
            </ContentWrapper>

            <div className="flex gap-5 justify-self-end mt-10">
              <Button type="submit" className="bg-green">
                Create Account
              </Button>
              <Button
                className="bg-red px-5"
                onClick={() => {
                  setNewDistributor({
                    firstName: "",
                    lastName: "",
                    email: "",
                    contactNumber: "",
                    distributorType: "",
                    group: "",
                    password: "",
                    confirmPassword: "",
                  });

                  setOpenModal(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal> */
}
