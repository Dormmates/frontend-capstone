import { useMemo, useState } from "react";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { useUnRemitTicketSales } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatCurrency } from "@/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ControlNumberGrid from "@/components/ControlNumberGrid";

type Props = {
  distributorData: AllocatedTicketToDistributor[];
  closeModal: () => void;
};

const UnRemitTickets = ({ distributorData, closeModal }: Props) => {
  const queryClient = useQueryClient();
  const unremit = useUnRemitTicketSales();
  const { user } = useAuthContext();
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { distributorId } = useParams();

  const [remarks, setRemarks] = useState("");
  const [unremitTickets, setUnremitTickets] = useState<AllocatedTicketToDistributor[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedControlNumbers, setSelectedControlNumbers] = useState<number[]>([]);

  const ticketsAvailableToBeRemitted = useMemo(() => {
    if (!distributorData) return [];
    return distributorData.filter((data) => data.isPaid && data.status !== "lost").map((data) => data.controlNumber);
  }, [distributorData]);

  const validate = () => {
    if (selectedControlNumbers.length == 0) {
      toast.error("Please atleast choose one ticket", { position: "top-center" });
    } else {
      setUnremitTickets(distributorData.filter((ticket) => selectedControlNumbers.includes(ticket.controlNumber)));
      setShowSummary(true);
    }
  };

  const handleSubmit = () => {
    toast.promise(
      unremit
        .mutateAsync({
          remittedTickets: unremitTickets.map((t) => t.controlNumber),
          actionBy: user?.userId as string,
          scheduleId: schedule.scheduleId,
          distributorId: distributorId as string,
          remarks,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", schedule.scheduleId], exact: true });
          queryClient.invalidateQueries({ queryKey: ["schedule", "allocated", schedule.scheduleId, distributorId], exact: true });
          queryClient.invalidateQueries({ queryKey: ["schedule", "remittanceHistory", schedule.scheduleId, distributorId], exact: true });
          closeModal();
        }),
      {
        position: "top-center",
        loading: "Reverting Distributor Payment...",
        success: "Tickets reverted to unpaid ",
        error: (err: any) => err.message || "Failed to revert, please try again later",
      }
    );
  };

  return (
    <div className="flex flex-col">
      <p>Distributor: {distributorData[0].distributor}</p>

      {ticketsAvailableToBeRemitted.length === 0 ? (
        <div className="mt-5">
          <p className="font-medium text-xl">There are no Tickets Available to be Reverted</p>
          <p className="mt-4">Possible reasons:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-4">
            <li>The distributor don't have Payment History yet</li>
            <li>All tickets are already reverted or unallocated</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p>Ticket Control Numbers that can be Reverted: </p>
            <p className="text-sm font-medium">{compressControlNumbers(ticketsAvailableToBeRemitted)}</p>
          </div>

          <div className="border p-2 rounded-md mt-5">
            <p className=" text-sm mb-4">Click Control Numbers to be Reverted</p>
            <ControlNumberGrid
              selectedControlNumbers={selectedControlNumbers}
              setSelectedControlNumbers={setSelectedControlNumbers}
              tickets={ticketsAvailableToBeRemitted}
            />
          </div>

          <Button disabled={unremit.isPending} onClick={validate} className=" self-end mt-5">
            Revert Distributor Payment
          </Button>
        </>
      )}

      {showSummary && (
        <Modal
          onClose={() => setShowSummary(false)}
          isOpen={showSummary}
          title="Revert Payment Summary"
          description="Review the details before confirming the transaction"
        >
          <div className="flex flex-col -mt-2 w-full max-w-[650px]">
            <LongCard className="w-full mt-3" label="Ticket Summary">
              <LongCardItem label="Total Tickets" value={`${unremitTickets.length} ticket(s)`} />
              <LongCardItem label="Control Numbers" value={compressControlNumbers(selectedControlNumbers)} />
            </LongCard>

            <div className="flex justify-between mt-5">
              <h2 className="font-medium mb-2">Amount to be Reverted</h2>
              <p className="text-lg font-semibold">
                {formatCurrency(unremitTickets.reduce((total, t) => total + (t.ticketPrice - 0 - schedule.ticketPricing.commissionFee || 0), 0))}
              </p>
            </div>

            <div className="flex flex-col mt-4">
              <Label>Remarks (Optional)</Label>
              <Textarea disabled={unremit.isPending} className="mt-2" onChange={(e) => setRemarks(e.target.value)} value={remarks} />
            </div>

            <div className="flex self-end gap-3 mt-5">
              <Button onClick={() => setShowSummary(false)} disabled={unremit.isPending} variant="outline">
                Cancel
              </Button>
              <Button disabled={unremit.isPending} onClick={handleSubmit}>
                Confirm Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UnRemitTickets;
