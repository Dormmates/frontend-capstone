import error from "../assets/images/page-not-found.png";
import errorIcon from "../assets/icons/error.png";
import { ContentWrapper, PageWrapper } from "../components/layout/Wrapper";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageWrapper className="min-h-screen flex justify-center items-center">
        <ContentWrapper>
          <div className="flex flex-col justify-center items-center gap-2 md:flex-row mx-auto">
            <img className="w-full max-w-[500px]" src={error} alt="error-image-404" />
            <div className="flex flex-col gap-4 max-w-[350px]">
              <div className="flex flex-row justify-center md:justify-start items-center gap-2">
                <h1 className="text-2xl font-bold ">404 Page Not Found</h1>
                <img className="w-full max-w-[35px]" src={errorIcon} alt="error-icon" />
              </div>
              <h2 className="text-base font-semibold">The Page you are looking for does not exist!</h2>
              <p className="text-sm font-normal text-gray-500">
                Check that you typed the address correctly, go back to your previous page or try using our site to find something specific
              </p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
          </div>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
};

export default NotFound;
