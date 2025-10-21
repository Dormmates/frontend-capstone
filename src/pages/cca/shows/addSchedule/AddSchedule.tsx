import { useNavigate, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import React, { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import type { FlattenedSeat } from "@/types/seat.ts";
import type { ErrorKeys, ScheduleFormData, ScheduleFormErrors, SeatPricing } from "@/types/schedule.ts";
import ScheduleDateSelection from "./components/ScheduleDateSelection";
import TicketTypeSelection from "./components/TicketTypeSelection";
import SeatingConfigurationSelector from "./components/SeatingConfigurationSelector";
import PricingSection from "./components/PricingSection";
import { parseControlNumbers, validateControlInput } from "@/utils/controlNumber.ts";
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

// type ControlKey = "orchestraControlNumber" | "balconyControlNumber" | "complimentaryControlNumber";
type ControlKey = "complimentaryControlNumber" | "ticketsControlNumber";

const AddSchedule = () => {
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
    // totalOrchestra: undefined,
    // totalBalcony: undefined,
    totalComplimentary: undefined,
    totalTickets: undefined,
    // orchestraControlNumber: "",
    // balconyControlNumber: "",
    ticketsControlNumber: "",
    complimentaryControlNumber: "",
  });

  useEffect(() => {
    if (data && data.isArchived) {
      navigate(`/shows/${data.showId}`, { replace: true });
    }
  }, [navigate, data]);

  useEffect(() => {
    document.title = `${data?.title} - Add Schedule`;
  }, [data]);

  const [selectedPrice, setSelectedPrice] = useState<TicketPricing | null>(null);

  const [openScheduleSummary, setOpenScheduleSummary] = useState(false);
  const [assignedControlNumbers, setAssignedControlNumbers] = useState<{
    [section: string]: number[];
  }>({});

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
    setScheduleData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (value: Date, index: number) => {
    const updatedDates = scheduleData.dates;
    updatedDates[index] = { ...updatedDates[index], date: value };
    setScheduleData((prev) => ({ ...prev, dates: updatedDates }));
  };

  const handleTimeChange = (value: string, index: number) => {
    const updatedTime = scheduleData.dates;
    updatedTime[index] = { ...updatedTime[index], time: value };
    setScheduleData((prev) => ({ ...prev, dates: updatedTime }));
  };

  const handleSeatPricingType = (value: SeatPricing) => {
    setScheduleData((prev) => ({ ...prev, seatPricing: value }));

    if (scheduleData.seatingConfiguration === "controlledSeating") {
      setSeatData((prev) => prev?.map((seat) => ({ ...seat, ticketPrice: 0 })));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (scheduleData.dates.length === 0 || scheduleData.dates.some((d) => !d.date || !d.time)) {
      newErrors.dates = "Each schedule must have a date and time.";
      isValid = false;
    } else {
      const seen = new Set<string>();
      for (const { date, time } of scheduleData.dates) {
        const key = `${new Date(date).toDateString()}_${time}`;
        if (seen.has(key)) {
          newErrors.dates = "Duplicate date and time entries are not allowed.";
          isValid = false;
          break;
        }
        seen.add(key);
      }
    }

    if (scheduleData.ticketType === "ticketed") {
      if (!selectedPrice || (scheduleData.seatingConfiguration === "freeSeating" && selectedPrice.type == "sectioned")) {
        newErrors.ticketPrice = "Please Select a ticket price";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const getControlSection = (name: ControlKey) => {
    const map = {
      ticketsControlNumber: {
        label: "Tickets",
        total: Number(scheduleData.totalTickets),
        control: scheduleData.ticketsControlNumber,
        totalField: "totalTickets" as ErrorKeys,
        controlField: "ticketsControlNumber" as ErrorKeys,
      },
      complimentaryControlNumber: {
        label: "Complimentary",
        total: Number(scheduleData.totalComplimentary),
        control: scheduleData.complimentaryControlNumber,
        totalField: "totalComplimentary" as ErrorKeys,
        controlField: "complimentaryControlNumber" as ErrorKeys,
      },
    };

    return map[name];
  };

  const validateTicketControlSection = (
    label: string,
    total: number,
    control: string | undefined,
    totalField: ErrorKeys,
    controlField: ErrorKeys,
    used: Set<number>
  ): { isValid: boolean; sectionErrors: Partial<typeof errors> } => {
    const sectionErrors: Partial<typeof errors> = {};
    let isValid = true;

    if (!total || total <= 0) {
      sectionErrors[totalField] = `Please input a valid number of ${label.toLowerCase()} tickets`;
      isValid = false;
    }

    if (!control) {
      sectionErrors[controlField] = `Please enter control numbers for ${label.toLowerCase()} tickets`;
      isValid = false;
    }

    if (control) {
      if (!validateControlInput(control)) {
        sectionErrors[controlField] = `${label} control numbers contain invalid characters`;
        isValid = false;
        return { isValid, sectionErrors };
      }

      try {
        const parsed = parseControlNumbers(control);

        if (parsed.length !== total) {
          sectionErrors[controlField] = `${label} control numbers do not match total (${parsed.length} vs ${total})`;
          isValid = false;
        }

        for (const num of parsed) {
          if (used.has(num)) {
            sectionErrors[controlField] = `${label} has duplicate or overlapping control number: ${num}`;
            isValid = false;
            break;
          }
          used.add(num);
        }
      } catch (err) {
        sectionErrors[controlField] = `${label} control number error: ${(err as Error).message}`;
        isValid = false;
      }
    }

    return { isValid, sectionErrors };
  };

  const validateControlNumbers = (): boolean => {
    // const controlKeys: ControlKey[] = ["orchestraControlNumber", "balconyControlNumber"];
    const controlKeys: ControlKey[] = ["ticketsControlNumber"];

    if (scheduleData.totalComplimentary && scheduleData.totalComplimentary > 0) {
      controlKeys.push("complimentaryControlNumber");
    }

    let isValid = true;
    const newErrors: typeof errors = {};
    const used = new Set<number>();

    for (const key of controlKeys) {
      const { label, total, control, totalField, controlField } = getControlSection(key);

      const result = validateTicketControlSection(label, total, control, totalField, controlField, used);

      if (!result.isValid) isValid = false;
      Object.assign(newErrors, result.sectionErrors);
    }

    setErrors(newErrors);

    return isValid;
  };

  const getRemainingControlNumbers = (section: ControlKey): number[] => {
    try {
      const totalParsed = parseControlNumbers(scheduleData[section]);
      const assigned = assignedControlNumbers[section] || [];
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
    if (!validateControlNumbers()) {
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

      // 🧠 Always recalc assigned control numbers fresh — no merging or adding
      const newRegularAssigned = updated
        .filter((s) => s.ticketControlNumber > 0 && !s.isComplimentary)
        .map((s) => s.ticketControlNumber)
        .sort((a, b) => a - b);

      const newComplimentaryAssigned = updated
        .filter((s) => s.ticketControlNumber > 0 && s.isComplimentary)
        .map((s) => s.ticketControlNumber)
        .sort((a, b) => a - b);

      setAssignedControlNumbers({
        ticketsControlNumber: newRegularAssigned,
        complimentaryControlNumber: newComplimentaryAssigned,
      });

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
              <Button variant="ghost" onClick={addAnotherDate}>
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
            <div className="-mb-16 mt-5">
              <p>Remaining Controll Numbers to be assinged</p>
              <div>
                <p>Tickets: {getRemainingControlNumbers("ticketsControlNumber").length}</p>
                <p>Complimentary: {getRemainingControlNumbers("complimentaryControlNumber").length}</p>
              </div>
            </div>
            <SeatMapSchedule
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
          className="w-fit self-end"
          onClick={() => {
            if (!validate()) {
              toast.error("Please fix all shown errors", { position: "top-center" });
              return;
            }

            if (scheduleData.ticketType === "ticketed") {
              if (!validateControlNumbers()) {
                toast.error("Please fix control number errors", { position: "top-center" });
                return;
              }

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
