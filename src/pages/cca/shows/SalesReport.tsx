import { useGenerateSalesReport } from "@/_lib/@react-client-query/show";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageWrapper, ContentWrapper } from "@/components/layout/Wrapper";
import { SalesReportTable } from "./SalesReportTable";
import slu_logo from "@/assets/images/slu-logo.png";
import cca_logo from "@/assets/images/cca-logo.png";
import SalesByDistributor from "./SalesByDistributor";
import { Label } from "@/components/ui/label";
import { SaveIcon } from "lucide-react";

const SalesReport = () => {
  const { showId, scheduleIds } = useParams<{ showId: string; scheduleIds: string }>();
  const scheduleIdsArray = scheduleIds ? scheduleIds.split(",") : [];
  const { data, isLoading, isError } = useGenerateSalesReport(showId as string, scheduleIdsArray);

  const [searchParams] = useSearchParams();
  const includeDistributors = searchParams.get("distributors") === "true";

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load report</p>;
  if (!data) return <p>No data available</p>;

  return (
    <PageWrapper className="overflow-y-auto max-w-full">
      <ContentWrapper className="flex flex-col gap-4 overflow-y-auto  mx-5">
        <header className="text-center">
          <div className="flex items-center justify-center gap-2">
            <img className="w-20" src={slu_logo} alt="SLU logo" />
            <img className="w-28" src={cca_logo} alt="CCA logo" />
          </div>
          <h2 className="text-xl mt-5">Ticket Sales Report</h2>
          <h1 className="text-3xl font-bold">{data.showTitle}</h1>
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Label>Show Report</Label>
            <SalesReportTable report={data} />
          </div>

          {includeDistributors && (
            <div className="flex flex-col gap-1">
              <Label>Distributors Breakdown</Label>
              <SalesByDistributor report={data} />
            </div>
          )}
        </div>

        <div className="flex gap-20 my-10">
          <div className="flex flex-col gap-2">
            <span>Prepared By:</span>
            <span>______________________________________</span>
          </div>
          <div className="flex flex-col gap-2">
            <span>Noted By:</span>
            <span>______________________________________</span>
          </div>
        </div>

        <div className="flex justify-start gap-4 no-print">
          <Button variant="secondary" onClick={() => window.print()}>
            <SaveIcon />
            Export as PDF
          </Button>
          {/* <Button className="w-[200px]" onClick={() => console.log("Export to Excel")}>
            Export as EXCEL
          </Button> */}
        </div>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default SalesReport;
