import { PageWrapper, ContentWrapper } from "../../components/layout/Wrapper";
import { useEffect, useState } from "react";
import { useLogin } from "@/_lib/@react-client-query/auth.ts";
import { useAuthContext } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import PasswordField from "@/components/PasswordField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidEmail } from "@/utils";
import { toast } from "sonner";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import logo from "@/assets/images/cca-logo.png";

const CCALogin = () => {
  const login = useLogin();
  const { setUser } = useAuthContext();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState("");

  const [formContent, setFormContent] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = `SLU CCA - Login`;
  }, []);

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

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    toast.promise(
      login.mutateAsync({ ...formContent, expectedRole: "cca" }).then((data) => {
        setUser(data);
      }),
      {
        position: "top-center",
        loading: "Logging in...",
        success: "Login Successful ",
        error: (err: any) => err.message || "Failed to login, please try again",
      }
    );
  };

  return (
    <div className="bg-muted">
      <header className="fixed right-10 top-10"></header>
      <PageWrapper className="min-h-screen flex items-center justify-center w-full ">
        <ContentWrapper className="w-full flex justify-center px-3">
          <Card className="w-full max-w-lg bg-background">
            <CardHeader>
              <div className="flex justify-end mb-10">
                <ThemeSwitch />
              </div>
              <div className="flex flex-col gap-1">
                <img className="w-28" src={logo} alt="logo" />
                <div className="flex items-center justify-between"></div>
                <CardTitle className="text-3xl">Sign in</CardTitle>
                <CardDescription>Log in to access your CCA dashboard and manage shows, tickets, and schedules.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitForm} className="w-full flex flex-col gap-5">
                <InputField
                  className="bg-background"
                  error={errors.email}
                  label="Email"
                  disabled={login.isPending}
                  name="email"
                  value={formContent.email}
                  type="email"
                  onChange={handleInputChange}
                  placeholder="(eg. cca@slu.edu.ph)"
                />
                <PasswordField
                  className="bg-background"
                  error={errors.password}
                  label="Password"
                  disabled={login.isPending}
                  name="password"
                  value={formContent.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />

                <Button className="w-full mt-3" type="submit" disabled={login.isPending}>
                  Login
                </Button>
                {loginError && <h1 className="mx-auto text-red">{loginError}</h1>}
              </form>
            </CardContent>
            {/* <CardFooter className="flex flex-col gap-3">
              <div className="flex w-full justify-center gap-2 items-center overflow-hidden my-3">
                <Separator className="w-full" />
                <p className="text-sm font-medium text-muted-foreground">Or</p>
                <Separator className="w-full" />
              </div>
              <Button className="w-full" variant="secondary">
                <Link className="mx-auto hover:opacity-50 duration-500 ease-linear " to="/distributor/login">
                  Login as Distributor
                </Link>
              </Button>
            </CardFooter> */}
          </Card>
        </ContentWrapper>
      </PageWrapper>
    </div>
  );
};

export default CCALogin;
