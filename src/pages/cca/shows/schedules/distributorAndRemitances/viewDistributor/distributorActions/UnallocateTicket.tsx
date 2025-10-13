import type { ShowData } from "@/types/show.ts";
import type { Schedule } from "@/types/schedule.ts";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import { useState } from "react";
import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Modal from "@/components/Modal";
import ControlNumberGrid from "@/components/ControlNumberGrid";

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
  const [selectedControlNumbers, setSelectedControlNumbers] = useState<number[]>([]);
  const [openSummary, setOpenSummary] = useState(false);

  const handleSubmit = () => {
    setOpenSummary(true);
  };

  return (
    <div className="flex flex-col gap-5 ">
      <LongCard className="w-full" label="Show Details">
        <LongCardItem label="Show Title" value={show.title} />
        <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
        <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
      </LongCard>

      <Card className="border border-lightGrey rounded-md ">
        {controlNumbersAllocated.length != 0 ? (
          <>
            <div className="p-5">
              <p className=" text-sm mb-4">Click Control Numbers to be Unallocated</p>
              <ControlNumberGrid
                selectedControlNumbers={selectedControlNumbers}
                setSelectedControlNumbers={setSelectedControlNumbers}
                tickets={controlNumbersAllocated}
              />
            </div>
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
          <Button disabled={selectedControlNumbers.length == 0 || disabled || controlNumbersAllocated.length === 0} onClick={handleSubmit}>
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
            <LongCardItem label="Total Tickets " value={selectedControlNumbers.length} />
            <LongCardItem label="Ticket Control Numbers" value={compressControlNumbers(selectedControlNumbers)} />
          </LongCard>
          <div className="flex justify-end gap-3 mt-5">
            <Button disabled={disabled} onClick={() => setOpenSummary(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={selectedControlNumbers.length == 0 || disabled} onClick={() => onSubmit(selectedControlNumbers)}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UnallocateTicket;
