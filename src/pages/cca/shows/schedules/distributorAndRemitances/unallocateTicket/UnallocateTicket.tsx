import type { ShowData } from "../../../../../../types/show";
import type { Schedule } from "../../../../../../types/schedule";
import LongCard from "../../../../../../components/ui/LongCard";
import LongCardItem from "../../../../../../components/ui/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "../../../../../../utils/date";
import ControlNumberInputTutorial from "../../../../../../components/ui/ControlNumberInputTutorial";
import TextInput from "../../../../../../components/ui/TextInput";
import { useState } from "react";
import Button from "../../../../../../components/ui/Button";
import ToastNotification from "../../../../../../utils/toastNotification";
import { parseControlNumbers, validateControlInput } from "../../../../../../utils/controlNumber";
import Modal from "../../../../../../components/ui/Modal";

type Props = {
  distributorName: string;
  onSubmit: (controlNumbers: number[]) => void;
  controlNumbersAllocated: number[];
  show: ShowData;
  schedule: Schedule;
  close: () => void;
  disabled: boolean;
};

const UnallocateTicket = ({ distributorName, close, onSubmit, show, controlNumbersAllocated, schedule, disabled }: Props) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [controlNumbers, setControlNumbers] = useState<number[] | []>([]);
  const [openSummary, setOpenSummary] = useState(false);

  const handleSubmit = () => {
    if (!validateControlInput(input)) {
      setError("Invalid Control Number Input");
      ToastNotification.error("Invalid Control Number Input");
      return;
    }

    try {
      const controlNumbers = parseControlNumbers(input);
      const allExist = controlNumbers.every((num) => controlNumbersAllocated.includes(num));

      if (!allExist) {
        setError("One or more control numbers are not in the allocated list.");
        ToastNotification.error("One or more control numbers are not in the allocated list.");
        return;
      }

      setError("");
      setControlNumbers(controlNumbers);
      setOpenSummary(true);
    } catch (err) {
      if (err instanceof Error) {
        ToastNotification.error(err.message);
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="mt-5">
        Distributor: <span>{distributorName}</span>
      </h1>

      <LongCard className="w-full" label="Show Details">
        <LongCardItem label="Show Title" value={show.title} />
        <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
        <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
      </LongCard>

      <div className="border border-lightGrey rounded-md ">
        <h1 className="p-5 text-xl">Unallocate Ticket</h1>
        <ControlNumberInputTutorial />
        <div className="p-5">
          <p className="text-sm font-bold mb-5 max-w-[450px]">
            Control Numbers available for unallocation: <span className="font-normal">{controlNumbersAllocated.join(", ")}</span>
          </p>

          <TextInput
            disabled={disabled}
            isError={!!error}
            errorMessage={error}
            label={
              <p>
                Enter Ticket Control Number to be <span className="font-bold">Unallocated</span>
              </p>
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button className="!bg-green" disabled={input.length == 0 || !input || disabled} onClick={handleSubmit}>
          Unallocate Tickets
        </Button>
        <Button disabled={disabled} onClick={close} className="!bg-red">
          Cancel
        </Button>
      </div>

      {openSummary && (
        <Modal className="w-full max-w-[800px]" isOpen={openSummary} onClose={() => setOpenSummary(false)} title="Ticket Unallocation Summary">
          <LongCard className="my-10 w-full" label="Ticket">
            <LongCardItem label="Distributor Name" value={distributorName} />
            <LongCardItem label="Total Tickets " value={controlNumbers.length} />
            <LongCardItem label="Ticket Control Numbers" value={input} />
          </LongCard>
          <div className="flex justify-end gap-3">
            <Button className="!bg-green" disabled={input.length == 0 || !input || disabled} onClick={() => onSubmit(controlNumbers)}>
              Confirm
            </Button>
            <Button disabled={disabled} onClick={() => setOpenSummary(false)} className="!bg-red">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UnallocateTicket;
