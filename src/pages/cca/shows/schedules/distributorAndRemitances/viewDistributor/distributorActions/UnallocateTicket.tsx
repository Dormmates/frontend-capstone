import type { ShowData } from "@/types/show.ts";
import type { Schedule } from "@/types/schedule.ts";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import ControlNumberInputTutorial from "@/components/ControlNumberInputTutorial";
import { useState } from "react";
import { compressControlNumbers, parseControlNumbers, validateControlInput } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/Modal";
import { toast } from "sonner";

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
      toast.error("Invalid Control Number Input", { position: "top-center" });
      return;
    }

    try {
      const controlNumbers = parseControlNumbers(input);
      const allExist = controlNumbers.every((num) => controlNumbersAllocated.includes(num));

      if (!allExist) {
        setError("One or more control numbers are not in the allocated list.");
        toast.error("One or more control numbers are not in the allocated list.", { position: "top-center" });
        return;
      }

      setError("");
      setControlNumbers(controlNumbers);
      setOpenSummary(true);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, { position: "top-center" });
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <LongCard className="w-full" label="Show Details">
        <LongCardItem label="Show Title" value={show.title} />
        <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
        <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
      </LongCard>

      <Card className="border border-lightGrey rounded-md ">
        {controlNumbersAllocated.length != 0 ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Unallocate Ticket</CardTitle>
            </CardHeader>
            <ControlNumberInputTutorial />
            <CardContent>
              <p className="text-sm font-bold my-5 max-w-[450px]">
                Control Numbers available for unallocation: <span className="font-normal">{compressControlNumbers(controlNumbersAllocated)}</span>
              </p>
              <InputField
                error={error}
                label="Enter Ticket Control Number to be Unallocated"
                disabled={disabled}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </CardContent>
          </>
        ) : (
          <p className="text-center font-bold my-5">
            There are no tickets avaialble for unallocation,
            <br /> all tickets are marked as sold
          </p>
        )}
      </Card>

      {controlNumbersAllocated.length != 0 && (
        <div className="flex justify-end gap-3">
          <Button disabled={disabled} onClick={close} variant="outline">
            Cancel
          </Button>
          <Button disabled={input.length == 0 || !input || disabled || controlNumbersAllocated.length === 0} onClick={handleSubmit}>
            Unallocate Tickets
          </Button>
        </div>
      )}

      {openSummary && (
        <Modal
          isOpen={openSummary}
          onClose={() => setOpenSummary(false)}
          title="Ticket Unallocation Summary"
          description="Please review the summary before proceding"
          className="max-w-2xl"
        >
          <LongCard className="w-full" label="Ticket">
            <LongCardItem label="Distributor Name" value={distributorName} />
            <LongCardItem label="Total Tickets " value={controlNumbers.length} />
            <LongCardItem label="Ticket Control Numbers" value={compressControlNumbers(controlNumbers)} />
          </LongCard>
          <div className="flex justify-end gap-3 mt-5">
            <Button disabled={disabled} onClick={() => setOpenSummary(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={input.length == 0 || !input || disabled} onClick={() => onSubmit(controlNumbers)}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UnallocateTicket;
