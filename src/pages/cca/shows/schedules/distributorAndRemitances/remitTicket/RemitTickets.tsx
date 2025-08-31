import React, { useEffect, useMemo, useState } from "react";
import type { AllocatedTicketToDistributor } from "../../../../../../types/ticket";
import Button from "../../../../../../components/ui/Button";
import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "../../../../../../types/schedule";
import { compressControlNumbers, parseControlNumbers, validateControlInput } from "../../../../../../utils/controlNumber";
import TextInput from "../../../../../../components/ui/TextInput";
import ToastNotification from "../../../../../../utils/toastNotification";
import { useRemitTicketSale } from "../../../../../../_lib/@react-client-query/schedule";
import { useAuthContext } from "../../../../../../context/AuthContext";
import Modal from "../../../../../../components/ui/Modal";
import RemittanceSummary from "./RemittanceSummary";
import { useQueryClient } from "@tanstack/react-query";

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

    const distributorTicketNumbers = distributorData.map((t) => t.controlNumber);

    for (const num of soldList) {
      if (!distributorTicketNumbers.includes(num)) {
        newErrors.sold = `Control number ${num} is not assigned to this distributor`;
        isValid = false;
        break;
      }
    }

    for (const num of lostList) {
      if (!distributorTicketNumbers.includes(num)) {
        newErrors.lost = `Control number ${num} is not assigned to this distributor`;
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

    remit.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", schedule.scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "allocated", schedule.scheduleId, distributorId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "remittanceHistory", schedule.scheduleId, distributorId], exact: true });
        setShowSummary(false);
        ToastNotification.success("Remitted");
        closeRemit();
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  return (
    <div className="mt-5 flex flex-col">
      <div className="w-full bg-gray border border-lightGrey rounded-sm p-2">
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
            <div>
              <div className="flex items-center gap-2">
                <input
                  disabled={remit.isPending}
                  className="cursor-pointer"
                  id="system"
                  type="radio"
                  name="controlFrom"
                  value="system"
                  checked={controlFrom === "system"}
                  onChange={() => setControlFrom("system")}
                />
                <label className="cursor-pointer" htmlFor="system">
                  Use Distributor’s Breakdown (No Changes)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  disabled={remit.isPending}
                  className="cursor-pointer"
                  id="me"
                  type="radio"
                  name="controlFrom"
                  value="system"
                  checked={controlFrom === "me"}
                  onChange={() => setControlFrom("me")}
                />
                <label className="cursor-pointer" htmlFor="me">
                  I want to correct the ticket status
                </label>
              </div>
            </div>

            <div className="bg-gray border border-lightGrey p-3 rounded-md mt-3 flex flex-col gap-2">
              <TextInput
                disabled={controlFrom === "system" || remit.isPending}
                label={
                  controlFrom === "system" ? (
                    <p>Marked as Sold (by Distributor)</p>
                  ) : (
                    <p>
                      Enter Ticket Control Numbers which are <span className="font-bold">Sold</span>
                    </p>
                  )
                }
                isError={!!error.sold}
                errorMessage={error.sold}
                value={form.sold}
                onChange={handleInput}
                name="sold"
              />
            </div>

            <div className="mt-5 flex gap-3 flex-col">
              <TextInput
                disabled={remit.isPending}
                isError={!!error.lost}
                errorMessage={error.lost}
                name="lost"
                value={form.lost}
                onChange={handleInput}
                label="Enter any ticket control number lost by Distributor (Optional)"
              />

              <div className="flex flex-col items-center gap-3 md:flex-row">
                <TextInput
                  disabled={remit.isPending}
                  isError={!!error.discounted}
                  errorMessage={error.discounted}
                  name="discounted"
                  value={form.discounted}
                  onChange={handleInput}
                  label="Ticket control number discounted  (Optional)"
                />
                <TextInput
                  disabled={remit.isPending}
                  type="number"
                  placeholder="%"
                  name="discountPercentage"
                  label="Discount Percentage"
                  value={form.discountPercentage as number}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <Button disabled={remit.isPending} onClick={validate} className="!bg-green self-end mt-5">
            Remit Tickets
          </Button>
        </>
      )}

      {showSummary && (
        <Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="Remittance Summary">
          <RemittanceSummary
            cancelSubmit={() => setShowSummary(false)}
            schedule={schedule}
            disabled={remit.isPending}
            onSubmit={(remarks) => handleSubmit(remarks)}
            soldTickets={distributorData.filter((ticket) => parsed.soldList.includes(ticket.controlNumber))}
            lostTickets={distributorData.filter((ticket) => parsed.lostList.includes(ticket.controlNumber))}
            discountedTickets={distributorData.filter((ticket) => parsed.discountedList.includes(ticket.controlNumber))}
            discountPercentage={form.discountPercentage}
            commissionFee={schedule.commissionFee}
          />
        </Modal>
      )}
    </div>
  );
};

export default RemitTickets;
