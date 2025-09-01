import { PageWrapper, ContentWrapper } from "../../components/layout/Wrapper";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../_lib/@react-client-query/auth";
import { useAuthContext } from "../../context/AuthContext";
import ToastNotification from "../../utils/toastNotification";

import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import PasswordField from "@/components/PasswordField";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidEmail } from "@/utils";

const CCALogin = () => {
  const login = useLogin();
  const { setUser } = useAuthContext();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState("");
  const [loginIn, setLoggingIn] = useState(false);

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

    setLoggingIn(true);
    login.mutate(
      { ...formContent, expectedRole: "cca" },
      {
        onSuccess: (data) => {
          setUser(data);
          ToastNotification.success("Loggin Success");
          setLoggingIn(false);
        },

        onError: (er) => {
          setLoginError(er.message);
          ToastNotification.error("Failed to Login, Please Try again");
          setLoggingIn(false);
        },
      }
    );
  };

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center w-full">
      {/* <img src={background} alt="" className="fixed inset-0 w-full h-full object-cover -z-10" /> */}
      <ContentWrapper className="w-full flex justify-center">
        {/* <div>
            <img src={logo} alt="CCA Logo" className="object-cover" />
          </div> */}

        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Welcome CCA Staff</CardTitle>
            <CardDescription>Log in as a CCA Trainer or CCA Head</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="w-full flex flex-col gap-5">
              <InputField
                error={errors.email}
                label="Email"
                disabled={loginIn}
                name="email"
                value={formContent.email}
                type="email"
                onChange={handleInputChange}
                placeholder="(eg. cca@slu.edu.ph)"
              />
              <PasswordField
                error={errors.password}
                label="Password"
                disabled={loginIn}
                name="password"
                value={formContent.password}
                onChange={handleInputChange}
                placeholder="Password"
              />
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={() => submitForm()} className="w-full" type="submit" disabled={loginIn}>
              Login
            </Button>
            {loginError && <h1 className="mx-auto text-red">{loginError}</h1>}
            <Button className="w-full" variant="outline">
              <Link className="mx-auto hover:opacity-50 duration-500 ease-linear " to="/distributor/login">
                Login as Distributor
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default CCALogin;
