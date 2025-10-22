import { useGenerateTicketInformation } from "@/_lib/@react-client-query/schedule";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";
import PaginatedTable from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import { formatTicket } from "@/utils/controlNumber";
import { SaveIcon } from "lucide-react";
import { useParams } from "react-router-dom";

const TicketInformations = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { data, isLoading, isError } = useGenerateTicketInformation(scheduleId as string);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load report</p>;
  if (!data) return <p>No data available</p>;

  return (
    <PageWrapper>
      <ContentWrapper className="flex flex-col gap-4 overflow-y-auto  mx-5">
        <div className="flex justify-start gap-4 no-print">
          <Button variant="secondary" onClick={() => window.print()}>
            <SaveIcon />
            Export as PDF
          </Button>
        </div>
        <PaginatedTable
          itemsPerPage={2000}
          data={data}
          columns={[
            {
              key: "control",
              header: "Control Number",
              render: (information) => formatTicket(information.controlNumber),
            },
            {
              key: "distributor",
              header: "Distributor",
              render: (information) => information.distributorName,
            },
            {
              key: "status",
              header: "Ticket Status",
              render: (information) => information.currentStatus,
            },
          ]}
        />
      </ContentWrapper>
    </PageWrapper>
  );
};

export default TicketInformations;
