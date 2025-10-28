import { ContentWrapper } from "@/components/layout/Wrapper";
import { useEffect } from "react";

const Reports = () => {
  useEffect(() => {
    document.title = "Reports";
  }, []);
  return (
    <ContentWrapper>
      <h1 className="text-3xl mb-10">Reports</h1>
    </ContentWrapper>
  );
};

export default Reports;
