import { useState } from "react";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { formatCurrency } from "@/utils";
import type { SeatSection } from "@/types/seat.ts";
import type { SeatingConfiguration } from "@/types/schedule.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type Props = {
  seatingType: SeatingConfiguration;
  soldTickets: { controlNumber: number; ticketPrice: number; seatSection: SeatSection | null }[];
  lostTickets: { controlNumber: number; ticketPrice: number; seatSection: SeatSection | null }[];
  discountedTickets: { controlNumber: number; ticketPrice: number; seatSection: SeatSection | null }[];
  discountPercentage?: number;
  commissionFee: number;
  onSubmit?: (remarks: string | null) => void;
  disabled?: boolean;
  remarksValue?: string;
  cancelSubmit?: () => void;
};

const RemittanceSummary = ({
  soldTickets,
  lostTickets,
  discountedTickets,
  discountPercentage,
  commissionFee,
  onSubmit,
  disabled,
  remarksValue,
  seatingType,
  cancelSubmit,
}: Props) => {
  const [remarks, setRemarks] = useState("");

  const allSoldOrLost = [...soldTickets, ...lostTickets];

  const totalSales = allSoldOrLost.reduce((acc, curr) => acc + Number(curr.ticketPrice), 0);
  const totalDiscount = discountedTickets.reduce((acc, curr) => acc + Number(curr.ticketPrice) * ((discountPercentage || 0) / 100), 0);

  const expectedRemit = allSoldOrLost.reduce((acc, curr) => {
    let priceAfterCommission = Number(curr.ticketPrice) - commissionFee;
    if (discountedTickets.some((t) => t.controlNumber === curr.controlNumber) && discountPercentage) {
      priceAfterCommission -= Number(curr.ticketPrice) * (discountPercentage / 100);
    }
    return acc + priceAfterCommission;
  }, 0);

  return (
    <div className="flex flex-col mt-5 w-full max-w-[650px]">
      <LongCard className="w-full" label="Ticket Summary">
        <LongCardItem label="Sold Tickets" value={`${soldTickets.length} ticket(s) `} />
        <LongCardItem label="Lost Tickets" value={`${lostTickets.length} ticket(s)`} />
        <LongCardItem label="Discounted Tickets" value={`${discountedTickets.length} ticket(s)`} />
      </LongCard>

      <div className="mt-4 p-3 bg-muted border border-lightGrey rounded-md">
        <h2 className="font-medium mb-2">Ticket Price/s</h2>
        {seatingType === "controlledSeating" ? (
          (() => {
            const tickets = [...soldTickets, ...lostTickets];
            const sectionMap: Record<string, { prices: Set<number>; count: number }> = {};

            tickets.forEach((t) => {
              const section = t.seatSection || "No Section";
              if (!sectionMap[section]) sectionMap[section] = { prices: new Set(), count: 0 };
              sectionMap[section].prices.add(t.ticketPrice);
              sectionMap[section].count += 1;
            });

            return Object.entries(sectionMap).map(([section, data]) => (
              <p key={section} className="ml-2">
                {section} ({data.count} ticket{data.count > 1 ? "s" : ""}): {Array.from(data.prices).map(formatCurrency).join(", ")}
              </p>
            ));
          })()
        ) : (
          <p>{formatCurrency(soldTickets[0]?.ticketPrice || 0)}</p>
        )}
      </div>

      <div className="mt-5">
        <h1 className="text-lg font-medium">Breakdown</h1>
        <div className="flex items-center justify-between">
          <p className="text-darkGrey">Total Ticket Sales: </p>
          <p>{formatCurrency(totalSales)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-darkGrey">Total Distributor Commission: </p>
          <p>{formatCurrency(allSoldOrLost.length * commissionFee)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-darkGrey">Total Discount: </p>
          <p>{formatCurrency(totalDiscount)}</p>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <p>Expected Amount to Remit: </p>
          <p className="text-lg font-medium">{formatCurrency(expectedRemit)}</p>
        </div>
      </div>

      <div className="flex flex-col mt-4 ">
        <Label>Remarks (Optional)</Label>
        <Textarea
          disabled={disabled || !onSubmit}
          className="mt-2"
          onChange={(e) => setRemarks(e.target.value)}
          value={!onSubmit && remarksValue ? remarksValue : remarks}
        />
      </div>

      {onSubmit && cancelSubmit && (
        <div className="flex self-end gap-3 mt-5">
          <Button disabled={disabled} onClick={() => onSubmit(remarks)} className="!bg-green">
            Confirm
          </Button>
          <Button onClick={cancelSubmit} disabled={disabled} className="!bg-red">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default RemittanceSummary;
