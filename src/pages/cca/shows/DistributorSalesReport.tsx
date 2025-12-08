import { useGenerateSalesReport } from "@/_lib/@react-client-query/show";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageWrapper, ContentWrapper } from "@/components/layout/Wrapper";
import slu_logo from "@/assets/images/slu-logo.png";
import cca_logo from "@/assets/images/cca-logo.png";
import SalesByDistributor from "./SalesByDistributor";
import { SaveIcon } from "lucide-react";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const DistributorSalesReport = () => {
  const { showId, scheduleIds } = useParams<{ showId: string; scheduleIds: string }>();
  const scheduleIdsArray = scheduleIds ? scheduleIds.split(",") : [];
  const { data, isLoading, isError } = useGenerateSalesReport(showId as string, scheduleIdsArray);

  if (isLoading) return <Loading />;
  if (isError || !data) return <Error />;

  return (
    <PageWrapper className="overflow-y-auto max-w-full">
      <ContentWrapper className="flex flex-col gap-4 overflow-y-auto  mx-5">
        <header className="text-center">
          <div className="flex items-center justify-center gap-2">
            <img className="w-20" src={slu_logo} alt="SLU logo" />
            <img className="w-28" src={cca_logo} alt="CCA logo" />
          </div>
          <h2 className="text-xl mt-5">Distributor Commissions Report</h2>
          <h1 className="text-3xl font-bold">{data.showTitle}</h1>
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <SalesByDistributor report={data} />
          </div>
        </div>

        <div className="flex justify-start gap-4 no-print">
          <Button variant="secondary" onClick={() => window.print()}>
            <SaveIcon />
            Export as PDF
          </Button>
        </div>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default DistributorSalesReport;
