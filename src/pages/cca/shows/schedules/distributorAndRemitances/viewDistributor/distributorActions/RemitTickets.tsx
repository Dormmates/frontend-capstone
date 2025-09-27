import React, { useEffect, useMemo, useState } from "react";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import { compressControlNumbers, parseControlNumbers, validateControlInput } from "@/utils/controlNumber.ts";
import { useRemitTicketSale } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import RemittanceSummary from "./RemittanceSummary";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { CircleQuestionMarkIcon } from "lucide-react";

import ControlNumberInputTutorial from "@/components/ControlNumberInputTutorial";

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

  const [controlFrom, setControlFrom] = useState<"system" | "me">("system");
  const [showSummary, setShowSummary] = useState(false);

  const [inludes, setIncludes] = useState({ lost: false, discounted: false });

  const distributorTickets = useMemo(() => {
    if (!distributorData) return { soldTickets: [], unsoldTickets: [] };
    const soldTickets = distributorData.filter((t) => t.status === "sold");
    const unsoldTickets = distributorData.filter((t) => t.status === "allocated");
    return { soldTickets, unsoldTickets };
  }, [distributorData]);

  const systemSold = useMemo(() => compressControlNumbers(distributorTickets.soldTickets.map((t) => t.controlNumber)), [distributorTickets]);
  const systemUnSold = useMemo(() => compressControlNumbers(distributorTickets.unsoldTickets.map((t) => t.controlNumber)), [distributorTickets]);
  const avaialbleToBeRemitted = useMemo(() => [...parseControlNumbers(systemSold), ...parseControlNumbers(systemUnSold)], [systemSold, systemUnSold]);

  const [form, setForm] = useState<FormProps>({
    sold: systemSold,
    lost: "",
    discounted: "",
    discountPercentage: undefined,
  });
  const [parsed, setParsed] = useState<ParsedProps>({ soldList: [], lostList: [], discountedList: [] });

  const [error, setErrors] = useState<Partial<Record<keyof FormProps, string>>>({});

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "discountPercentage") {
      if (/^\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value === "" ? 0 : Number(value) }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (value.trim() && name !== "discountPercentage") {
      const isValid = validateControlInput(value);
      setErrors((prev) => ({ ...prev, [name]: isValid ? undefined : "Invalid Control Number Input" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  useEffect(() => {
    if (controlFrom === "system") {
      setForm({
        sold: systemSold,
        lost: "",
        discounted: "",
        discountPercentage: undefined,
      });
      setErrors({});
    }
  }, [controlFrom]);

  const validate = () => {
    const newErrors: typeof error = {};
    let isValid = true;

    let soldList: number[] = [];
    let lostList: number[] = [];
    let discountedList: number[] = [];

    try {
      soldList = parseControlNumbers(form.sold);
    } catch (err: any) {
      newErrors.sold = err.message;
      isValid = false;
    }

    try {
      lostList = parseControlNumbers(form.lost || "");
    } catch (err: any) {
      newErrors.lost = err.message;
      isValid = false;
    }

    try {
      discountedList = parseControlNumbers(form.discounted || "");
    } catch (err: any) {
      newErrors.discounted = err.message;
      isValid = false;
    }

    if (soldList.length == 0) {
      newErrors.sold = `Must atleast have one sold`;
      isValid = false;
    }

    for (const num of soldList) {
      if (!avaialbleToBeRemitted.includes(num)) {
        newErrors.sold = `Control number ${num} is not available to be remitted`;
        isValid = false;
        break;
      }
    }

    for (const num of lostList) {
      if (!avaialbleToBeRemitted.includes(num)) {
        newErrors.lost = `Control number ${num} is not available to be remitted`;
        isValid = false;
        break;
      }
    }

    // Lost cannot overlap with sold or unsold
    const overlapLostSold = lostList.filter((num) => soldList.includes(num));

    if (overlapLostSold.length > 0) {
      newErrors.lost = `Control number(s) ${overlapLostSold.join(", ")} cannot be in both lost and sold`;
      isValid = false;
    }

    // Discounted must be in sold
    for (const num of discountedList) {
      if (!soldList.includes(num)) {
        newErrors.discounted = `Discounted ticket ${num} must also be in sold tickets`;
        isValid = false;
        break;
      }
    }

    setErrors(newErrors);

    if (isValid) {
      setParsed({ soldList, lostList, discountedList });
      setShowSummary(true);
    }
  };

  const handleSubmit = (remarks: string | null) => {
    const payload: any = {
      sold: parsed.soldList,
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
            <p>Ticket Control Numbers that can be Remitted: </p>
            <p className="text-sm font-medium">{compressControlNumbers(avaialbleToBeRemitted)}</p>
          </div>
          <div className="mt-5">
            <RadioGroup value={controlFrom} onValueChange={(value) => setControlFrom(value as "me" | "system")}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">Use Distributor’s Breakdown (No Changes)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="me" id="me" />
                <Label htmlFor="me">I’ll Input My Own Breakdown</Label>
              </div>
            </RadioGroup>

            <div className=" border border-lightGrey p-3 rounded-md mt-3 flex flex-col gap-2">
              <InputField
                disabled={controlFrom === "system" || remit.isPending}
                label={
                  controlFrom === "system" ? (
                    "Marked as Sold (by Distributor)"
                  ) : (
                    <div className="flex items-center gap-2">
                      <p>Enter Ticket Control Numbers which are Sold</p>
                      <HoverCard openDelay={0} closeDelay={200}>
                        <HoverCardTrigger>
                          <CircleQuestionMarkIcon className="w-4 text-muted-foreground " />
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          <ControlNumberInputTutorial className="border bg-background" />
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  )
                }
                error={error.sold}
                value={form.sold}
                onChange={handleInput}
                name="sold"
              />
            </div>

            <div className="mt-3 flex gap-3 flex-col">
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={inludes.lost} onCheckedChange={(val) => setIncludes((prev) => ({ ...prev, lost: val === true }))} id="lost" />
                  <Label htmlFor="lost">Have Lost Tickets?</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={inludes.discounted}
                    onCheckedChange={(val) => setIncludes((prev) => ({ ...prev, discounted: val === true }))}
                    id="discounted"
                  />
                  <Label htmlFor="discounted">Have Discounted Tickets?</Label>
                </div>
              </div>

              {inludes.lost && (
                <InputField
                  disabled={remit.isPending}
                  error={error.lost}
                  name="lost"
                  value={form.lost}
                  onChange={handleInput}
                  label="Enter any ticket control number lost by Distributor (Optional)"
                />
              )}

              {inludes.discounted && (
                <div className="flex flex-col items-center gap-3 md:flex-row">
                  <InputField
                    disabled={remit.isPending}
                    error={error.discounted}
                    name="discounted"
                    value={form.discounted}
                    onChange={handleInput}
                    label="Ticket control number discounted  (Optional)"
                  />
                  <InputField
                    disabled={remit.isPending}
                    type="number"
                    placeholder="%"
                    error={error.discountPercentage}
                    name="discountPercentage"
                    label="Discount Percentage"
                    value={form.discountPercentage as number}
                    onChange={handleInput}
                  />
                </div>
              )}
            </div>
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
              <DialogTitle>Remittanec Summary</DialogTitle>
              <DialogDescription>Please review the summary before proceding</DialogDescription>
            </DialogHeader>
            <RemittanceSummary
              cancelSubmit={() => setShowSummary(false)}
              seatingType={schedule.seatingType}
              disabled={remit.isPending}
              onSubmit={(remarks) => handleSubmit(remarks)}
              soldTickets={distributorData.filter((ticket) => parsed.soldList.includes(ticket.controlNumber))}
              lostTickets={distributorData.filter((ticket) => parsed.lostList.includes(ticket.controlNumber))}
              discountedTickets={distributorData.filter((ticket) => parsed.discountedList.includes(ticket.controlNumber))}
              discountPercentage={form.discountPercentage}
              commissionFee={schedule.ticketPricing.commisionFee}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RemitTickets;
