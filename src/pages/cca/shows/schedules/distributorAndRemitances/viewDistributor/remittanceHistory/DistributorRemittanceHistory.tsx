import { useParams } from "react-router-dom";
import { useGetDistributorRemittanceHistory } from "../../../../../../../_lib/@react-client-query/schedule";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/Table";
import { useMemo, useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "../../../../../../../utils/date";
import Button from "../../../../../../../components/ui/Button";

const ITEMS_PER_PAGE = 5;

const DistributorRemittanceHistory = () => {
  const { scheduleId, distributorId } = useParams();
  const { data, isLoading, isError } = useGetDistributorRemittanceHistory(distributorId as string, scheduleId as string);

  const [page, setPage] = useState(1);

  const paginatedLogs = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return data.slice(start, end);
  }, [page, data]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error loading</h1>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Total Tickets Remitted</TableHead>
            <TableHead>Date Remitted</TableHead>
            <TableHead>Time Remitted</TableHead>
            <TableHead>Remitted To</TableHead>
            <TableHead>Amount Remitted</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length == 0 ? (
            <TableRow>
              <TableCell className="text-center py-10 text-gray-400" colSpan={6}>
                No Remittance Yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow key={log.remittanceId}>
                <TableCell>{log.tickets.length}</TableCell>
                <TableCell>{formatToReadableDate(log.dateRemitted + "")}</TableCell>
                <TableCell>{formatToReadableTime(log.dateRemitted + "")}</TableCell>
                <TableCell>{log.receivedBy}</TableCell>
                <TableCell>{log.totalRemittance}</TableCell>
                <TableCell>
                  <Button className="!bg-gray !text-black !border-lightGrey border-2">View Summary</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data.length !== 0 && (
        <div className="mt-5">
          <Pagination currentPage={page} totalPage={Math.ceil(data.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      )}
    </>
  );
};

export default DistributorRemittanceHistory;
