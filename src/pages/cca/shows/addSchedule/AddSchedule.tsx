import { useNavigate, useParams } from "react-router-dom";
import { useGetShow } from "../../../../_lib/@react-client-query/show";
import React, { useState } from "react";
import { ContentWrapper } from "../../../../components/layout/Wrapper";
import BreadCrumb from "../../../../components/ui/BreadCrumb";
import Button from "../../../../components/ui/Button";
import TextInput from "../../../../components/ui/TextInput";

import type { FlattenedSeat } from "../../../../types/seat";
import type { ErrorKeys, ScheduleFormData, ScheduleFormErrors, SeatPricing } from "../../../../types/schedule";
import ScheduleDateSelection from "./components/ScheduleDateSelection";
import TicketTypeSelection from "./components/TicketTypeSelection";
import SeatingConfigurationSelector from "./components/SeatingConfigurationSelector";
import PricingSection from "./components/PricingSection";
import { parseControlNumbers, validateControlInput } from "../../../../utils/controlNumber";
import TicketDetailsSection from "./components/TicketDetailsSection";

import { seatMap } from "../../../../../seatdata";
import { flattenSeatMap, formatSectionName } from "../../../../utils/seatmap";
import Modal from "../../../../components/ui/Modal";
import SeatMapSchedule from "./components/SeatMapSchedule";
import ToastNotification from "../../../../utils/toastNotification";
import { useAddSchedule, type AddSchedulePayload } from "../../../../_lib/@react-client-query/schedule";
import { useQueryClient } from "@tanstack/react-query";

type ControlKey = "orchestraControlNumber" | "balconyControlNumber" | "complimentaryControlNumber";

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Orchestra", "Orchestra ")
    .replace("Balcony", "Balcony ")
    .trim();

const getRowLabel = (seats: FlattenedSeat[] | undefined) => {
  if (!seats || seats.length === 0) return "";
  const rowName = seats[0].row;
  const seatNumbers = seats.map((s) => parseInt(s.seatNumber.match(/\d+/)?.[0] || "0"));
  const min = Math.min(...seatNumbers);
  const max = Math.max(...seatNumbers);
  return `Row: ${rowName} ${min} - ${max}`;
};

const AddSchedule = () => {
  const navigate = useNavigate();
  const addSchedule = useAddSchedule();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetShow(id as string);
  const [seatData, setSeatData] = useState(() => flattenSeatMap(seatMap));
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

  const [selectedSeats, setSelectedSeats] = useState<FlattenedSeat[]>();
  const [rowToggle, setRowToggle] = useState(false);
  const [sectionToggle, setSectionToggle] = useState(false);
  const [seatToggle, setSeatToggle] = useState(false);

  const [ticketInput, setTicketInput] = useState({ controlNumber: "", isComplimentary: false });
  const [assignedControlNumbers, setAssignedControlNumbers] = useState<{
    [section: string]: number[];
  }>({});

  const [errors, setErrors] = useState<ScheduleFormErrors>({});

  if (isLoading) {
    return <h1>Fetching Show information...</h1>;
  }

  if (isError) {
    return <h1>Error Fetching show {error.message}</h1>;
  }

  if (!data) {
    return <h1>Error Fetching show</h1>;
  }

  const handleOpenTicketModal = (type: "seat" | "row" | "section") => {
    if (!validateControlNumbers()) {
      ToastNotification.error("Please enter valid values for ticket control number first");
      return;
    }

    const toggles = {
      seat: setSeatToggle,
      row: setRowToggle,
      section: setSectionToggle,
    };

    toggles[type](true);
  };

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

      if (scheduleData.seatingConfiguration === "controlledSeating") {
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
    const controlKeys: ControlKey[] = ["orchestraControlNumber", "balconyControlNumber", "complimentaryControlNumber"];

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

  const assignControlNumbers = (numbers: number[], section: string) => {
    setAssignedControlNumbers((prev) => {
      const updated = new Set([...(prev[section] || []), ...numbers]);
      return { ...prev, [section]: Array.from(updated) };
    });
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

  const validateTicketInput = () => {
    const section = selectedSeats?.[0]?.section;
    const isRow = rowToggle;
    const isSection = sectionToggle;
    const controlStr = ticketInput.controlNumber.trim();
    const isComplimentary = ticketInput.isComplimentary;

    if (!section || !controlStr) {
      ToastNotification.error("Missing control number or section");
      return;
    }

    if (!validateControlInput(controlStr)) {
      ToastNotification.error(`"${controlStr}" control number input contain invalid characters`);
      return;
    }

    let controlNums: number[];
    try {
      controlNums = parseControlNumbers(controlStr);
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastNotification.error(err.message);
      } else {
        ToastNotification.error("An unexpected error occurred.");
      }
      return;
    }

    const unassigned = getRemainingControlNumbers(getSection(!isComplimentary ? section : "complimentary"));

    // Validate against duplicates
    for (const num of controlNums) {
      if (!unassigned.includes(num)) {
        ToastNotification.error(`Control number ${num} is already used or not valid for this section`);
        return;
      }
    }
    if ((isRow || isSection) && controlNums.length > (selectedSeats?.length || 0)) {
      ToastNotification.error(`Control number count (${controlNums.length}) must not be greater than required (${selectedSeats?.length || 0})`);
      return;
    }

    if (!selectedSeats?.length) return;

    const seatMap = new Map(selectedSeats.slice(0, controlNums.length).map((s, i) => [s.seatNumber, controlNums[i]]));

    setSeatData((prev) =>
      prev.map((seat) =>
        seatMap.has(seat.seatNumber)
          ? {
              ...seat,
              ticketControlNumber: seatMap.get(seat.seatNumber)!,
              isComplimentary: ticketInput.isComplimentary,
            }
          : seat
      )
    );

    assignControlNumbers(controlNums, getSection(!isComplimentary ? section : "complimentary"));
    ToastNotification.success("Control number(s) assigned");

    // Close modal
    setSeatToggle(false);
    setRowToggle(false);
    setSectionToggle(false);
    setTicketInput({ controlNumber: "", isComplimentary: false });
  };

  const handleSubmit = () => {
    if (scheduleData.ticketType === "ticketed") {
      if (!validate() || !validateControlNumbers()) {
        ToastNotification.error("Please fix all errors first");
        return;
      }

      if (
        (getRemainingControlNumbers("orchestra").length != 0 ||
          getRemainingControlNumbers("balcony").length != 0 ||
          getRemainingControlNumbers("complimentary").length != 0) &&
        scheduleData.seatingConfiguration === "controlledSeating"
      ) {
        ToastNotification.error("Not all Ticket Controll Number are assigned");
        return;
      }
    }

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

      if (scheduleData.seatingConfiguration == "controlledSeating") {
        payload.seats = seatData;
      }
    }

    addSchedule.mutate(payload, {
      onSuccess: () => {
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
        ToastNotification.success("Schedule Addded");
      },
      onError: (error) => {
        ToastNotification.error(error.message);
      },
    });
  };

  return (
    <ContentWrapper className="lg:!p-20 flex flex-col">
      <BreadCrumb
        backLink={`/shows/${id}`}
        items={[
          { name: data.title, path: `/shows/${id}` },
          { name: "Add Schedule", path: "" },
        ]}
      />
      <h1 className="text-3xl mt-10">Add Schedule for {data.title}</h1>

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

            <Button onClick={addAnotherDate} variant="plain" className="!text-black font-normal underline !p-0 !w-fit !h-fit self-end">
              Add Another Schedule
            </Button>
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
            <TextInput
              placeholder="PHP"
              onChange={handleInputChange}
              label="Commission Fee"
              className="max-w-[250px]"
              type="number"
              name="commissionFee"
              value={scheduleData.commissionFee + ""}
              isError={!!errors.commisionFee}
              errorMessage={errors.commisionFee}
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
                setSelectedSeats([clickedSeat]);
                handleOpenTicketModal("seat");
              }}
              rowClick={(clickedSeats: FlattenedSeat[]) => {
                setSelectedSeats(clickedSeats.filter((seat) => seat.ticketControlNumber === 0));
                handleOpenTicketModal("row");
              }}
              sectionClick={(clickedSeats: FlattenedSeat[]) => {
                setSelectedSeats(clickedSeats.filter((seat) => seat.ticketControlNumber === 0));
                handleOpenTicketModal("section");
                console.log("Section Toggle: " + sectionToggle);
              }}
            />

            {(seatToggle || rowToggle || sectionToggle) && (
              <Modal
                className="flex flex-col max-w-[500px]"
                title="Assign Ticket Control Number"
                onClose={() => {
                  setSeatToggle(false);
                  setRowToggle(false);
                  setSectionToggle(false);
                  setTicketInput({ controlNumber: "", isComplimentary: false });
                }}
                isOpen={seatToggle || rowToggle || sectionToggle}
              >
                <div className="mt-5 bg-zinc-100 border border-darkGrey p-2">
                  <p>Section: {formatSectionName(selectedSeats?.[0]?.section || "")}</p>
                  {rowToggle ? <p>{getRowLabel(selectedSeats)}</p> : <p>Seat Number: {selectedSeats?.[0]?.seatNumber}</p>}
                  <p>PHP {selectedSeats?.[0]?.ticketPrice?.toFixed(2) || "0.00"}</p>

                  {selectedSeats?.[0]?.ticketControlNumber == 0 && (
                    <div className="mt-2 text-sm text-gray-700 !max-w-fit">
                      Unassigned Control Numbers (
                      <span className="font-medium">
                        {getRemainingControlNumbers(ticketInput.isComplimentary ? "complimentary" : selectedSeats?.[0]?.section || "").length || " 0"}
                        tickets{" "}
                      </span>
                      ) :
                      <span className="font-normal text-black">
                        {getRemainingControlNumbers(ticketInput.isComplimentary ? "complimentary" : selectedSeats?.[0]?.section || "").join(", ") ||
                          "None"}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSeats?.[0]?.ticketControlNumber === 0 ? (
                  <>
                    {getRemainingControlNumbers("complimentary").length != 0 ||
                    getRemainingControlNumbers("orchestra").length != 0 ||
                    getRemainingControlNumbers("balcony").length != 0 ? (
                      <>
                        <div className="flex gap-2 mt-5">
                          <input
                            type="checkbox"
                            checked={ticketInput.isComplimentary}
                            onChange={(e) =>
                              setTicketInput((prev) => ({
                                ...prev,
                                isComplimentary: e.target.checked,
                              }))
                            }
                          />
                          <p className="text-sm">Is Complimentary Ticket?</p>
                        </div>

                        {(ticketInput.isComplimentary && getRemainingControlNumbers("complimentary").length !== 0) ||
                        (!ticketInput.isComplimentary &&
                          ((getRemainingControlNumbers("orchestra").length !== 0 && selectedSeats[0]?.section.includes("orchestra")) ||
                            (getRemainingControlNumbers("balcony").length !== 0 && selectedSeats[0]?.section.includes("balcony")))) ? (
                          <>
                            <TextInput
                              className="mt-5"
                              value={ticketInput.controlNumber}
                              onChange={(e) =>
                                setTicketInput((prev) => ({
                                  ...prev,
                                  controlNumber: e.target.value,
                                }))
                              }
                              label={
                                <p className="flex flex-col gap-2">
                                  Input Ticket Control Number to be assigned:
                                  <span className="font-semibold">"{selectedSeats.length}" control number required</span>
                                </p>
                              }
                            />

                            <Button onClick={validateTicketInput} className="self-end mt-4 !bg-green">
                              Confirm
                            </Button>
                          </>
                        ) : (
                          <div className="text-center mt-4 text-red">
                            All control numbers on this section have already been assigned. To reassign them, please remove existing assignments
                            first.
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center mt-4 text-red">
                        All control numbers have already been assigned. To reassign them, please remove existing assignments first.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-5 text-sm text-gray-700">
                    {rowToggle ? (
                      <p>
                        Ticket Control Numbers:{" "}
                        <span className="font-medium text-black">
                          {selectedSeats?.map((seat) => `${seat.seatNumber}: ${seat.ticketControlNumber}`).join(", ")}
                        </span>
                      </p>
                    ) : (
                      <p>
                        Ticket Control Number: <span className="font-medium text-black">{selectedSeats?.[0]?.ticketControlNumber}</span>
                      </p>
                    )}
                  </div>
                )}
              </Modal>
            )}
          </>
        )}

        <Button className="w-fit self-end" onClick={handleSubmit}>
          Add Schedule
        </Button>
      </div>
    </ContentWrapper>
  );
};

export default AddSchedule;
