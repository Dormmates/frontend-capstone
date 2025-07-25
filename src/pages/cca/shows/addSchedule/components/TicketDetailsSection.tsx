import TextInput from "../../../../../components/ui/TextInput";
import ControlNumberInputTutorial from "../../../../../components/ui/ControlNumberInputTutorial";
import type { ErrorKeys, ScheduleFormData } from "../../../../../types/schedule";

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
          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Total Number of <span className="font-bold">Orchestra Tickets</span>
              </p>
            }
            className="w-full min-w-[300px]"
            name="totalOrchestra"
            type="number"
            value={scheduleData.totalOrchestra + ""}
            isError={!!errors?.totalOrchestra}
            errorMessage={errors?.totalOrchestra}
          />

          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Total Number of <span className="font-bold">Balcony Tickets</span>
              </p>
            }
            className="w-full min-w-[300px]"
            name="totalBalcony"
            type="number"
            value={scheduleData.totalBalcony + ""}
            isError={!!errors?.totalBalcony}
            errorMessage={errors?.totalBalcony}
          />

          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Total Number of <span className="font-bold">Complimentary Tickets</span>
              </p>
            }
            className="w-full min-w-[300px]"
            name="totalComplimentary"
            type="number"
            value={scheduleData.totalComplimentary + ""}
            isError={!!errors?.totalComplimentary}
            errorMessage={errors?.totalComplimentary}
          />
        </div>
        <h2>Ticket Control Numbers</h2>
        <div className="flex gap-5 w-full">
          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Control Number of <span className="font-bold">Orchestra Tickets</span>
              </p>
            }
            placeholder="eg. 1-250"
            className="w-full min-w-[300px]"
            name="orchestraControlNumber"
            value={scheduleData.orchestraControlNumber}
            isError={!!errors?.orchestraControlNumber}
            errorMessage={errors?.orchestraControlNumber}
          />

          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Control Number of <span className="font-bold">Balcony Tickets</span>
              </p>
            }
            placeholder="eg. 251-500"
            className="w-full min-w-[300px]"
            name="balconyControlNumber"
            value={scheduleData.balconyControlNumber}
            isError={!!errors?.balconyControlNumber}
            errorMessage={errors?.balconyControlNumber}
          />

          <TextInput
            onChange={handleInputChange}
            label={
              <p>
                Control Number of <span className="font-bold">Complimentary Tickets</span>
              </p>
            }
            placeholder="eg. 501-750"
            className="w-full min-w-[300px]"
            name="complimentaryControlNumber"
            value={scheduleData.complimentaryControlNumber}
            isError={!!errors?.complimentaryControlNumber}
            errorMessage={errors?.complimentaryControlNumber}
          />
        </div>
      </div>
    </>
  );
};

export default TicketDetailsSection;
