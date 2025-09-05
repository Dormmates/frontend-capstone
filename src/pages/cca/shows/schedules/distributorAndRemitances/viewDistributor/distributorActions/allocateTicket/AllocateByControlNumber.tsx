import ControlNumberInputTutorial from "@/components/ControlNumberInputTutorial";
import type { Ticket } from "@/types/ticket.ts";
import InputField from "@/components/InputField";

type Props = {
  controlNumber: string;
  setControlNumbers: React.Dispatch<React.SetStateAction<string>>;
  unAllocatedTickets: { orchestra: Ticket[]; balcony: Ticket[] };
  error?: string;
};

const AllocateByControlNumber = ({ controlNumber, setControlNumbers, unAllocatedTickets, error }: Props) => {
  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          Reamining Tickets for Allocation:{" "}
          <span className="font-normal">{unAllocatedTickets.orchestra.length + unAllocatedTickets.balcony.length} tickets remaining</span>
        </p>

        {unAllocatedTickets.orchestra.length !== 0 && (
          <p className="font-bold max-w-[1200px]">
            Unallocated Control Numbers for <span className="text-green">Orchestra</span> :{" "}
            <span className="font-normal text-sm ">{unAllocatedTickets.orchestra.map((ticket) => ticket.controlNumber).join(", ")}</span>
          </p>
        )}

        {unAllocatedTickets.balcony.length !== 0 && (
          <p className="font-bold  max-w-[1200px]">
            Unallocated Control Numbers for <span className="text-orange-600">Balcony</span> :{" "}
            <span className="font-normal text-sm">{unAllocatedTickets.balcony.map((ticket) => ticket.controlNumber).join(", ")}</span>
          </p>
        )}
      </div>
      <ControlNumberInputTutorial className="max-w-[600px]" />
      <InputField
        disabled={unAllocatedTickets.balcony.length === 0 && unAllocatedTickets.orchestra.length === 0}
        className="max-w-[600px]"
        error={error}
        onChange={(e) => setControlNumbers(e.target.value)}
        value={controlNumber}
        label={"Enter Ticket Control Numbers to be Allocated"}
      />
    </div>
  );
};

export default AllocateByControlNumber;
