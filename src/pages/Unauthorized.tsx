import { useNavigate } from "react-router-dom";
import { PageWrapper, ContentWrapper } from "../components/layout/Wrapper";

import errorIcon from "../assets/icons/error.png";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageWrapper>
        <ContentWrapper className="grid place-items-center m-0 h-dvh">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <img className="w-full max-w-[80px]" src={errorIcon} alt="error-icon" />
            <h1 className="text-3xl font-bold">401 Unauthorized</h1>
            <p className="text-sm font-normal text-gray-500">You are not allowed to access this resource</p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </div>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
};

export default Unauthorized;
