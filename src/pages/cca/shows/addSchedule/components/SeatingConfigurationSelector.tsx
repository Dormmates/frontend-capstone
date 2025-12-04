import React from "react";
import type { ErrorKeys, ScheduleFormData, SeatingConfiguration } from "@/types/schedule.ts";
import Dropdown from "@/components/Dropdown";

const seatOptions = [
  { name: "Free Seating", value: "freeSeating" as SeatingConfiguration },
  { name: "Controlled Seating", value: "controlledSeating" as SeatingConfiguration },
];

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
  seatCount: number;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
}

const SeatingConfigurationSelector = ({ setErrors, scheduleData, setScheduleData, seatCount }: Props) => {
  return (
    <Dropdown
      includeHeader={true}
      className="z-50 max-w-[250px]"
      items={seatOptions}
      label="Seating Configuration"
      value={scheduleData.ticketType === "nonTicketed" ? "freeSeating" : scheduleData.seatingConfiguration}
      disabled={scheduleData.ticketType === "nonTicketed"}
      onChange={(value) => {
        const totalSeats = seatCount;

        if (value === "freeSeating") {
          setScheduleData((prev) => ({
            ...prev,
            seatingConfiguration: "freeSeating",
            seatPricing: "fixed",
            totalTickets: 0,
            totalComplimentary: 0,
            ticketsControlNumber: "",
            complimentaryControlNumber: "",
          }));
          return;
        }

        if (value === "controlledSeating") {
          const complimentary = 33;
          const totalComplimentary = Math.min(complimentary, totalSeats);
          const totalTickets = Math.max(totalSeats - totalComplimentary, 0);

          const ticketsControlNumber = totalTickets > 0 ? `1-${totalTickets}` : "";
          const complimentaryControlNumber = totalComplimentary > 0 ? `${totalTickets + 1}-${totalSeats}` : "";

          setScheduleData((prev) => ({
            ...prev,
            seatingConfiguration: "controlledSeating",
            totalComplimentary,
            totalTickets,
            ticketsControlNumber,
            complimentaryControlNumber,
          }));
          setErrors((prev) => ({ ...prev, totalTickets: "", totalComplimentary: "" }));
        }
      }}
    />
  );
};

export default SeatingConfigurationSelector;
