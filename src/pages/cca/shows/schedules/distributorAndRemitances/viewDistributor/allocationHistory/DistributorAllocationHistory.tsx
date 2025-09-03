import { useParams } from "react-router-dom";
import { useGetDistributorAllocationHistory } from "@/_lib/@react-client-query/schedule.ts";
import { useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import type { AllocationHistory } from "@/types/ticket.ts";
import LongCard from "../../../../../../../components/LongCard";
import LongCardItem from "../../../../../../../components/LongCardItem";
import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaginatedTable from "@/components/PaginatedTable";

const DistributorAllocationHistory = () => {
  const { scheduleId, distributorId } = useParams();
  const { data, isLoading, isError } = useGetDistributorAllocationHistory(distributorId as string, scheduleId as string);

  const [selectedHistory, setSelectedHistory] = useState<AllocationHistory | null>(null);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error loading</h1>;
  }

  return (
    <>
      <PaginatedTable
        data={data}
        columns={[
          {
            key: "total",
            header: "Total Tickets",
            render: (log) => log.tickets.length,
          },
          {
            key: "date",
            header: "Date",
            render: (log) => formatToReadableDate(log.dateAllocated + ""),
          },
          {
            key: "time",
            header: "Time",
            render: (log) => formatToReadableTime(log.dateAllocated + ""),
          },
          {
            key: "action",
            header: "Action By",
            render: (log) => log.allocatedBy.firstName + " " + log.allocatedBy.lastName,
          },
          {
            key: "type",
            header: "Type",
            render: (log) =>
              log.actionType == "allocate" ? (
                <div className="flex gap-2 items-center">
                  <span className="w-3 h-3 rounded-full !bg-green"></span>Allocate
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <span className="w-3 h-3 rounded-full !bg-red"></span>Unallocate
                </div>
              ),
          },
          {
            key: "action",
            header: "Action",
            render: (log) => (
              <Button onClick={() => setSelectedHistory(log)} variant="outline">
                View Tickets
              </Button>
            ),
          },
        ]}
      />

      {selectedHistory && (
        <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tickets Allocated</DialogTitle>
            </DialogHeader>
            <div className="my-5">
              <LongCard className="w-full" label="Tickets">
                <LongCardItem
                  label={selectedHistory.actionType === "allocate" ? "Total Tickets Allocated" : "Total Tickets Unallocated"}
                  value={selectedHistory.tickets.length}
                />
                <LongCardItem
                  label={selectedHistory.actionType === "allocate" ? "Date Allocated" : "Date Unallocated"}
                  value={formatToReadableDate(selectedHistory.dateAllocated + "")}
                />
                <LongCardItem
                  label={selectedHistory.actionType === "allocate" ? "Time Allocated" : "Time Unallocated"}
                  value={formatToReadableTime(selectedHistory.dateAllocated + "")}
                />
                <LongCardItem
                  label={selectedHistory.actionType === "allocate" ? "Allocated by" : "Unallocated by"}
                  value={selectedHistory.allocatedBy.firstName + " " + selectedHistory.allocatedBy.lastName}
                />
              </LongCard>
            </div>
            <InputField
              onChange={(e) => e}
              disabled={true}
              label={selectedHistory.actionType === "allocate" ? "Ticket Control Numbers Allocated" : "Ticket Control Numbers Unallocated"}
              value={compressControlNumbers(selectedHistory.tickets.map((ticket) => ticket.controlNumber))}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DistributorAllocationHistory;
