import React, { useMemo } from "react";
import type { ErrorKeys, ScheduleFormData, SeatPricing } from "@/types/schedule.ts";
import Dropdown from "@/components/Dropdown";
import { Label } from "@/components/ui/label";
import { useGetTicketPrices } from "@/_lib/@react-client-query/ticketpricing";
import { AlertCircleIcon } from "lucide-react";
import FixedPrice from "@/components/FixedPrice";
import SectionedPrice from "@/components/SectionedPrice";
import type { TicketPricing } from "@/types/ticketpricing";

const pricingOptions = [
  { name: "Fixed", value: "fixed" },
  { name: "Sectioned Pricing", value: "sectionedPricing" },
];

interface Props {
  scheduleData: ScheduleFormData;
  selectedPrice: TicketPricing | null;
  setSelectedPrice: React.Dispatch<React.SetStateAction<TicketPricing | null>>;
  handleSeatPricingType: (value: SeatPricing) => void;
  errors: Partial<Record<ErrorKeys, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
}

const PricingSection = ({ scheduleData, selectedPrice, setSelectedPrice, handleSeatPricingType, setErrors, errors }: Props) => {
  const { data: ticketPrices, isLoading, isError } = useGetTicketPrices();

  const sectionedPrices = useMemo(() => {
    if (!ticketPrices) return [];
    return ticketPrices.filter((t) => t.type === "sectioned");
  }, [ticketPrices]);

  const fixedPrices = useMemo(() => {
    if (!ticketPrices) return [];
    return ticketPrices.filter((t) => t.type === "fixed");
  }, [ticketPrices]);

  if (isLoading) {
    return <h1>Loading Ticket Prices...</h1>;
  }

  if (isError || !ticketPrices) {
    return <h1>Failed to load ticket prices</h1>;
  }

  return (
    <div>
      <Dropdown
        includeHeader={true}
        items={pricingOptions}
        label="Seat Pricing Type"
        disabled={scheduleData.seatingConfiguration === "freeSeating"}
        value={scheduleData.seatingConfiguration === "freeSeating" ? "fixed" : scheduleData.seatPricing}
        className="mb-5 max-w-[250px]"
        onChange={(value) => {
          setSelectedPrice(null);
          handleSeatPricingType(value as SeatPricing);
        }}
      />

      <Label>Seating Price</Label>

      {scheduleData.seatPricing === "fixed" || scheduleData.seatingConfiguration === "freeSeating" ? (
        <div className={`border border-lightGrey rounded-md w-full p-3 mt-3 ${errors?.ticketPrice && "border-red"}`}>
          {fixedPrices.length === 0 ? (
            <div className="border h-28 my-5 rounded-md shadow-sm flex justify-center items-center font-bold">
              <p className="flex items-center gap-2 text-red">
                <AlertCircleIcon /> No Fixed Prices Yet (Contact Admin to add one)
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 ">
              {fixedPrices.map((t) => (
                <div
                  key={t.id}
                  className={`cursor-pointer rounded-md p-1 ${
                    selectedPrice?.id === t.id ? "ring-2 ring-primary/50  shadow-lg shadow-primary/50" : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice(t);
                    setErrors((prev) => ({ ...prev, ticketPrice: "" }));
                  }}
                >
                  <FixedPrice hideAction={true} data={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`border border-lightGrey rounded-md w-full p-3 mt-3 ${errors?.ticketPrice && "border-red"}`}>
          {sectionedPrices.length === 0 ? (
            <div className="border border-lightGrey rounded-md w-full p-3 mt-3">
              <p className="flex items-center gap-2 text-red">
                <AlertCircleIcon /> No Sectioned Prices Yet (Contact Admin to add one)
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 ">
              {sectionedPrices.map((t) => (
                <div
                  key={t.id}
                  className={`cursor-pointer rounded-md p-1 ${
                    selectedPrice?.id === t.id ? "ring-2 ring-primary/50  shadow-lg shadow-primary/50" : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice(t);
                    setErrors((prev) => ({ ...prev, ticketPrice: "" }));
                  }}
                >
                  <SectionedPrice hideAction={true} data={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errors?.ticketPrice && <p className="text-red text-sm mt-2">{errors.ticketPrice}</p>}
    </div>
  );
};

export default PricingSection;
