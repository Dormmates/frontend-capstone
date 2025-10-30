import { useNavigate, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import React, { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import type { FlattenedSeat } from "@/types/seat.ts";
import type { ScheduleFormData, ScheduleFormErrors, SeatPricing } from "@/types/schedule.ts";
import ScheduleDateSelection from "./components/ScheduleDateSelection";
import TicketTypeSelection from "./components/TicketTypeSelection";
import SeatingConfigurationSelector from "./components/SeatingConfigurationSelector";
import PricingSection from "./components/PricingSection";
import { parseControlNumbers } from "@/utils/controlNumber.ts";
import TicketDetailsSection from "./components/TicketDetailsSection";
import { flattenSeatMap, sortSeatsByRowAndNumber } from "@/utils/seatmap.ts";
import SeatMapSchedule from "./components/SeatMapSchedule";
import { useAddSchedule, type AddSchedulePayload } from "@/_lib/@react-client-query/schedule.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import Modal from "@/components/Modal";
import { formatTo12Hour, formatToReadableDate } from "@/utils/date";
import { toast } from "sonner";
import { seatMetaData } from "../../../../../seatmetedata.ts";
import type { FixedPricing, SectionedPricing, TicketPricing } from "@/types/ticketpricing.ts";
import FixedPrice from "@/components/FixedPrice.tsx";
import SectionedPrice from "@/components/SectionedPrice.tsx";
import { useAuthContext } from "@/context/AuthContext.tsx";

// type ControlKey = "orchestraControlNumber" | "balconyControlNumber" | "complimentaryControlNumber";
type ControlKey = "complimentaryControlNumber" | "ticketsControlNumber";

const AddSchedule = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const addSchedule = useAddSchedule();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetShow(id as string);
  const [seatData, setSeatData] = useState(() => flattenSeatMap(seatMetaData));
  const [scheduleData, setScheduleData] = useState<ScheduleFormData>({
    dates: [{ date: new Date(), time: "" }],
    ticketType: "ticketed",
    seatingConfiguration: "freeSeating",
    seatPricing: "fixed",
    totalComplimentary: undefined,
    totalTickets: undefined,
    ticketsControlNumber: "",
    complimentaryControlNumber: "",
  });

  useEffect(() => {
    if (data && data.isArchived) {
      navigate(`/shows/${data.showId}`, { replace: true });
    }
  }, [navigate, data]);

  useEffect(() => {
    if (data?.showType === "majorProduction" && !user?.roles.includes("head")) {
      navigate(`/shows/${data.showId}`, { replace: true });
      toast.error("Only CCA Head can add a Schedule to a Major Production Show", { position: "top-center" });
    }
  }, [navigate, data]);

  useEffect(() => {
    document.title = `${data?.title} - Add Schedule`;
  }, [data]);

  const [selectedPrice, setSelectedPrice] = useState<TicketPricing | null>(null);

  const [openScheduleSummary, setOpenScheduleSummary] = useState(false);

  const [errors, setErrors] = useState<ScheduleFormErrors>({});

  const [isComplimentaryMode, setComplimentaryMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) setComplimentaryMode(true);
    };
    const handleKeyUp = () => setComplimentaryMode(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (selectedPrice?.type === "sectioned") {
      setSeatData((prev) =>
        prev?.map((seat) => {
          const price = selectedPrice.sectionPrices[seat.section as keyof typeof selectedPrice.sectionPrices];
          return price !== undefined ? { ...seat, ticketPrice: price } : seat;
        })
      );
    }
    if (selectedPrice?.type === "fixed") {
      setSeatData((prev) =>
        prev?.map((seat) => ({
          ...seat,
          ticketPrice: selectedPrice.fixedPrice,
        }))
      );
    }
  }, [selectedPrice, setSeatData]);

  const hasErrors = Object.values(errors).some((error) => error && error.trim() !== "");

  if (isLoading) {
    return <h1>Fetching Show information...</h1>;
  }

  if (isError) {
    return <h1>Error Fetching show {error.message}</h1>;
  }

  if (!data) {
    return <h1>Error Fetching show</h1>;
  }

  const addAnotherDate = () => {
    setScheduleData((prev) => ({
      ...prev,
      dates: [...prev.dates, { date: new Date(), time: "" }],
    }));
  };

  const removeDate = (index: number) => {
    const newDates = scheduleData.dates.filter((_, i) => i !== index);
    setScheduleData((prev) => ({
      ...prev,
      dates: newDates,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedData = {
      ...scheduleData,
      [name]: value,
    };

    const ticketsCount = parseInt(updatedData.totalTickets + "") || 0;
    const complimentaryCount = parseInt(updatedData.totalComplimentary + "") || 0;

    setScheduleData(updatedData);
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "totalTickets" || name === "totalComplimentary") {
      if (ticketsCount <= 0 && name === "totalTickets") {
        setErrors((prev) => ({ ...prev, totalTickets: "Total tickets must be greater than 0." }));
        setScheduleData((prev) => ({ ...prev, ticketsControlNumber: "", complimentaryControlNumber: "" }));
        return;
      }

      if (ticketsCount + complimentaryCount > seatData.length) {
        const msg = `Total tickets cannot exceed available seats (${seatData.length}).`;
        setErrors((prev) => ({ ...prev, totalTickets: msg, totalComplimentary: msg }));
        setScheduleData((prev) => ({ ...prev, ticketsControlNumber: "", complimentaryControlNumber: "" }));
        return;
      }

      const newData = { ...updatedData };

      if (ticketsCount > 0) {
        newData.ticketsControlNumber = `1-${ticketsCount}`;
      } else {
        newData.ticketsControlNumber = "";
      }

      if (complimentaryCount > 0 && ticketsCount > 0) {
        newData.complimentaryControlNumber = `${ticketsCount + 1}-${ticketsCount + complimentaryCount}`;
      } else {
        newData.complimentaryControlNumber = "";
      }

      setScheduleData(newData);
      setErrors((prev) => ({ ...prev, totalTickets: "", totalComplimentary: "" }));
    }
  };

  const handleDateChange = (value: Date, index: number) => {
    const updatedDates = scheduleData.dates;
    updatedDates[index] = { ...updatedDates[index], date: value };
    setScheduleData((prev) => ({ ...prev, dates: updatedDates }));
    setErrors((prev) => ({ ...prev, dates: "" }));
  };

  const handleTimeChange = (value: string, index: number) => {
    const updatedTime = scheduleData.dates;
    updatedTime[index] = { ...updatedTime[index], time: value };
    setScheduleData((prev) => ({ ...prev, dates: updatedTime }));
    setErrors((prev) => ({ ...prev, dates: "" }));
  };

  const handleSeatPricingType = (value: SeatPricing) => {
    setScheduleData((prev) => ({ ...prev, seatPricing: value }));

    if (scheduleData.seatingConfiguration === "controlledSeating") {
      setSeatData((prev) => prev?.map((seat) => ({ ...seat, ticketPrice: 0 })));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (scheduleData.dates.length === 0 || scheduleData.dates.some((d) => !d.date || !d.time)) {
      newErrors.dates = "Each schedule must have a date and time.";
    } else {
      const seen = new Set<string>();
      for (const { date, time } of scheduleData.dates) {
        const key = `${new Date(date).toDateString()}_${time}`;
        if (seen.has(key)) {
          newErrors.dates = "Duplicate date and time entries are not allowed.";

          break;
        }
        seen.add(key);
      }
    }

    if (scheduleData.ticketType === "ticketed") {
      if (!selectedPrice || (scheduleData.seatingConfiguration === "freeSeating" && selectedPrice.type === "sectioned")) {
        newErrors.ticketPrice = "Please select a valid ticket price.";
      }

      if (!scheduleData.totalTickets) {
        newErrors.totalTickets = "Please input ticket count";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRemainingControlNumbers = (section: ControlKey, seats = seatData): number[] => {
    const controlRange = scheduleData[section];
    if (!controlRange) return [];

    try {
      const totalParsed = parseControlNumbers(controlRange);
      const assigned = seats
        .filter((s) =>
          section === "ticketsControlNumber" ? s.ticketControlNumber > 0 && !s.isComplimentary : s.ticketControlNumber > 0 && s.isComplimentary
        )
        .map((s) => s.ticketControlNumber);

      return totalParsed.filter((num) => !assigned.includes(num));
    } catch {
      return [];
    }
  };

  const rebalanceControlNumbers = (seats: FlattenedSeat[]) => {
    const regularSeats = seats.filter((s) => s.ticketControlNumber > 0 && !s.isComplimentary);
    const complimentarySeats = seats.filter((s) => s.ticketControlNumber > 0 && s.isComplimentary);

    const sortedRegular = sortSeatsByRowAndNumber(regularSeats);
    const sortedComplimentary = sortSeatsByRowAndNumber(complimentarySeats);

    const allRegularNumbers = sortedRegular.map((s) => s.ticketControlNumber);
    const allComplimentaryNumbers = sortedComplimentary.map((s) => s.ticketControlNumber);

    const minRegular = allRegularNumbers.length > 0 ? Math.min(...allRegularNumbers) : 1;
    const minComplimentary = allComplimentaryNumbers.length > 0 ? Math.min(...allComplimentaryNumbers) : 1;

    sortedRegular.forEach((seat, index) => {
      seat.ticketControlNumber = minRegular + index;
    });

    sortedComplimentary.forEach((seat, index) => {
      seat.ticketControlNumber = minComplimentary + index;
    });
  };

  const toggleSeats = (clickedSeats: FlattenedSeat[]) => {
    if (errors.complimentaryControlNumber || errors.ticketsControlNumber) {
      toast.error("Please enter ticket control numbers first", { position: "top-center" });
      return;
    }

    setSeatData((prev) => {
      if (!clickedSeats || clickedSeats.length === 0) return prev;

      const section = isComplimentaryMode ? "complimentaryControlNumber" : "ticketsControlNumber";
      const updated = prev.map((s) => ({ ...s }));
      const remaining = getRemainingControlNumbers(section).sort((a, b) => a - b);

      const hasAssigned = clickedSeats.some((clickedSeat) =>
        updated.find((s) => s.seatNumber === clickedSeat.seatNumber && s.section === clickedSeat.section && s.ticketControlNumber !== 0)
      );

      if (hasAssigned) {
        // UNASSIGN MODE
        clickedSeats.forEach((clickedSeat) => {
          const idx = updated.findIndex((s) => s.seatNumber === clickedSeat.seatNumber && s.section === clickedSeat.section);
          if (idx === -1) return;

          updated[idx].ticketControlNumber = 0;
          updated[idx].isComplimentary = false;
        });
      } else {
        // ASSIGN MODE
        for (const clickedSeat of clickedSeats) {
          const idx = updated.findIndex((s) => s.seatNumber === clickedSeat.seatNumber && s.section === clickedSeat.section);
          if (idx === -1) continue;

          const seat = updated[idx];
          if (remaining.length === 0) {
            toast.error("No more control numbers available for this section", {
              position: "top-center",
            });
            break;
          }

          const assignNum = remaining.shift()!;
          seat.ticketControlNumber = assignNum;
          seat.isComplimentary = isComplimentaryMode;
        }
      }

      rebalanceControlNumbers(updated);
      return updated;
    });
  };

  const handleSubmit = () => {
    const payload: AddSchedulePayload = { ...scheduleData, showId: data.showId, ticketPricing: selectedPrice as TicketPricing };

    if (scheduleData.ticketType === "ticketed") {
      payload.controlNumbers = {
        complimentary: parseControlNumbers(scheduleData.complimentaryControlNumber),
        tickets: parseControlNumbers(scheduleData.ticketsControlNumber),
      };

      if (scheduleData.seatingConfiguration === "controlledSeating") {
        payload.seats = seatData;
      }
    }

    toast.promise(
      addSchedule.mutateAsync(payload).then(() => {
        queryClient.invalidateQueries({ exact: true, queryKey: ["schedules", id] });
        navigate(`/shows/${id}`, { replace: true });
      }),
      {
        position: "top-center",
        loading: "Adding schedule...",
        success: "Schedule Added",
        error: (err) => err.message || "Failed to add schedule",
      }
    );
  };

  return (
    <ContentWrapper>
      <Breadcrumbs
        backHref={`/shows/${id}`}
        items={[
          { name: `Return to Schedule List`, href: `/shows/${id}` },
          { name: "Add Schedule", href: "" },
        ]}
      />
      <h1 className="text-3xl mt-10">Add Schedule for "{data.title}"</h1>

      <div className="mt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 flex-wrap">
            <ScheduleDateSelection
              scheduleData={scheduleData}
              removeDate={removeDate}
              handleDateChange={handleDateChange}
              handleTimeChange={handleTimeChange}
              errors={errors}
            />

            {scheduleData.dates.length < 3 ? (
              <Button variant="secondary" onClick={addAnotherDate}>
                Add Another Schedule
              </Button>
            ) : (
              <p>You can only add up to 3 schedules at a time.</p>
            )}
          </div>

          <div>
            <TicketTypeSelection scheduleData={scheduleData} setScheduleData={setScheduleData} />
          </div>
        </div>

        <div>
          <SeatingConfigurationSelector scheduleData={scheduleData} setScheduleData={setScheduleData} />
        </div>
        {scheduleData.ticketType == "ticketed" && (
          <PricingSection
            setErrors={setErrors}
            scheduleData={scheduleData}
            setSelectedPrice={setSelectedPrice}
            selectedPrice={selectedPrice}
            handleSeatPricingType={handleSeatPricingType}
            errors={errors}
          />
        )}

        {scheduleData.ticketType == "ticketed" && (
          <TicketDetailsSection scheduleData={scheduleData} errors={errors} handleInputChange={handleInputChange} />
        )}

        {scheduleData.seatingConfiguration == "controlledSeating" && scheduleData.ticketType == "ticketed" && (
          <>
            <div className="-mb-16 mt-5"></div>
            <SeatMapSchedule
              regularRemaining={getRemainingControlNumbers("ticketsControlNumber").length}
              complimentaryRemaining={getRemainingControlNumbers("complimentaryControlNumber").length}
              seatMap={seatData}
              seatClick={(clickedSeat: FlattenedSeat) => {
                toggleSeats([clickedSeat]);
              }}
              rowClick={(clickedSeats: FlattenedSeat[]) => {
                toggleSeats(clickedSeats);
              }}
              sectionClick={(clickedSeats: FlattenedSeat[]) => {
                toggleSeats(clickedSeats);
              }}
            />
          </>
        )}

        <Button
          disabled={hasErrors}
          className="w-fit self-end"
          onClick={() => {
            if (!validate()) {
              toast.error("Please fix all shown errors", { position: "top-center" });
              return;
            }

            if (scheduleData.ticketType === "ticketed") {
              if (
                (getRemainingControlNumbers("ticketsControlNumber").length != 0 ||
                  getRemainingControlNumbers("complimentaryControlNumber").length != 0) &&
                scheduleData.seatingConfiguration === "controlledSeating"
              ) {
                toast.error("Not all Ticket Controll Number are assigned", { position: "top-center" });
                return;
              }
            }

            setOpenScheduleSummary(true);
          }}
        >
          Add Schedule
        </Button>

        {openScheduleSummary && (
          <Modal
            className={`${scheduleData.seatingConfiguration === "controlledSeating" && scheduleData.ticketType == "ticketed" && "h-[90%] max-w-6xl"}`}
            description="Please review the details before you proceed"
            isOpen={openScheduleSummary}
            onClose={() => setOpenScheduleSummary(false)}
            title="Schedule Summary"
          >
            <div className="flex flex-col gap-2">
              {/* Dates */}
              <div>
                <p>
                  <span className="font-semibold">Dates:</span> ({scheduleData.dates.length})
                </p>
                <div>
                  {scheduleData.dates.map((date, index) => (
                    <p key={index}>
                      {index + 1}: {formatToReadableDate(date.date + "")} at {formatTo12Hour(date.time)}
                    </p>
                  ))}
                </div>
              </div>
              <p>
                <span className="font-semibold">Ticket Type:</span> {scheduleData.ticketType}
              </p>

              {/* Ticket & Seating Info */}

              {scheduleData.ticketType == "ticketed" && (
                <>
                  <p>
                    <span className="font-semibold">Seating Configuration:</span> {scheduleData.seatingConfiguration}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p>
                      <span className="font-semibold">Seat Pricing:</span> {scheduleData.seatPricing}
                    </p>

                    {scheduleData.seatPricing === "fixed" && <FixedPrice hideAction={true} data={selectedPrice as FixedPricing} />}
                    {scheduleData.seatPricing === "sectionedPricing" && <SectionedPrice hideAction={true} data={selectedPrice as SectionedPricing} />}

                    {/* Fees & Tickets */}
                    <p>
                      <span className="font-semibold">Tickets:</span> {scheduleData.totalTickets} ({scheduleData.ticketsControlNumber})
                    </p>

                    <p>
                      <span className="font-semibold">Complimentary Tickets:</span> {scheduleData.totalComplimentary} (
                      {scheduleData.complimentaryControlNumber})
                    </p>
                  </div>

                  {/* Controlled Seating */}
                  {scheduleData.seatingConfiguration === "controlledSeating" && (
                    <div className="flex flex-col gap-2">
                      <SeatMapSchedule disabled={true} seatMap={seatData} />
                      <p className="text-red-500 text-sm self-end italic">Note: Unassigned Seat will be disabled</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer button */}
            <div className="flex justify-end mt-6">
              <Button disabled={addSchedule.isPending} onClick={handleSubmit}>
                Add Schedule
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </ContentWrapper>
  );
};

export default AddSchedule;
