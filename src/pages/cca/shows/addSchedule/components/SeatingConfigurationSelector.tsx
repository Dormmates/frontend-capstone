import React from "react";
import type { ScheduleFormData, SeatingConfiguration } from "../../../../../types/schedule";
import Dropdown from "@/components/Dropdown";

const seatOptions = [
  { name: "Free Seating", value: "freeSeating" },
  { name: "Controlled Seating", value: "controlledSeating" },
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
      onChange={(value) => setScheduleData((prev) => ({ ...prev, seatingConfiguration: value as SeatingConfiguration }))}
    />
  );
};

export default SeatingConfigurationSelector;
