import React from "react";

import type { ScheduleFormData, TicketType } from "../../../../../types/schedule";
import Dropdown from "@/components/Dropdown";

const ticketTypes = [
  { name: "Ticketed", value: "ticketed" },
  { name: "Non-Ticketed", value: "nonTicketed" },
];

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
}

const TicketTypeSelection = ({ scheduleData, setScheduleData }: Props) => {
  return (
    <Dropdown
      includeHeader={true}
      placeholder="Select Ticket Type"
      className="z-[999999] max-w-[250px]"
      items={ticketTypes}
      label="Ticket Types"
      value={scheduleData.ticketType}
      onChange={(value) => setScheduleData((prev) => ({ ...prev, ticketType: value as TicketType }))}
    />
  );
};

export default TicketTypeSelection;
