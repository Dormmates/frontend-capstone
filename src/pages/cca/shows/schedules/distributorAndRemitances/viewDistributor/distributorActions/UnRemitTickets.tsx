import React, { useMemo, useState } from "react";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import { compressControlNumbers, parseControlNumbers, validateControlInput } from "@/utils/controlNumber.ts";
import { useUnRemitTicketSales } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import ControlNumberInputTutorial from "@/components/ControlNumberInputTutorial";
import Modal from "@/components/Modal";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatCurrency } from "@/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { CircleQuestionMarkIcon } from "lucide-react";

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

  const ticketsAvailableToBeRemitted = useMemo(() => {
    if (!distributorData) return [];
    return distributorData.filter((data) => data.isRemitted).map((data) => data.controlNumber);
  }, [distributorData]);

  const [form, setForm] = useState("");
  const [error, setError] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(value);

    if (value.trim() && name !== "discountPercentage") {
      const isValid = validateControlInput(value);
      setError(isValid ? "" : "Invalid Control Number Input");
    } else {
      setError("");
    }
  };

  const validate = () => {
    let isValid = true;
    let error = "";

    if (!form.trim()) {
      isValid = false;
      error = "Empty value";
    }

    try {
      const parsed = parseControlNumbers(form);

      for (const num of parsed) {
        if (!ticketsAvailableToBeRemitted.includes(num)) {
          error = `Control number ${num} is not remitted by this distributor yet`;
          isValid = false;
          break;
        }
      }

      if (isValid) {
        const tickets = distributorData.filter((ticket) => parsed.includes(ticket.controlNumber));
        setUnremitTickets(tickets);
        setShowSummary(true);
      }
    } catch (err: any) {
      error = err.message;
    }

    setError(error);
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
        loading: "Unremitting tickets...",
        success: "Tickets unremitted ",
        error: (err: any) => err.message || "Failed to unremit tickets",
      }
    );
  };

  return (
    <div className="flex flex-col">
      <p>Distributor: {distributorData[0].distributor}</p>

      {ticketsAvailableToBeRemitted.length === 0 ? (
        <div className="mt-5">
          <p className="font-medium text-xl">There are no Tickets Available to be UnRemitted</p>
          <p className="mt-4">Possible reasons:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-4">
            <li>The distributor don't have Remittance History yet</li>
            <li>All tickets are unremitted already or unallocated</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p>Ticket Control Numbers that can be UnRemitted: </p>
            <p className="text-sm font-medium">{compressControlNumbers(ticketsAvailableToBeRemitted)}</p>
          </div>

          <div>
            <div className=" border border-lightGrey p-3 rounded-md mt-3 flex flex-col gap-2">
              <InputField
                disabled={unremit.isPending}
                label={
                  <div className="flex items-center gap-2">
                    <p>Enter Ticket Control Numbers to be Unremitted</p>
                    <HoverCard openDelay={0} closeDelay={200}>
                      <HoverCardTrigger>
                        <CircleQuestionMarkIcon className="w-4 text-muted-foreground " />
                      </HoverCardTrigger>
                      <HoverCardContent className="p-0">
                        <ControlNumberInputTutorial className="border bg-background" />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                }
                error={error}
                value={form}
                onChange={handleInput}
                name="sold"
              />
            </div>
          </div>

          <Button disabled={unremit.isPending} onClick={validate} className=" self-end mt-5">
            Unremit Tickets
          </Button>
        </>
      )}

      {showSummary && (
        <Modal
          onClose={() => setShowSummary(false)}
          isOpen={showSummary}
          title="Unremit Ticket Sales Summary"
          description="Review the details before confirming unremit"
        >
          <div className="flex flex-col -mt-2 w-full max-w-[650px]">
            <LongCard className="w-full mt-3" label="Ticket Summary">
              <LongCardItem label="Total Tickets to Unremit" value={`${unremitTickets.length} ticket(s)`} />
              <LongCardItem label="Control Numbers" value={form} />
            </LongCard>

            <div className="flex justify-between mt-5">
              <h2 className="font-medium mb-2">Amount to be Unremitted</h2>
              <p className="text-lg font-semibold">
                {formatCurrency(unremitTickets.reduce((total, t) => total + (t.ticketPrice - schedule.commissionFee || 0), 0))}
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
                Confirm Unremit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UnRemitTickets;
