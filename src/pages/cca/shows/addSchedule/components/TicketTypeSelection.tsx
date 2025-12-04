import React from "react";

import type { ErrorKeys, ScheduleFormData, TicketType } from "@/types/schedule.ts";
import Dropdown from "@/components/Dropdown";

const ticketTypes = [
  { name: "Ticketed", value: "ticketed" },
  { name: "Non-Ticketed", value: "nonTicketed" },
];

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
}

const TicketTypeSelection = ({ scheduleData, setScheduleData, setErrors }: Props) => {
  return (
    <Dropdown
      includeHeader={true}
      placeholder="Select Ticket Type"
      className=" max-w-[250px]"
      items={ticketTypes}
      label="Ticket Type"
      value={scheduleData.ticketType}
      onChange={(value) => {
        setScheduleData((prev) => ({
          ...prev,
          ticketType: value as TicketType,
          seatingConfiguration: value === "nonTicketed" ? "freeSeating" : prev.seatingConfiguration,
        }));
        setErrors({});
      }}
    />
  );
};

export default TicketTypeSelection;
