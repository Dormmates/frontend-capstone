import React from "react";
import type { ScheduleFormData, SeatingConfiguration } from "../../../../../types/schedule";

const seatOptions = [
  { label: "Free Seating", value: "freeSeating" },
  { label: "Controlled Seating", value: "controlledSeating" },
] as const satisfies ReadonlyArray<{ label: string; value: SeatingConfiguration }>;

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
}

const SeatingConfigurationSelector = ({ scheduleData, setScheduleData }: Props) => {
  return (
    // <Dropdown<SeatingConfiguration>
    //   className="z-50"
    //   options={seatOptions}
    //   label="Seating Configuration"
    //   value={scheduleData.ticketType === "nonTicketed" ? "freeSeating" : scheduleData.seatingConfiguration}
    //   disabled={scheduleData.ticketType === "nonTicketed"}
    //   onChange={(value) => setScheduleData((prev) => ({ ...prev, seatingConfiguration: value }))}
    // />
    <p>Seating Configuration </p>
  );
};

export default SeatingConfigurationSelector;
