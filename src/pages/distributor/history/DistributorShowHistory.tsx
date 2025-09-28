import { useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import type { AllocationHistory, RemittanceHistory } from "@/types/ticket";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import PaginatedTable from "@/components/PaginatedTable";

const DistributorShowHistory = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isAllocation, setIsAllocation] = useState<boolean>(true);
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
          <Button onClick={() => navigate(-1)} className="w-fit" variant={"outline"}>
            Back
          </Button>
          <span className="text-xl">
            Showing Schedules for <strong>{showDetails.showTitle}</strong>
          </span>
          {uniqueShowSchedules.map((schedule) => (
            <div key={schedule.scheduleId} className="flex flex-row p-5 gap-10 border w-fit rounded-lg items-center">
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
          <Button className="w-fit" variant={"outline"} onClick={() => setSelectedSchedule(null)}>
            Back
          </Button>
          <span className="text-xl">
            Showing history for <strong>{formatToReadableDate(scheduleDetails.showDate + "")}</strong>
            {" at "}
            <strong>{formatToReadableTime(scheduleDetails.showDate + "")}</strong>
          </span>
          <div className="flex gap-5">
            <span
              className={`${
                isAllocation ? "text-black font-semibold" : "text-lightGrey"
              } text-xl cursor-pointer hover:text-black`}
              onClick={() => setIsAllocation(true)}
            >
              Allocation History
            </span>
            <span
              className={`${
                !isAllocation ? "text-black font-semibold" : "text-lightGrey"
              } text-xl  cursor-pointer hover:text-black`}
              onClick={() => setIsAllocation(false)}
            >
              Remitance History
            </span>
          </div>
          {isAllocation ? (
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
          ) : (
            <PaginatedTable
              columns={[
                {
                  key: "actionType",
                  header: "Remittance Type",
                  render: (log) =>
                    log.actionType === "remit" ? (
                      <div className="flex gap-3 items-center">
                        <span className="p-1 rounded-full bg-green"></span>Remit
                      </div>
                    ) : (
                      <div className="flex gap-3 items-center">
                        <span className="p-1 rounded-full bg-red"></span>Unremit
                      </div>
                    ),
                },
                { key: "totalTickets", header: "Total Tickets", render: (log) => log.tickets.length },
                {
                  key: "remitanceDate",
                  header: "Remittance Date",
                  render: (log) => formatToReadableDate(log.dateRemitted + ""),
                },
                {
                  key: "remitanceTime",
                  header: "Remittance Time",
                  render: (log) => formatToReadableTime(log.dateRemitted + ""),
                },
                { key: "receivedBy", header: "Remitted To", render: (log) => log.receivedBy },
                {
                  key: "totalAmount",
                  header: "Amount Remitted",
                  render: (log) => formatCurrency(log.totalRemittance),
                },
                {
                  key: "commissionReceived",
                  header: "Commission Received",
                  render: (log) => formatCurrency(log.totalCommission),
                },
              ]}
              data={selectedShowScheduleRemittance}
            />
          )}
        </div>
      )}
    </>
  );
};

export default DistributorShowHistory;
