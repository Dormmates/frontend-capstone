import { useGetTicketLogs } from "@/_lib/@react-client-query/schedule";
import PaginatedTable from "./PaginatedTable";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatCurrency } from "@/utils";

type ViewTicketProps = {
  scheduleId: string;
  controlNumber: number;

  ticketPrice: number;
  status: string;
};

const ViewTicket = ({ scheduleId, controlNumber, ticketPrice, status }: ViewTicketProps) => {
  const { data, isLoading, isError } = useGetTicketLogs(scheduleId, controlNumber);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError || !data) {
    return <h1>Failed to load ticket information</h1>;
  }

  return (
    <div>
      <div>
        <h1>Ticket Control Number: {controlNumber}</h1>
        <p>Ticket Price: {formatCurrency(ticketPrice)}</p>
        <p>Ticket Status: {status.toUpperCase()}</p>
        <p>Current Distributor: {data[0]?.currentDistributor ?? "No Distributor"}</p>
      </div>

      <p className="text-sm font-bold mt-5">Ticket Logs</p>
      <PaginatedTable
        data={data}
        columns={[
          {
            key: "date",
            header: "Log Date",
            render: (data) => formatToReadableDate(data.logDate),
          },
          {
            key: "time",
            header: "Log Time",
            render: (data) => formatToReadableTime(data.logDate),
          },
          {
            key: "actionBy",
            header: "Action By",
            render: (data) => data.actionBy,
          },
          {
            key: "distributor",
            header: "Distributor ",
            render: (data) => data.distributorName,
          },
          {
            key: "actionType",
            header: "Action Type",
            render: (data) => data.logType.toUpperCase(),
          },
        ]}
      />
    </div>
  );
};

export default ViewTicket;
