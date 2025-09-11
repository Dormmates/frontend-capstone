import ControlNumberInputTutorial from "../../../../../components/ControlNumberInputTutorial";
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
        <ControlNumberInputTutorial className="-mt-5" />
        <div className="flex gap-5 ">
          <InputField
            onChange={handleInputChange}
            label=" Total Number of Orchestra Tickets"
            className="w-full min-w-[300px]"
            name="totalOrchestra"
            type="number"
            value={scheduleData.totalOrchestra + ""}
            error={errors?.totalOrchestra}
          />

          <InputField
            onChange={handleInputChange}
            label="Total Number of Balcony Tickets"
            className="w-full min-w-[300px]"
            name="totalBalcony"
            type="number"
            value={scheduleData.totalBalcony + ""}
            error={errors?.totalBalcony}
          />

          <InputField
            onChange={handleInputChange}
            label="Total Number of Complimentary Tickets"
            className="w-full min-w-[300px]"
            name="totalComplimentary"
            type="number"
            value={scheduleData.totalComplimentary + ""}
            error={errors?.totalComplimentary}
          />
        </div>
        <h2>Ticket Control Numbers</h2>
        <div className="flex gap-5 w-full">
          <InputField
            onChange={handleInputChange}
            label="Control Number of Orchestra Tickets"
            placeholder="eg. 1-250"
            className="w-full min-w-[300px]"
            name="orchestraControlNumber"
            value={!scheduleData.totalOrchestra ? "" : scheduleData.orchestraControlNumber}
            error={errors?.orchestraControlNumber}
            disabled={!scheduleData.totalOrchestra}
          />

          <InputField
            onChange={handleInputChange}
            label="Control Number of Balcony Tickets"
            placeholder="eg. 251-500"
            className="w-full min-w-[300px]"
            name="balconyControlNumber"
            value={!scheduleData.totalBalcony ? "" : scheduleData.balconyControlNumber}
            error={errors?.balconyControlNumber}
            disabled={!scheduleData.totalBalcony}
          />

          <InputField
            onChange={handleInputChange}
            label="Control Number of Complimentary Tickets"
            placeholder="eg. 501-750"
            className="w-full min-w-[300px]"
            name="complimentaryControlNumber"
            value={!scheduleData.totalComplimentary ? "" : scheduleData.complimentaryControlNumber}
            error={errors?.complimentaryControlNumber}
            disabled={!scheduleData.totalComplimentary}
          />
        </div>
      </div>
    </>
  );
};

export default TicketDetailsSection;
