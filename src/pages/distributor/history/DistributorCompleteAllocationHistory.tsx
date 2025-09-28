import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { AllocationHistory } from "@/types/ticket.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";

import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";

const DistributorCompleteAllocationHistory = () => {
  const { allocationHistory } = useOutletContext<{ allocationHistory: AllocationHistory[] }>();

  const [selectedHistory, setSelectedHistory] = useState<AllocationHistory | null>(null);
  const [selectedShow, setSelectedShow] = useState<AllocationHistory | null>(null);
  const [scheduleList, setScheduleList] = useState<AllocationHistory[]>([]);

  // Still an object array
  const uniqueShows = allocationHistory.reduce<AllocationHistory[]>((accumulated, item) => {
    if (!accumulated.some((x) => x.showId === item.showId)) {
      accumulated.push(item);
    }
    return accumulated;
  }, []);

  const handleShowClick = (selectedShow: AllocationHistory) => {
    setSelectedShow(selectedShow);

    const scheduleList = allocationHistory.filter((show) => {
      if (show.showId === selectedShow.showId) return show;
    });

    setScheduleList(scheduleList);
  };

  return (
    <>
      {/* <PaginatedTable
        data={uniqueShows}
        columns={[
          {
            key: "show",
            header: "Show Title",
            render: (show) => (
              <div className="flex items-center gap-2">
                <img className="w-5" src={show.showCover} alt="cover" />
                <p>{show.showTitle}</p>
              </div>
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (show) => (
              <Button onClick={() => handleShowClick(show)} variant={"outline"}>
                View Show Allocation
              </Button>
            ),
          },
        ]}
      />

      {selectedShow && (
        <Modal
          className="max-w-[1000px]"
          title={`Showing schedules for ${selectedShow.showTitle}`}
          isOpen={!!selectedShow}
          onClose={() => setSelectedShow(null)}
        >
          <PaginatedTable
            columns={[
              {
                key: "showSchedule",
                header: "Show Schedule",
                render: (log) =>
                  `${formatToReadableDate(log.showDate + "")} at ${formatToReadableTime(log.showDate + "")}`,
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
                header: "Allocation By",
                render: (log) => `${log.allocatedBy.firstName} ${log.allocatedBy.lastName}`,
              },
              {
                key: "type",
                header: "Type",
                render: (log) =>
                  log.actionType === "allocate" ? (
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
            data={scheduleList}
          />
        </Modal>
      )} */}
      {/* <PaginatedTable
        data={allocationHistory}
        columns={[
          {
            key: "show",
            header: "Show",
            render: (log) => (
              <div className="flex items-center gap-2">
                <img className="w-5" src={log.showCover} alt="cover" />
                <p>{log.showTitle}</p>
              </div>
            ),
          },
          {
            key: "showSchedule",
            header: "Show Schedule",
            render: (log) => `${formatToReadableDate(log.showDate + "")} at ${formatToReadableTime(log.showDate + "")}`,
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
            header: "Allocation By",
            render: (log) => `${log.allocatedBy.firstName} ${log.allocatedBy.lastName}`,
          },
          {
            key: "type",
            header: "Type",
            render: (log) =>
              log.actionType === "allocate" ? (
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
      /> */}

      {/* {selectedHistory && (
        <Modal
          className="max-w-3xl"
          title="Allocation Summary"
          isOpen={!!selectedHistory}
          onClose={() => setSelectedHistory(null)}
        >
          <div className="mb-5">
            <LongCard label="Tickets">
              <LongCardItem
                label={
                  selectedHistory.actionType === "allocate" ? "Total Tickets Allocated" : "Total Tickets Unallocated"
                }
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
                value={`${selectedHistory.allocatedBy.firstName} ${selectedHistory.allocatedBy.lastName}`}
              />
            </LongCard>
          </div>
          <InputField
            onChange={() => {}}
            disabled={true}
            label={
              selectedHistory.actionType === "allocate"
                ? "Ticket Control Numbers Allocated"
                : "Ticket Control Numbers Unallocated"
            }
            value={compressControlNumbers(selectedHistory.tickets.map((ticket) => ticket.controlNumber))}
          />
        </Modal>
      )} */}
    </>
  );
};

export default DistributorCompleteAllocationHistory;
