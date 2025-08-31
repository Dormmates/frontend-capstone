import React from "react";

import type { ScheduleFormData, TicketType } from "../../../../../types/schedule";

const ticketTypes = [
  { label: "Ticketed", value: "ticketed" },
  { label: "Non-Ticketed", value: "nonTicketed" },
] as const satisfies ReadonlyArray<{ label: string; value: TicketType }>;

interface Props {
  scheduleData: ScheduleFormData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
}

const TicketTypeSelection = ({ scheduleData, setScheduleData }: Props) => {
  return (
    // <Dropdown<TicketType>
    //   className="z-[999999]"
    //   options={ticketTypes}
    //   label="Ticket Type"
    //   value={scheduleData.ticketType}
    //   onChange={(value) => setScheduleData((prev) => ({ ...prev, ticketType: value }))}
    // />
    <p>Ticket Type</p>
  );
};

export default TicketTypeSelection;
