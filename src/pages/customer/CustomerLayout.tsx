import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";

const CustomerLayout = () => {
  return (
    <div className="w-full overflow-y-scroll h-screen">
      <Navbar />
      <PageWrapper>
        <ContentWrapper className="px-4">
          <TooltipProvider>
            <div className="mt-10">
              <Outlet />
            </div>
          </TooltipProvider>
        </ContentWrapper>
      </PageWrapper>
    </div>
  );
};

export default CustomerLayout;
