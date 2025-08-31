import { PageWrapper, ContentWrapper } from "../../components/layout/Wrapper";
import logo from "../../assets/images/cca-logo.png";
import background from "../../assets/images/background-login.png";

import { useState } from "react";

import { Link } from "react-router-dom";

import { useLogin } from "../../_lib/@react-client-query/auth";
import { useAuthContext } from "../../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";

const distributorOptions = [
  { label: "CCA Member", value: "1" },
  { label: "Faculty", value: "2" },
  { label: "Visitor", value: "3" },
];

const groups = [
  { label: "Group 1", value: "1" },
  { label: "Group 2", value: "2" },
  { label: "Group 3", value: "3" },
];

const DistributorLogin = () => {
  const login = useLogin();
  const { setUser } = useAuthContext();
  const [openModal, setOpenModal] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [formContent, setFormContent] = useState({
    email: "",
    password: "",
  });

  const [newDistributor, setNewDistributor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    distributorType: "",
    group: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormContent((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDistributor((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      <img src={background} alt="" className="fixed inset-0 w-full h-full object-cover -z-10" />
      <ContentWrapper className="w-full">
        <div className="flex flex-col justify-center gap-10 items-center mx-auto w-full lg:max-w-[50%]">
          <div>
            <img src={logo} alt="CCA Logo" />
          </div>
          <h1 className="font-bold text-4xl">Distributor Login</h1>
          <h2 className="text-3xl text-center">Welcome Distributor</h2>
          <form className="w-full flex flex-col gap-5" onSubmit={submitForm}>
            <Input
              // label="Email"
              name="email"
              value={formContent.email}
              type="email"
              onChange={handleInputChange}
              placeholder="(eg. cca@slu.edu.ph)"
            />
            <Input name="password" value={formContent.password} onChange={handleInputChange} placeholder="Password" />
            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
          <Button className="w-full -mt-8 font-normal" variant="outline" type="button" onClick={() => setOpenModal(true)}>
            Request Distributor Account
          </Button>
          {loginError && <h1 className="mx-auto text-red">{loginError}</h1>}
          <Link className="mx-auto hover:opacity-50 duration-500 ease-linear " to="/">
            I'm a CCA Staff : <span className="text-blue-800 underline font-bold">Login as CCA Trainer or Head</span>
          </Link>
        </div>

        {/* <Modal className="w-[95%] lg:w-[65%]" isOpen={openModal} onClose={() => setOpenModal(false)} title="Request Distributor Account">
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
        </Modal> */}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default DistributorLogin;
