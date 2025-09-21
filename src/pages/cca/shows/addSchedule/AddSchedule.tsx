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
import { flattenSeatMap } from "@/utils/seatmap.ts";
import SeatMapSchedule from "./components/SeatMapSchedule";
import { useAddSchedule, type AddSchedulePayload } from "@/_lib/@react-client-query/schedule.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import InputField from "@/components/InputField";
import Modal from "@/components/Modal";
import { formatTo12Hour, formatToReadableDate } from "@/utils/date";
import { toast } from "sonner";
import { seatMetaData } from "../../../../../seatmetedata.ts";

type ControlKey = "orchestraControlNumber" | "balconyControlNumber" | "complimentaryControlNumber";

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Orchestra", "Orchestra ")
    .replace("Balcony", "Balcony ")
    .trim();

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
    commissionFee: undefined,
    totalOrchestra: undefined,
    totalBalcony: undefined,
    totalComplimentary: undefined,
    orchestraControlNumber: "",
    balconyControlNumber: "",
    complimentaryControlNumber: "",
  });
  const [ticketPrice, setTicketPrice] = useState("");
  const [sectionedPrice, setSectionedPrice] = useState({
    orchestraLeft: "",
    orchestraMiddle: "",
    orchestraRight: "",
    balconyLeft: "",
    balconyMiddle: "",
    balconyRight: "",
  });

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

    //clear errors
    if (value === "fixed") {
      setSectionedPrice({
        orchestraLeft: "",
        orchestraMiddle: "",
        orchestraRight: "",
        balconyLeft: "",
        balconyMiddle: "",
        balconyRight: "",
      });

      setErrors((prev) => ({
        ...prev,
        orchestraLeft: "",
        orchestraMiddle: "",
        orchestraRight: "",
        balconyLeft: "",
        balconyMiddle: "",
        balconyRight: "",
      }));
    } else {
      setTicketPrice("");
      setErrors((prev) => ({
        ...prev,
        ticketPrice: "",
      }));
    }

    //clear pricing
    if (scheduleData.seatingConfiguration === "controlledSeating") {
      setSeatData((prev) => prev?.map((seat) => ({ ...seat, ticketPrice: 0 })));
    }
  };

  const handleSectionedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSectionedPrice((prev) => ({ ...prev, [name]: value }));

    //update the price on the seat map
    setSeatData((prev) => prev?.map((seat) => (seat.section === name ? { ...seat, ticketPrice: parseFloat(value) || 0 } : seat)));
  };

  const handleFixedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketPrice(e.target.value);

    //update the price on the seat map
    setSeatData((prev) => prev?.map((seat) => ({ ...seat, ticketPrice: parseFloat(e.target.value) || 0 })));
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
      if (scheduleData.seatPricing === "fixed") {
        if (!ticketPrice || Number(ticketPrice) <= 0) {
          newErrors.ticketPrice = "Ticket price must be a positive number";
          isValid = false;
        }
      } else if (scheduleData.seatPricing === "sectionedPricing") {
        const sectionPrices = Object.entries(sectionedPrice);
        const invalidFields = sectionPrices.filter(([, val]) => !val || isNaN(Number(val)) || Number(val) <= 0);

        if (invalidFields.length > 0) {
          for (const [key] of invalidFields) {
            newErrors[key as ErrorKeys] = `Section "${formatLabel(key)}" must have a valid price`;
          }
          isValid = false;
        }
      }
      const fee = scheduleData.commissionFee;

      if (fee === undefined || fee === null || fee < 0) {
        newErrors.commisionFee = "Commission fee must be a non-negative number";
        isValid = false;
      } else {
        if (scheduleData.seatPricing == "fixed" && fee > Number(ticketPrice)) {
          newErrors.commisionFee = "Commission must not be greater than ticket price";
          isValid = false;
        } else if (scheduleData.seatPricing == "sectionedPricing") {
          const hasInvalidSection = Object.values(sectionedPrice).some((price) => fee > Number(price));

          if (hasInvalidSection) {
            newErrors.commisionFee = "Commission must not be greater than any section price";
            isValid = false;
          }
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const getControlSection = (name: ControlKey) => {
    const map = {
      orchestraControlNumber: {
        label: "Orchestra",
        total: Number(scheduleData.totalOrchestra),
        control: scheduleData.orchestraControlNumber,
        totalField: "totalOrchestra" as ErrorKeys,
        controlField: "orchestraControlNumber" as ErrorKeys,
      },
      balconyControlNumber: {
        label: "Balcony",
        total: Number(scheduleData.totalBalcony),
        control: scheduleData.balconyControlNumber,
        totalField: "totalBalcony" as ErrorKeys,
        controlField: "balconyControlNumber" as ErrorKeys,
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
    const controlKeys: ControlKey[] = ["orchestraControlNumber", "balconyControlNumber"];

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

  const getSection = (section: string) => {
    return section.includes("orchestra") ? "orchestra" : section.includes("balcony") ? "balcony" : "complimentary";
  };

  const getRemainingControlNumbers = (section: string): number[] => {
    const controlKey = section.toLowerCase().includes("balcony")
      ? "balconyControlNumber"
      : section.toLowerCase().includes("orchestra")
      ? "orchestraControlNumber"
      : "complimentaryControlNumber";

    try {
      const totalParsed = parseControlNumbers(scheduleData[controlKey]);
      const assigned = assignedControlNumbers[getSection(section)] || [];
      return totalParsed.filter((num) => !assigned.includes(num));
    } catch {
      return [];
    }
  };

  const toggleSeats = (clickedSeats: FlattenedSeat[]) => {
    if (!validateControlNumbers()) {
      toast.error("Please enter ticket control numbers first", { position: "top-center" });
      return;
    }

    setSeatData((prev) => {
      if (!clickedSeats || clickedSeats.length === 0) return prev;

      const section = isComplimentaryMode ? "complimentary" : getSection(clickedSeats[0].section);
      let remaining = getRemainingControlNumbers(section).sort((a, b) => a - b);
      const updated = prev.map((s) => ({ ...s }));

      const hasAssigned = clickedSeats.some((clickedSeat) => {
        const idx = updated.findIndex((s) => s.seatNumber === clickedSeat.seatNumber);
        return idx !== -1 && updated[idx].ticketControlNumber !== 0;
      });

      if (hasAssigned) {
        clickedSeats.forEach((clickedSeat) => {
          const idx = updated.findIndex((s) => s.seatNumber === clickedSeat.seatNumber && s.section === clickedSeat.section);
          if (idx === -1) return;
          const seat = updated[idx];
          if (seat.ticketControlNumber !== 0) {
            remaining = [...remaining, seat.ticketControlNumber].sort((a, b) => a - b);
            seat.ticketControlNumber = 0;
            seat.isComplimentary = false;
          }
        });
      } else {
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

      const newAssigned = updated
        .filter((s) => (isComplimentaryMode ? "complimentary" : getSection(s.section) === section && s.ticketControlNumber > 0))
        .map((s) => s.ticketControlNumber!)
        .sort((a, b) => a - b);

      setAssignedControlNumbers((prevAssigned) => ({
        ...prevAssigned,
        [section]: newAssigned,
      }));

      return updated;
    });
  };

  const handleSubmit = () => {
    const payload: AddSchedulePayload = { ...scheduleData, showId: data.showId };

    if (scheduleData.ticketType === "ticketed") {
      payload.controlNumbers = {
        complimentary: parseControlNumbers(scheduleData.complimentaryControlNumber),
        balcony: parseControlNumbers(scheduleData.balconyControlNumber),
        orchestra: parseControlNumbers(scheduleData.orchestraControlNumber),
      };

      if (scheduleData.seatPricing === "fixed") {
        payload.ticketPrice = Number(ticketPrice);
      }

      if (scheduleData.seatPricing === "sectionedPricing") {
        payload.sectionedPrice = Object.fromEntries(
          Object.entries(sectionedPrice).map(([key, val]) => [key, Number(val)])
        ) as Required<AddSchedulePayload>["sectionedPrice"];
      }

      if (scheduleData.seatingConfiguration === "controlledSeating") {
        payload.seats = seatData;

        // Find duplicates by seatNumber
        const counts: Record<string, number> = {};
        for (const seat of seatData) {
          counts[seat.seatNumber] = (counts[seat.seatNumber] || 0) + 1;
        }

        const duplicates = Object.entries(counts)
          .filter(([_, count]) => count > 1)
          .map(([seatNumber, count]) => ({ seatNumber, count }));

        if (duplicates.length > 0) {
          console.log("🚨 Duplicate seatNumbers found:", duplicates);
        } else {
          console.log("✅ No duplicate seatNumbers");
        }
      }
    }

    toast.promise(
      addSchedule.mutateAsync(payload).then(() => {
        setScheduleData({
          dates: [{ date: new Date(), time: "" }],
          ticketType: "ticketed",
          seatingConfiguration: "freeSeating",
          seatPricing: "fixed",
          commissionFee: undefined,
          totalOrchestra: undefined,
          totalBalcony: undefined,
          totalComplimentary: undefined,
          orchestraControlNumber: "",
          balconyControlNumber: "",
          complimentaryControlNumber: "",
        });
        setTicketPrice("");
        setSectionedPrice({
          orchestraLeft: "",
          orchestraMiddle: "",
          orchestraRight: "",
          balconyLeft: "",
          balconyMiddle: "",
          balconyRight: "",
        });
        queryClient.invalidateQueries({ exact: true, queryKey: ["schedules", id] });
        navigate(`/shows/${id}`);
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
            ticketPrice={ticketPrice}
            sectionedPrice={sectionedPrice}
            handleSeatPricingType={handleSeatPricingType}
            setTicketPrice={handleFixedPriceChange}
            errors={errors}
            handlePriceChange={handleSectionedPriceChange}
          />
        )}

        {scheduleData.ticketType == "ticketed" && (
          <div>
            <InputField
              placeholder="PHP"
              onChange={handleInputChange}
              label="Commission Fee"
              className="max-w-[250px]"
              type="number"
              name="commissionFee"
              value={scheduleData.commissionFee + ""}
              error={errors.commisionFee}
            />
          </div>
        )}

        {scheduleData.ticketType == "ticketed" && (
          <TicketDetailsSection scheduleData={scheduleData} errors={errors} handleInputChange={handleInputChange} />
        )}

        {scheduleData.seatingConfiguration == "controlledSeating" && scheduleData.ticketType == "ticketed" && (
          <>
            <div className="-mb-16 mt-5">
              <p>Remaining Controll Numbers to be assinged</p>
              <div>
                <p>Orchestra: {getRemainingControlNumbers("orchestra").length}</p>
                <p>Balcony: {getRemainingControlNumbers("balcony").length}</p>
                <p>Complimentary: {getRemainingControlNumbers("complimentary").length}</p>
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
                (getRemainingControlNumbers("orchestra").length != 0 ||
                  getRemainingControlNumbers("balcony").length != 0 ||
                  getRemainingControlNumbers("complimentary").length != 0) &&
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
            className="max-w-6xl h-[90%]"
            description="Please review the details before you proceed"
            isOpen={openScheduleSummary}
            onClose={() => setOpenScheduleSummary(false)}
            title="Schedule Summary"
          >
            <div className="space-y-4">
              {/* Dates */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Dates ({scheduleData.dates.length})</h3>
                <ul className="list-disc list-inside space-y-1">
                  {scheduleData.dates.map((date, index) => (
                    <li key={index}>
                      {formatToReadableDate(date.date + "")} at {formatTo12Hour(date.time)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ticket & Seating Info */}
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-semibold">Ticket Type:</span> {scheduleData.ticketType}
                </p>
                <p>
                  <span className="font-semibold">Seating Configuration:</span> {scheduleData.seatingConfiguration}
                </p>
                <p>
                  <span className="font-semibold">Seat Pricing:</span> {scheduleData.seatPricing}
                </p>

                <p>
                  <span className="font-semibold">Commission Fee:</span> ₱{scheduleData.commissionFee}
                </p>

                {scheduleData.seatPricing === "fixed" && (
                  <p>
                    <span className="font-semibold">Ticket Price:</span> ₱{ticketPrice}
                  </p>
                )}
              </div>

              {/* Sectioned Pricing */}
              {scheduleData.seatPricing === "sectionedPricing" && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sectioned Pricing</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <p>Orchestra Left: ₱{sectionedPrice.orchestraLeft}</p>
                    <p>Orchestra Middle: ₱{sectionedPrice.orchestraMiddle}</p>
                    <p> Orchestra Right: ₱{sectionedPrice.orchestraRight}</p>
                    <p>Balcony Left: ₱{sectionedPrice.balconyLeft}</p>
                    <p>Balcony Middle: ₱{sectionedPrice.balconyMiddle}</p>
                    <p>Balcony Right: ₱{sectionedPrice.balconyRight}</p>
                  </div>
                </div>
              )}

              {/* Fees & Tickets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <span className="font-semibold">Orchestra Tickets:</span> {scheduleData.totalOrchestra} ({scheduleData.orchestraControlNumber})
                </p>
                <p>
                  <span className="font-semibold">Balcony Tickets:</span> {scheduleData.totalBalcony} ({scheduleData.balconyControlNumber})
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
