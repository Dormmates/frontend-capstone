import { useParams } from "react-router-dom";
import { useGetShow } from "../../../../_lib/@react-client-query/show";
import { useState } from "react";
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
import { parseControlNumbers } from "../../../../utils/controlNumber";
import TicketDetailsSection from "./components/TicketDetailsSection";

import { seatMap } from "../../../../../seatdata";
import { flattenSeatMap, formatSectionName } from "../../../../utils/seatmap";
import Modal from "../../../../components/ui/Modal";
import SeatMapSchedule from "./components/SeatMapSchedule";
import ToastNotification from "../../../../utils/toastNotification";
import { useAddSchedule } from "../../../../_lib/@react-client-query/schedule";

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
  const addSchedule = useAddSchedule();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetShow(id as string);
  const [seatData, setSeatData] = useState(() => flattenSeatMap(seatMap));
  const [scheduleData, setScheduleData] = useState<ScheduleFormData>({
    dates: [{ date: new Date(), time: "" }],
    ticketType: "ticketed",
    seatingConfiguration: "freeSeating",
    seatPricing: "fixed",
    commisionFee: undefined,
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
  const [seatToggle, setSeatToggle] = useState(false);
  const [controlNumberInput, setControlNumberInput] = useState("");

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
        const invalidFields = sectionPrices.filter(([_, val]) => !val || isNaN(Number(val)) || Number(val) <= 0);

        if (invalidFields.length > 0) {
          for (const [key] of invalidFields) {
            newErrors[key as ErrorKeys] = `Section "${formatLabel(key)}" must have a valid price`;
          }
          isValid = false;
        }
      }

      if (!scheduleData.commisionFee || Number(scheduleData.commisionFee) < 0) {
        newErrors.commisionFee = "Commission fee must be a non-negative number";
        isValid = false;
      }

      const sectionConfigs: {
        label: string;
        total: number;
        control: string | undefined;
        totalField: ErrorKeys;
        controlField: ErrorKeys;
      }[] = [
        {
          label: "Orchestra",
          total: Number(scheduleData.totalOrchestra),
          control: scheduleData.orchestraControlNumber,
          totalField: "totalOrchestra",
          controlField: "orchestraControlNumber",
        },
        {
          label: "Balcony",
          total: Number(scheduleData.totalBalcony),
          control: scheduleData.balconyControlNumber,
          totalField: "totalBalcony",
          controlField: "balconyControlNumber",
        },
        {
          label: "Complimentary",
          total: Number(scheduleData.totalComplimentary),
          control: scheduleData.complimentaryControlNumber,
          totalField: "totalComplimentary",
          controlField: "complimentaryControlNumber",
        },
      ];

      const used = new Set<number>();

      for (const section of sectionConfigs) {
        const { total, control, label, totalField, controlField } = section;

        if (!total || total <= 0) {
          newErrors[totalField] = `Please input a valid number of ${label.toLowerCase()} tickets`;
          isValid = false;
        }

        if (!control) {
          newErrors[controlField] = `Please enter control numbers for ${label.toLowerCase()} tickets`;
          isValid = false;
          continue;
        }

        try {
          const parsed = parseControlNumbers(control);

          if (parsed.length !== total) {
            newErrors[controlField] = `${label} control numbers do not match total (${parsed.length} vs ${total})`;
            isValid = false;
          }

          for (const num of parsed) {
            if (used.has(num)) {
              newErrors[controlField] = `${label} has duplicate or overlapping control number: ${num}`;
              isValid = false;
              break;
            }
            used.add(num);
          }
        } catch (err) {
          newErrors[controlField] = `${label} control number error: ${(err as Error).message}`;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addSchedule.mutate(
      { ...scheduleData, showId: data.showId },
      {
        onSuccess: () => {
          ToastNotification.success("Added");
        },
        onError: (error) => {
          ToastNotification.error(error.message);
        },
      }
    );
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

        {scheduleData.ticketType == "ticketed" && (
          <TicketDetailsSection scheduleData={scheduleData} errors={errors} handleInputChange={handleInputChange} />
        )}

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
              name="commisionFee"
              value={scheduleData.commisionFee + ""}
              isError={!!errors.commisionFee}
              errorMessage={errors.commisionFee}
            />
          </div>
        )}

        <div>
          <SeatingConfigurationSelector scheduleData={scheduleData} setScheduleData={setScheduleData} />
        </div>

        {scheduleData.seatingConfiguration == "controlledSeating" && scheduleData.ticketType == "ticketed" && (
          <>
            <SeatMapSchedule
              seatMap={seatData}
              seatClick={(clickedSeat: FlattenedSeat) => {
                setSelectedSeats([clickedSeat]);
                setSeatToggle(true);
              }}
              rowClick={(clickedSeats: FlattenedSeat[]) => {
                setSelectedSeats(clickedSeats);
                setRowToggle(true);
              }}
            />

            {seatToggle && (
              <Modal title="Assign Ticket Control Number" onClose={() => setSeatToggle(false)} isOpen={seatToggle}>
                <div className="mt-5 bg-zinc-100 border border-darkGrey p-2">
                  <p>Section: {formatSectionName(selectedSeats?.[0]?.section || "")}</p>
                  <p>Seat Number: {selectedSeats?.[0]?.seatNumber}</p>
                  <p>PHP {selectedSeats?.[0]?.ticketPrice?.toFixed(2) || "0.00"}</p>
                </div>
              </Modal>
            )}

            {rowToggle && (
              <Modal title="Assign Ticket Control Number" onClose={() => setRowToggle(false)} isOpen={rowToggle}>
                <div className="mt-5 bg-zinc-100 border border-darkGrey p-2">
                  <p>Section: {formatSectionName(selectedSeats?.[0]?.section || "")}</p>
                  <p>{getRowLabel(selectedSeats)}</p>
                  <p>PHP {selectedSeats?.[0]?.ticketPrice?.toFixed(2) || "0.00"}</p>
                </div>
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
