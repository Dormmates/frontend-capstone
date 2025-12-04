import { useGetScheduleSeatMap, useGetShowsWithAvailableTicket, useTransferTicket } from "@/_lib/@react-client-query/schedule";
import ControlNumberGrid from "@/components/ControlNumberGrid";
import { DataTable } from "@/components/DataTable";
import Modal from "@/components/Modal";
import SeatMap from "@/components/SeatMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/AuthContext";
import type { Schedule, ScheduleWithTickets } from "@/types/schedule";
import type { FlattenedSeat } from "@/types/seat";
import type { ShowData, ShowDataWithSchedulesAndTickets } from "@/types/show";
import type { Ticket } from "@/types/ticket";
import { formatCurrency } from "@/utils";
import { formatTicket } from "@/utils/controlNumber";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatSectionName } from "@/utils/seatmap";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, ArrowDownIcon, ChevronLeftIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type TransferTicketProps = {
  ticket: Ticket;
  schedule: Schedule;
  show: ShowData;
};

const TransferTicket = ({ ticket, schedule, show }: TransferTicketProps) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const transferTicket = useTransferTicket();

  const { data: shows, isLoading } = useGetShowsWithAvailableTicket({ scheduleId: schedule.scheduleId, showId: show.showId });
  const [selectedShow, setSelectedShow] = useState<ShowDataWithSchedulesAndTickets | null>(null);
  const [selectedShowSchedule, setSelectedShowSchedule] = useState<ScheduleWithTickets | null>(null);
  const [selectedControlNumbers, setSelectedControlNumbers] = useState<number[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<FlattenedSeat | null>(null);
  const [isTransferSummary, setIsTransferSummary] = useState(false);
  const [transferRemarks, setTransferRemarks] = useState("");

  if (isLoading) {
    return <h1>loading...</h1>;
  }

  const submitTransfer = () => {
    if (!user?.userId) {
      toast.error("Trainer information missing", { position: "top-center" });
      return;
    }

    if (!selectedShowSchedule?.scheduleId) {
      toast.error("New schedule not selected", { position: "top-center" });
      return;
    }

    // For controlled seating, make sure a seat is selected
    let newControlNumber: number | undefined;
    if (selectedShowSchedule.seatingType === "controlledSeating") {
      if (!selectedSeat?.ticketControlNumber) {
        toast.error("Please select a seat for the new schedule", { position: "top-center" });
        return;
      }
      newControlNumber = selectedSeat.ticketControlNumber;
    } else {
      if (!selectedControlNumbers?.length) {
        toast.error("No control number selected", { position: "top-center" });
        return;
      }
      newControlNumber = selectedControlNumbers[0];
    }

    const payload = {
      remarks: transferRemarks.trim(),
      trainerId: user.userId,
      scheduleId: schedule.scheduleId,
      controlNumber: ticket.controlNumber,
      newScheduleId: selectedShowSchedule.scheduleId,
      newControlNumber,
    };

    toast.promise(transferTicket.mutateAsync(payload), {
      success: () => {
        setSelectedShow(null);
        setSelectedControlNumbers([]);
        setSelectedShowSchedule(null);
        setSelectedSeat(null);
        setIsTransferSummary(false);
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", schedule.scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", selectedShowSchedule.scheduleId], exact: true });
        return "Ticket Transfer";
      },
      loading: "Transfering Ticket...",
      error: (err) => err.message || "Ticket Transfer failed, please try again later",
      position: "top-center",
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto ">
      <div>
        <p>Ticket Control Number to transfer: {formatTicket(ticket.controlNumber)}</p>
        <p>Show: {show.title}</p>
        <p>
          Schedule: {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
        </p>
      </div>

      {shows && shows.length > 0 && !selectedShow ? (
        <div className="mt-5">
          {show &&
            (() => {
              const sameShow = shows.find((s) => s.showId === show.showId);
              return sameShow ? (
                <div>
                  <p className="font-bold text-sm mb-2">Exchange to Same Show, Different Schedule:</p>
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                    <ShowCard key={sameShow.showId} show={sameShow} setSelectedShow={setSelectedShow} />
                  </div>
                </div>
              ) : null;
            })()}

          {/* <div className="mt-5">
            <p className="font-bold text-sm mb-2">Transfer to Other Shows:</p>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {shows
                .filter((s) => s.showId !== show?.showId)
                .map((filteredShow) => (
                  <ShowCard key={filteredShow.showId} show={filteredShow} setSelectedShow={setSelectedShow} />
                ))}
            </div>
          </div> */}
        </div>
      ) : (
        !selectedShow && <div className="w-full p-5 py-10 text-center border mt-5 rounded-md">No Available Schedule to exchange</div>
      )}

      {selectedShow && (
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              onClick={() => {
                setSelectedShow(null);
                setSelectedControlNumbers([]);
                setSelectedShowSchedule(null);
                setSelectedSeat(null);
              }}
              variant="outline"
            >
              <ChevronLeftIcon />
            </Button>
            <p className="text-sm">Back</p>
          </div>

          <ViewShowSchedules
            scrollY={scrollY}
            setIsTransferSummary={setIsTransferSummary}
            selectedSeat={selectedSeat}
            setSelectedSeat={setSelectedSeat}
            selectedControlNumbers={selectedControlNumbers}
            setSelectedControlNumbers={setSelectedControlNumbers}
            selectedShowSchedule={selectedShowSchedule}
            show={selectedShow}
            setSelectedShowSchedule={setSelectedShowSchedule}
          />
        </div>
      )}

      {isTransferSummary && (selectedControlNumbers.length > 0 || selectedSeat) && selectedShow && selectedShowSchedule && (
        <Modal
          title="Exchange Summary"
          isOpen={isTransferSummary}
          onClose={() => {
            if (transferTicket.isPending) return;
            setIsTransferSummary(false);
          }}
        >
          {selectedShowSchedule && (
            <div className="flex flex-col justify-center items-center gap-2 ">
              <div className="border p-3 rounded-md w-full bg-muted">
                <h1 className="font-bold">Current Ticket</h1>
                <p>Ticket Control Number to transfer: {formatTicket(ticket.controlNumber)}</p>
                <p>Ticket Price: {formatCurrency(ticket.ticketPrice)}</p>
                <p>Show: {show.title}</p>
                <p>
                  Schedule: {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
                </p>
              </div>

              <ArrowDownIcon />

              <div className="w-full">
                {(() => {
                  const newTicketControlNumber =
                    selectedShowSchedule.seatingType === "controlledSeating" && selectedSeat
                      ? selectedSeat.ticketControlNumber
                      : selectedControlNumbers[0];

                  const newTicketPrice =
                    selectedShowSchedule.seatingType === "controlledSeating"
                      ? selectedSeat?.ticketPrice ?? 0
                      : selectedShowSchedule.tickets.find((t) => t.controlNumber === selectedControlNumbers[0])?.ticketPrice ?? 0;

                  const priceDifference = newTicketPrice - ticket.ticketPrice;

                  return (
                    <>
                      <div className="border p-3 rounded-md w-full bg-muted">
                        <h1 className="font-bold">Exchanged To</h1>
                        <p>New Ticket: {formatTicket(newTicketControlNumber)}</p>
                        <p>Ticket Price: {formatCurrency(newTicketPrice)}</p>
                        <p>Show: {selectedShow?.title}</p>
                        <p>
                          Schedule: {formatToReadableDate(selectedShowSchedule.datetime + "")} at{" "}
                          {formatToReadableTime(selectedShowSchedule.datetime + "")}
                        </p>
                      </div>

                      <div className="mt-3">
                        <Label>Exchange Remarks (Optional)</Label>
                        <Textarea disabled={transferTicket.isPending} value={transferRemarks} onChange={(e) => setTransferRemarks(e.target.value)} />
                      </div>

                      {priceDifference !== 0 && (
                        <div
                          className={`border ${
                            priceDifference > 0 ? "bg-red/20 border-red text-red" : "bg-green/20 border-green text-green"
                          } flex items-start gap-2 p-2 rounded-sm mt-5`}
                        >
                          {priceDifference > 0 && <AlertCircleIcon className="w-[30px]" />}
                          <p className="text-sm font-bold">
                            {priceDifference > 0
                              ? "Note: Current Ticket Price and the New Ticket Price are not equal. You should ask the customer for additional payment."
                              : "Note: New Ticket Price is lower. You should return the extra amount to the customer."}
                          </p>
                        </div>
                      )}

                      {priceDifference !== 0 && (
                        <div className="flex items-start gap-2 p-2 rounded-sm mt-2 justify-end">
                          <p className="text-sm font-bold">
                            {priceDifference > 0
                              ? `Amount to receive: ${formatCurrency(priceDifference)}`
                              : `Amount to return: ${formatCurrency(Math.abs(priceDifference))}`}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-2">
            <Button disabled={transferTicket.isPending} onClick={submitTransfer}>
              Confirm Transfer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

type ShowCardProps = {
  show: ShowDataWithSchedulesAndTickets;
  setSelectedShow: React.Dispatch<React.SetStateAction<ShowDataWithSchedulesAndTickets | null>>;
};

const ShowCard = ({ show, setSelectedShow }: ShowCardProps) => {
  return (
    <div
      onClick={() => setSelectedShow(show)}
      className="flex flex-col border rounded-md shadow-md cursor-pointer hover:shadow-primary/80 hover:border-primary/80 duration-300 ease-linear"
    >
      <div className="aspect-square w-full max-h-[150px]">
        <img className="object-cover w-full h-full rounded-t-md" src={show.showCover} alt={show.title} />
      </div>
      <div className="gap-1 flex flex-col p-2">
        <p>{show.title}</p>
        <p>{formatSectionName(show.showType)}</p>
        <p>{show.department?.name ?? "All Group"}</p>
        <p>Available Schedule: {show.schedules.length}</p>
      </div>
    </div>
  );
};

type ViewShowSchedulesProps = {
  scrollY: number;
  show: ShowDataWithSchedulesAndTickets;
  setSelectedShowSchedule: React.Dispatch<React.SetStateAction<ScheduleWithTickets | null>>;
  selectedShowSchedule: ScheduleWithTickets | null;
  selectedControlNumbers: number[];
  setSelectedControlNumbers: React.Dispatch<React.SetStateAction<number[]>>;
  selectedSeat: FlattenedSeat | null;
  setSelectedSeat: React.Dispatch<React.SetStateAction<FlattenedSeat | null>>;
  setIsTransferSummary: React.Dispatch<React.SetStateAction<boolean>>;
};

const ViewShowSchedules = ({
  selectedSeat,
  setSelectedSeat,
  show,
  selectedShowSchedule,
  setSelectedShowSchedule,
  selectedControlNumbers,
  setSelectedControlNumbers,
  setIsTransferSummary,
}: ViewShowSchedulesProps) => {
  const {
    data: seatMap,
    isLoading: loadingSeats,
    isError: errorSeats,
  } = useGetScheduleSeatMap(selectedShowSchedule?.scheduleId as string, { enabled: !!selectedShowSchedule?.scheduleId });

  const seatSummary = useMemo(() => {
    if (!seatMap)
      return {
        available: 0,
        notAvailable: 0,
      };

    return seatMap.reduce(
      (summary, seat) => {
        if (seat.isComplimentary || seat.status !== "available" || seat.ticketControlNumber == 0) summary.notAvailable++;
        if (seat.status === "available" && !seat.isComplimentary && seat.ticketControlNumber !== 0) summary.available++;
        return summary;
      },
      { available: 0, notAvailable: 0 }
    );
  }, [seatMap]);

  return (
    <div>
      <div className="relative z-10 flex flex-col md:flex-row gap-5 p-6">
        <div className="max-w-[100px] h-[150px] flex-shrink-0">
          <img className="w-full h-full object-cover rounded-lg shadow-lg" src={show.showCover} alt="img" />
        </div>

        <div className="flex flex-col">
          <div className="font-bold text-2xl ">{show.title}</div>
        </div>
      </div>
      <div>
        <DataTable
          columns={[
            {
              key: "date",
              header: "Date",
              render: (schedule) => formatToReadableDate(schedule.datetime + ""),
            },
            {
              key: "date",
              header: "Date",
              render: (schedule) => formatToReadableTime(schedule.datetime + ""),
            },
            {
              key: "available",
              header: "Tickets Available",
              render: (schedule) => schedule.tickets.filter((t) => t.status === "not_allocated" && !t.isComplimentary).length,
            },
            {
              key: "type",
              header: "Seating Type",
              render: (schedule) => formatSectionName(schedule.seatingType),
            },
            {
              key: "pricing",
              header: "Ticket Pricing",
              render: (schedule) => formatSectionName(schedule.ticketPricing.type),
            },
            {
              key: "action",
              header: "Action",
              headerClassName: "text-end",
              render: (schedule) => (
                <div className="flex justify-end">
                  <Button
                    disabled={selectedShowSchedule?.scheduleId === schedule.scheduleId}
                    onClick={() => setSelectedShowSchedule(schedule)}
                    variant={selectedShowSchedule?.scheduleId === schedule.scheduleId ? "secondary" : "default"}
                  >
                    {selectedShowSchedule?.scheduleId === schedule.scheduleId ? "Selected" : "Select Schedule"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={show.schedules}
        />
      </div>

      {selectedShowSchedule && (
        <div>
          <div className="mt-5">
            <p>
              <span>Transfer Ticket to: </span>
              <span>
                {formatToReadableDate(selectedShowSchedule.datetime + "")} at {formatToReadableTime(selectedShowSchedule.datetime + "")}
              </span>
            </p>
            <p>{selectedShowSchedule.seatingType === "freeSeating" ? "Select Control Number to be given" : "Select Seat"}</p>
          </div>
          {selectedShowSchedule.seatingType === "freeSeating" ? (
            <ControlNumberGrid
              maxSelectable={1}
              allowSlideSelection={true}
              selectedControlNumbers={selectedControlNumbers}
              setSelectedControlNumbers={setSelectedControlNumbers}
              tickets={selectedShowSchedule.tickets.map((t) => t.controlNumber)}
            />
          ) : loadingSeats ? (
            <div>Loading Seats</div>
          ) : seatMap && !errorSeats ? (
            <div className="mt-5 flex flex-col gap-5">
              <div className="flex gap-2 flex-col justify-end">
                <div className="flex gap-2 items-center">
                  <div className="w-5 h-5 bg-white border"></div>
                  <p>Available Seats: {seatSummary.available}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-5 h-5 bg-darkGrey border"></div>
                  <p>Not Available Seats: {seatSummary.notAvailable}</p>
                </div>
              </div>

              <SeatMap
                showToggle={false}
                recStyle={(seat) => {
                  if (seat.status != "available" || seat.isComplimentary) return "fill-darkGrey";
                  if (selectedSeat && seat.ticketControlNumber === selectedSeat.ticketControlNumber) return "fill-blue-500";
                  if (seat.status === "available") return "fill-white";
                  return "";
                }}
                seatMap={seatMap}
                seatClick={(seat) => {
                  if (seat.ticketControlNumber == 0 || seat.isComplimentary || seat.status !== "available") {
                    toast.error("Seat in unavailable", { position: "top-center" });
                    return;
                  }

                  setSelectedSeat((prev) => (prev && prev.ticketControlNumber === seat.ticketControlNumber ? null : seat));
                }}
              />
            </div>
          ) : (
            <div>Failed to load Seat Map</div>
          )}
        </div>
      )}

      {(selectedControlNumbers.length !== 0 || selectedSeat) && (
        <div className="flex justify-end mt-5">
          <Button onClick={() => setIsTransferSummary(true)}>Exchange Ticket</Button>
        </div>
      )}
    </div>
  );
};

export default TransferTicket;
