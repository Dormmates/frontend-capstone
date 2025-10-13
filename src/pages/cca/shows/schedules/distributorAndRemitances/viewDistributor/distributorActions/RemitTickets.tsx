import { useMemo, useState } from "react";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import { compressControlNumbers, parseControlNumbers } from "@/utils/controlNumber.ts";
import { useRemitTicketSale } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import RemittanceSummary from "./RemittanceSummary";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import ControlNumberGrid from "@/components/ControlNumberGrid";

type Props = {
  distributorData: AllocatedTicketToDistributor[];
  closeRemit: () => void;
};

type FormProps = {
  sold: string;
  lost: string;
  discounted: string;
  discountPercentage: number | undefined;
};

type ParsedProps = { soldList: number[]; lostList: number[]; discountedList: number[] };

const RemitTickets = ({ distributorData, closeRemit }: Props) => {
  const queryClient = useQueryClient();
  const remit = useRemitTicketSale();
  const { user } = useAuthContext();
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { distributorId } = useParams();

  const distributorTickets = useMemo(() => {
    if (!distributorData) return { soldTickets: [], unsoldTickets: [] };
    const soldTickets = distributorData.filter((t) => t.status === "sold");
    const unsoldTickets = distributorData.filter((t) => t.status === "allocated");
    return { soldTickets, unsoldTickets };
  }, [distributorData]);

  const systemSold = useMemo(() => compressControlNumbers(distributorTickets.soldTickets.map((t) => t.controlNumber)), [distributorTickets]);
  const systemUnSold = useMemo(() => compressControlNumbers(distributorTickets.unsoldTickets.map((t) => t.controlNumber)), [distributorTickets]);
  const avaialbleToBeRemitted = useMemo(() => [...parseControlNumbers(systemSold), ...parseControlNumbers(systemUnSold)], [systemSold, systemUnSold]);

  const [form] = useState<FormProps>({
    sold: systemSold,
    lost: "",
    discounted: "",
    discountPercentage: undefined,
  });

  const [parsed] = useState<ParsedProps>({ soldList: [], lostList: [], discountedList: [] });
  const [error, setErrors] = useState<Partial<Record<keyof FormProps, string>>>({});

  const [showSummary, setShowSummary] = useState(false);
  const [selectedControlNumbers, setSelectedControlNumbers] = useState<number[]>(distributorTickets.soldTickets.map((t) => t.controlNumber));
  const [disabledCorrection, setDisabledCorrection] = useState(true);

  const validate = () => {
    const newErrors: typeof error = {};
    let isValid = true;

    // let soldList: number[] = [];
    // let lostList: number[] = [];
    // let discountedList: number[] = [];

    // try {
    //   soldList = parseControlNumbers(form.sold);
    // } catch (err: any) {
    //   newErrors.sold = err.message;
    //   isValid = false;
    // }

    // try {
    //   lostList = parseControlNumbers(form.lost || "");
    // } catch (err: any) {
    //   newErrors.lost = err.message;
    //   isValid = false;
    // }

    // try {
    //   discountedList = parseControlNumbers(form.discounted || "");
    // } catch (err: any) {
    //   newErrors.discounted = err.message;
    //   isValid = false;
    // }

    if (selectedControlNumbers.length == 0) {
      toast.error(`Must atleast have one sold`, { position: "top-center" });
      isValid = false;
    }

    // for (const num of soldList) {
    //   if (!avaialbleToBeRemitted.includes(num)) {
    //     newErrors.sold = `Control number ${num} is not available to be remitted`;
    //     isValid = false;
    //     break;
    //   }
    // }

    // for (const num of lostList) {
    //   if (!avaialbleToBeRemitted.includes(num)) {
    //     newErrors.lost = `Control number ${num} is not available to be remitted`;
    //     isValid = false;
    //     break;
    //   }
    // }

    // // Lost cannot overlap with sold or unsold
    // const overlapLostSold = lostList.filter((num) => soldList.includes(num));

    // if (overlapLostSold.length > 0) {
    //   newErrors.lost = `Control number(s) ${overlapLostSold.join(", ")} cannot be in both lost and sold`;
    //   isValid = false;
    // }

    // // Discounted must be in sold
    // for (const num of discountedList) {
    //   if (!soldList.includes(num)) {
    //     newErrors.discounted = `Discounted ticket ${num} must also be in sold tickets`;
    //     isValid = false;
    //     break;
    //   }
    // }

    setErrors(newErrors);

    if (isValid) {
      // setParsed({ soldList, lostList, discountedList });
      setShowSummary(true);
    }
  };

  const handleSubmit = (remarks: string | null) => {
    const payload: any = {
      sold: selectedControlNumbers,
      lost: parsed.lostList,
      scheduleId: schedule.scheduleId,
      distributorId,
      actionBy: user?.userId,
    };

    if (parsed.discountedList.length > 0 && form.discountPercentage) {
      payload.discounted = parsed.discountedList;
      payload.discountPercentage = form.discountPercentage;
    }

    if (remarks) {
      payload.remarks = remarks;
    }

    toast.promise(remit.mutateAsync(payload), {
      position: "top-center",
      loading: "Processing remittance...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", schedule.scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "allocated", schedule.scheduleId, distributorId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "remittanceHistory", schedule.scheduleId, distributorId], exact: true });
        setShowSummary(false);
        closeRemit();
        return "Tickets remitted";
      },
      error: (err: any) => err.message || "Failed to remit tickets",
    });
  };

  return (
    <div className="mt-5 flex flex-col">
      <div className="w-full bg-muted border border-lightGrey rounded-sm p-2">
        <p>Distributor: {distributorData[0].distributor}</p>
      </div>

      {avaialbleToBeRemitted.length === 0 ? (
        <div className="mt-5">
          <p className="font-medium text-xl">There are no Tickets Available to be Remitted</p>
          <p className="mt-4">Possible reasons:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-4">
            <li>All tickets have already been remitted</li>
            <li>No more unsold tickets by the distributor</li>
            <li>No more tickets were allocated to the distributor for this schedule</li>
          </ul>
        </div>
      ) : (
        <>
          <p className="font-medium text-xl mt-5">Validate Ticket Control Numbers</p>
          <div className="flex items-center gap-2">
            <p className="text-sm">Ticket Control Numbers Allocated to Distributor: </p>
            <p className="text-sm font-medium">{compressControlNumbers(avaialbleToBeRemitted)}</p>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <div>
                <p className="font-bold">Note: </p>
                <p>
                  Some tickets have already been marked as <span className="font-medium">sold</span> by the distributor. You may review and make
                  corrections before submitting this remittance.
                </p>
              </div>
              <Button
                className="mb-2"
                size="sm"
                onClick={() => {
                  setSelectedControlNumbers(distributorTickets.soldTickets.map((t) => t.controlNumber));
                  setDisabledCorrection((prev) => !prev);
                }}
              >
                {disabledCorrection ? "Make Corrections" : "Disable Correction"}
              </Button>
            </div>

            <ControlNumberGrid
              disabled={disabledCorrection}
              selectedControlNumbers={selectedControlNumbers}
              setSelectedControlNumbers={setSelectedControlNumbers}
              tickets={avaialbleToBeRemitted}
            />
          </div>

          <Button disabled={remit.isPending} onClick={validate} className=" self-end mt-5">
            Remit Tickets
          </Button>
        </>
      )}

      {showSummary && (
        <Dialog open={showSummary} onOpenChange={() => setShowSummary(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remittance Summary</DialogTitle>
              <DialogDescription>Please review the summary before proceding</DialogDescription>
            </DialogHeader>
            <RemittanceSummary
              cancelSubmit={() => setShowSummary(false)}
              seatingType={schedule.seatingType}
              disabled={remit.isPending}
              onSubmit={(remarks) => handleSubmit(remarks)}
              soldTickets={distributorData.filter((ticket) => selectedControlNumbers.includes(ticket.controlNumber))}
              lostTickets={distributorData.filter((ticket) => parsed.lostList.includes(ticket.controlNumber))}
              discountedTickets={distributorData.filter((ticket) => parsed.discountedList.includes(ticket.controlNumber))}
              discountPercentage={form.discountPercentage}
              commissionFee={schedule.ticketPricing ? schedule.ticketPricing.commissionFee : 0}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RemitTickets;
