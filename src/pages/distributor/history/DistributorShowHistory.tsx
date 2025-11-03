import { useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import type { AllocationHistory, RemittanceHistory } from "@/types/ticket";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import PaginatedTable from "@/components/PaginatedTable";
import Breadcrumbs from "@/components/BreadCrumbs";
import { ChevronLeftIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DialogPopup from "@/components/DialogPopup";

const DistributorShowHistory = () => {
  const { showId } = useParams();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const { allocationHistory } = useOutletContext<{ allocationHistory: AllocationHistory[] }>();
  const { remittanceHistory } = useOutletContext<{ remittanceHistory: RemittanceHistory[] }>();

  const uniqueShowSchedules = allocationHistory
    .filter((item) => item.showId === showId)
    .reduce<AllocationHistory[]>((acc, item) => {
      if (!acc.some((x) => x.scheduleId === item.scheduleId)) {
        acc.push(item);
      }
      return acc;
    }, []);
  const showDetails = uniqueShowSchedules[0];
  const selectedShowScheduleAllocation = allocationHistory.filter((alloc) => alloc.scheduleId === selectedSchedule);
  const scheduleDetails = selectedShowScheduleAllocation[0];
  const selectedShowScheduleRemittance = remittanceHistory.filter((remit) => remit.scheduleId === selectedSchedule);

  return (
    <>
      {!selectedSchedule && (
        <div className="flex flex-col gap-5 my-5">
          <Breadcrumbs items={[{ name: "Return" }]} />
          <span className="text-xl">
            Showing Schedules for <strong>{showDetails.showTitle}</strong>
          </span>
          {uniqueShowSchedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="flex flex-col sm:flex-row p-5 gap-3 md:gap-10 border w-full sm:w-fit rounded-lg sm:items-center"
            >
              <div className="flex flex-col w-[150px]">
                <span className="font-semibold">Show Date</span>
                <span>{formatToReadableDate(schedule.showDate + "")}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Show Time</span>
                <span>{formatToReadableTime(schedule.showDate + "")}</span>
              </div>
              <Button onClick={() => setSelectedSchedule(schedule.scheduleId)}>View Schedule History</Button>
            </div>
          ))}
        </div>
      )}
      {selectedSchedule && (
        <div className="flex flex-col gap-5 my-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Button size="icon" variant={"outline"} onClick={() => setSelectedSchedule(null)}>
              <ChevronLeftIcon />
            </Button>
            <p className="text-sm">Return</p>
          </div>
          <span className="text-xl">
            Showing history for <strong>{formatToReadableDate(scheduleDetails.showDate + "")}</strong>
            {" at "}
            <strong>{formatToReadableTime(scheduleDetails.showDate + "")}</strong>
          </span>

          <Tabs defaultValue="allocation">
            <TabsList>
              <TabsTrigger value="allocation">Allocation History</TabsTrigger>
              <TabsTrigger value="payment">Payment History</TabsTrigger>
            </TabsList>
            <TabsContent value="allocation">
              <PaginatedTable
                columns={[
                  {
                    key: "actionType",
                    header: "Allocation Type",
                    render: (log) =>
                      log.actionType === "allocate" ? (
                        <div className="flex gap-3 items-center">
                          <span className="p-1 rounded-full bg-green"></span>Allocate
                        </div>
                      ) : (
                        <div className="flex gap-3 items-center">
                          <span className="p-1 rounded-full bg-red"></span>Unallocate
                        </div>
                      ),
                  },
                  { key: "totalTickets", header: "Total Tickets", render: (log) => log.tickets.length },
                  {
                    key: "allocationDate",
                    header: "Allocation Date",
                    render: (log) => formatToReadableDate(log.dateAllocated + ""),
                  },
                  {
                    key: "allocationTime",
                    header: "Allocation Time",
                    render: (log) => formatToReadableTime(log.dateAllocated + ""),
                  },
                  {
                    key: "allocatedBy",
                    header: "Allocated By",
                    render: (log) => log.allocatedBy.firstName + " " + log.allocatedBy.lastName,
                  },
                ]}
                data={selectedShowScheduleAllocation}
              />
            </TabsContent>
            <TabsContent value="payment">
              <PaginatedTable
                columns={[
                  {
                    key: "actionType",
                    header: "Payment Type",
                    render: (log) =>
                      log.actionType === "payToCCA" ? (
                        <div className="flex gap-3 items-center">
                          <span className="p-1 rounded-full bg-green"></span>Pay to CCA
                        </div>
                      ) : (
                        <div className="flex gap-3 items-center">
                          <span className="p-1 rounded-full bg-red"></span>Revert Payment
                        </div>
                      ),
                  },
                  { key: "totalTickets", header: "Total Tickets", render: (log) => log.tickets.length },
                  {
                    key: "remitanceDate",
                    header: "Transaction Date",
                    render: (log) => formatToReadableDate(log.dateRemitted + ""),
                  },
                  {
                    key: "remitanceTime",
                    header: " Time",
                    render: (log) => formatToReadableTime(log.dateRemitted + ""),
                  },
                  { key: "receivedBy", header: "Remitted To", render: (log) => log.receivedBy },
                  {
                    key: "totalAmount",
                    header: "Amount",
                    render: (log) =>
                      log.actionType === "payToCCA" ? formatCurrency(log.totalRemittance + log.totalCommission) : formatCurrency(log.totalRemittance),
                  },
                  {
                    key: "commissionReceived",
                    header: "Commission Received",
                    render: (log) => (log.actionType === "payToCCA" ? formatCurrency(log.totalCommission) : formatCurrency(0)),
                  },
                  {
                    key: "remarks",
                    header: "Remarks",
                    render: (log) => {
                      const remarks = log.remarks || "";
                      const shortText = remarks.length > 20 ? remarks.slice(0, 20) + "..." : remarks || "—";

                      return (
                        <DialogPopup title="Transaction Remarks" triggerElement={<p>{shortText}</p>}>
                          <div className="max-w-md break-words whitespace-pre-wrap max-h-[90%] overflow-y-auto">
                            {remarks || "No remarks provided."}
                          </div>
                        </DialogPopup>
                      );
                    },
                  },
                ]}
                data={selectedShowScheduleRemittance}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default DistributorShowHistory;
