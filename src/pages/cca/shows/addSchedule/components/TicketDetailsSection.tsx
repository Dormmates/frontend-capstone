import type { ErrorKeys, ScheduleFormData } from "@/types/schedule.ts";
import InputField from "@/components/InputField";

interface Props {
  scheduleData: ScheduleFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Partial<Record<ErrorKeys, string>>;
}

const TicketDetailsSection = ({ scheduleData, handleInputChange, errors }: Props) => {
  return (
    <>
      <hr className="text-lightGrey" />
      <div className="flex flex-col gap-5">
        <h1 className="text-xl mb-5">Ticket Details</h1>

        <div className="flex flex-col md:flex-row gap-5 ">
          <InputField
            maxLength={3}
            onChange={handleInputChange}
            label=" Total Number of Tickets"
            className="w-full min-w-[300px]"
            name="totalTickets"
            value={scheduleData.totalTickets + ""}
            error={errors?.totalTickets}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={scheduleData.seatingConfiguration === "controlledSeating"}
          />

          <InputField
            maxLength={3}
            onChange={handleInputChange}
            label="Total Number of Complimentary Tickets (Optional)"
            className="w-full min-w-[300px]"
            name="totalComplimentary"
            value={scheduleData.totalComplimentary + ""}
            error={errors?.totalComplimentary}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5 w-full">
          <InputField
            onChange={handleInputChange}
            label="Control Number of Tickets"
            className="w-full min-w-[300px]"
            name="ticketsControlNumber"
            value={!scheduleData.totalTickets ? "" : scheduleData.ticketsControlNumber}
            error={errors?.ticketsControlNumber}
            disabled
          />

          <InputField
            onChange={handleInputChange}
            label="Control Number of Complimentary Tickets"
            className="w-full min-w-[300px]"
            name="complimentaryControlNumber"
            value={!scheduleData.totalComplimentary ? "" : scheduleData.complimentaryControlNumber}
            error={errors?.complimentaryControlNumber}
            disabled
          />
        </div>
      </div>
    </>
  );
};

export default TicketDetailsSection;
