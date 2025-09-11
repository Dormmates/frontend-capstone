import React from "react";
import type { ScheduleFormData, SeatingConfiguration } from "@/types/schedule.ts";
import Dropdown from "@/components/Dropdown";

const seatOptions = [
  { name: "Free Seating", value: "freeSeating" as SeatingConfiguration },
  { name: "Controlled Seating", value: "controlledSeating" as SeatingConfiguration },
];

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
}

const SeatingConfigurationSelector = ({ scheduleData, setScheduleData }: Props) => {
  return (
    <Dropdown
      includeHeader={true}
      className="z-50 max-w-[250px]"
      items={seatOptions}
      label="Seating Configuration"
      value={scheduleData.ticketType === "nonTicketed" ? "freeSeating" : scheduleData.seatingConfiguration}
      disabled={scheduleData.ticketType === "nonTicketed"}
      onChange={(value) => {
        if (value === "freeSeating") {
          setScheduleData((prev) => ({ ...prev, seatPricing: "fixed" }));
        }
        setScheduleData((prev) => ({ ...prev, seatingConfiguration: value as SeatingConfiguration }));
      }}
    />
  );
};

export default SeatingConfigurationSelector;
