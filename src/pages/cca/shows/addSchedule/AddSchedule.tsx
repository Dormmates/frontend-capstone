import { useNavigate, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import React, { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import type { ScheduleFormData, ScheduleFormErrors, SeatPricing } from "@/types/schedule.ts";
import ScheduleDateSelection from "./components/ScheduleDateSelection";
import TicketTypeSelection from "./components/TicketTypeSelection";
import SeatingConfigurationSelector from "./components/SeatingConfigurationSelector";
import PricingSection from "./components/PricingSection";
import { parseControlNumbers } from "@/utils/controlNumber.ts";
import TicketDetailsSection from "./components/TicketDetailsSection";
import { flattenSeatMap } from "@/utils/seatmap.ts";
import SeatMapSchedule from "./components/SeatMapSchedule";
import { useAddSchedule, type AddSchedulePayload } from "@/_lib/@react-client-query/schedule.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import Modal from "@/components/Modal";
import { convertDatesPH, formatTo12Hour, formatToReadableDate } from "@/utils/date";
import { toast } from "sonner";
import { seatMetaData } from "../../../../../seatmetedata.ts";
import type { FixedPricing, SectionedPricing, TicketPricing } from "@/types/ticketpricing.ts";
import FixedPrice from "@/components/FixedPrice.tsx";
import SectionedPrice from "@/components/SectionedPrice.tsx";
import { useAuthContext } from "@/context/AuthContext.tsx";
import Dropdown from "@/components/Dropdown.tsx";

export const rowOptions = [
  { name: "Row AA", value: "AA" },
  { name: "Row BB", value: "BB" },
  { name: "Row CC", value: "CC" },
  { name: "Row A", value: "A" },
  { name: "Row B", value: "B" },
  { name: "Row C", value: "C" },
  { name: "Row D", value: "D" },
  { name: "Row E", value: "E" },
  { name: "Row F", value: "F" },
  { name: "Row G", value: "G" },
  { name: "Row H", value: "H" },
  { name: "Row I", value: "I" },
  { name: "Row J", value: "J" },
  { name: "Row K", value: "K" },
  { name: "Row L", value: "L" },
  { name: "Row M", value: "M" },
  { name: "Row N", value: "N" },
  { name: "Row O", value: "O" },
  { name: "Row P", value: "P" },
  { name: "Row Q", value: "Q" },
  { name: "Row R", value: "R" },
  { name: "Row S", value: "S" },
  { name: "Row T", value: "T" },
  { name: "Row U", value: "U" },
];

const AddSchedule = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const addSchedule = useAddSchedule();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetShow(id as string);
  const [seatData, setSeatData] = useState(() => flattenSeatMap(seatMetaData));
  const [startingRow, setStartingRow] = useState("A");
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
      navigate(`/${data.showType === "majorProduction" ? "majorShows" : "shows"}/${data.showId}`, { replace: true });
    }
  }, [navigate, data]);

  useEffect(() => {
    if (data?.showType === "majorProduction" && !user?.roles.includes("head")) {
      navigate(`/shows/${data.showId}`, { replace: true });
      toast.error("Only CCA Head can add a Schedule to a Major Production Show", { position: "top-center" });
    }
  }, [navigate, data]);

  useEffect(() => {
    if (scheduleData.seatingConfiguration !== "controlledSeating") return;

    const totalTickets = parseInt(scheduleData.totalTickets + "") || 0;
    const totalComplimentary = parseInt(scheduleData.totalComplimentary + "") || 0;

    if (totalTickets + totalComplimentary > seatData.length) return;

    const newTicketsControlNumber = totalTickets > 0 ? `1-${totalTickets}` : "";

    const newComplimentaryControlNumber = totalComplimentary > 0 ? `${totalTickets + 1}-${totalTickets + totalComplimentary}` : "";

    setScheduleData((prev) => ({
      ...prev,
      ticketsControlNumber: newTicketsControlNumber,
      complimentaryControlNumber: newComplimentaryControlNumber,
    }));
  }, [scheduleData.totalTickets, scheduleData.totalComplimentary, scheduleData.seatingConfiguration, seatData.length]);

  useEffect(() => {
    document.title = `${data?.title} - Add Schedule`;
  }, [data]);

  const [selectedPrice, setSelectedPrice] = useState<TicketPricing | null>(null);
  const [openScheduleSummary, setOpenScheduleSummary] = useState(false);
  const [errors, setErrors] = useState<ScheduleFormErrors>({});

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

    let updatedData = { ...scheduleData, [name]: value };

    let ticketsCount = parseInt(updatedData.totalTickets + "") || 0;
    let complimentaryCount = parseInt(updatedData.totalComplimentary + "") || 0;
    const totalSeats = seatData.length;

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (scheduleData.seatingConfiguration === "controlledSeating") {
      if (name === "totalComplimentary") {
        if (complimentaryCount <= totalSeats) {
          ticketsCount = Math.max(totalSeats - complimentaryCount, 0);
          updatedData.totalTickets = ticketsCount;
        }
      } else if (name === "totalTickets") {
        if (ticketsCount <= totalSeats) {
          complimentaryCount = Math.max(totalSeats - ticketsCount, 0);
          updatedData.totalComplimentary = complimentaryCount;
        }
      }
    }

    if (ticketsCount + complimentaryCount > totalSeats) {
      const msg = `Total tickets cannot exceed available seats (${totalSeats}).`;
      setErrors((prev) => ({
        ...prev,
        totalTickets: msg,
        totalComplimentary: msg,
      }));

      setScheduleData((prev) => ({
        ...prev,
        ...updatedData,
        ticketsControlNumber: "",
        complimentaryControlNumber: "",
      }));
      return;
    }

    updatedData.ticketsControlNumber = ticketsCount > 0 ? `1-${ticketsCount}` : "";
    updatedData.complimentaryControlNumber =
      complimentaryCount > 0 && ticketsCount > 0 ? `${ticketsCount + 1}-${ticketsCount + complimentaryCount}` : "";

    setErrors((prev) => ({ ...prev, totalTickets: "", totalComplimentary: "" }));
    setScheduleData(updatedData);
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

  const handleSubmit = () => {
    const payload: AddSchedulePayload = {
      ...scheduleData,
      dates: convertDatesPH(scheduleData.dates),
      showId: data.showId,
      ticketPricing: selectedPrice as TicketPricing,
    };

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
        navigate(`/${data.showType === "majorProduction" ? "majorShows" : "shows"}/${id}`, { replace: true });
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
        backHref={`/${data.showType === "majorProduction" ? "majorShows" : "shows"}/${id}`}
        items={[
          { name: `Return to Schedule List`, href: `/${data.showType === "majorProduction" ? "majorShows" : "shows"}/${id}` },
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
          <SeatingConfigurationSelector
            setErrors={setErrors}
            seatCount={seatData.length}
            scheduleData={scheduleData}
            setScheduleData={setScheduleData}
          />
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
            <div className="">
              <Dropdown
                includeHeader={true}
                label="Ticket Control Number Starting Row"
                items={rowOptions}
                value={startingRow}
                onChange={(v) => setStartingRow(v)}
              />
            </div>
            <SeatMapSchedule
              setErrors={setErrors}
              error={errors.complimentary}
              startingRow={startingRow}
              scheduleData={{
                ticketsControlNumber: scheduleData.ticketsControlNumber,
                complimentaryControlNumber: scheduleData.complimentaryControlNumber,
              }}
              complimentaryCount={scheduleData.totalComplimentary as number}
              disabled={addSchedule.isPending}
              setSeatData={setSeatData}
              seatMap={seatData}
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
                      <span className="font-semibold">Tickets:</span> {scheduleData.totalTickets} {`(${scheduleData.ticketsControlNumber})`}
                    </p>

                    <p>
                      <span className="font-semibold">Complimentary Tickets:</span> {scheduleData.totalComplimentary}{" "}
                      {`(${scheduleData.complimentaryControlNumber})`}
                    </p>
                  </div>

                  {/* Controlled Seating */}
                  {scheduleData.seatingConfiguration === "controlledSeating" && (
                    <div className="flex flex-col gap-2">
                      <SeatMapSchedule
                        setErrors={setErrors}
                        error={errors.complimentary}
                        startingRow={startingRow}
                        scheduleData={{
                          ticketsControlNumber: scheduleData.ticketsControlNumber,
                          complimentaryControlNumber: scheduleData.complimentaryControlNumber,
                        }}
                        complimentaryCount={scheduleData.totalComplimentary as number}
                        disabled={true}
                        setSeatData={setSeatData}
                        seatMap={seatData}
                      />
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
