import React from "react";
import type { ErrorKeys, ScheduleFormData, SeatPricing } from "../../../../../types/schedule";
import Dropdown from "@/components/Dropdown";
import InputField from "@/components/InputField";
import { Label } from "@/components/ui/label";

const pricingOptions = [
  { name: "Fixed", value: "fixed" },
  { name: "Sectioned Pricing", value: "sectionedPricing" },
];

interface Props {
  scheduleData: ScheduleFormData;
  ticketPrice: string;
  sectionedPrice: {
    orchestraLeft: string;
    orchestraMiddle: string;
    orchestraRight: string;
    balconyLeft: string;
    balconyMiddle: string;
    balconyRight: string;
  };
  handleSeatPricingType: (value: SeatPricing) => void;
  setTicketPrice: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Partial<Record<ErrorKeys, string>>;
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PricingSection = ({ scheduleData, ticketPrice, sectionedPrice, handleSeatPricingType, setTicketPrice, errors, handlePriceChange }: Props) => {
  return (
    <div>
      <Dropdown
        includeHeader={true}
        items={pricingOptions}
        label="Seat Pricing Type"
        disabled={scheduleData.seatingConfiguration === "freeSeating"}
        value={scheduleData.seatingConfiguration === "freeSeating" ? "fixed" : scheduleData.seatPricing}
        className="mb-5 max-w-[250px]"
        onChange={(value) => handleSeatPricingType(value as SeatPricing)}
      />
      <Label>Seating Price</Label>

      {scheduleData.seatPricing === "fixed" || scheduleData.seatingConfiguration === "freeSeating" ? (
        <div className="border border-lightGrey rounded-md max-w-[250px] p-3 mt-3">
          <InputField
            placeholder="PHP"
            onChange={setTicketPrice}
            label="Ticket Price"
            className="w-full "
            type="number"
            error={errors?.ticketPrice}
            value={ticketPrice}
            min={0}
          />
        </div>
      ) : (
        <div className="border border-lightGrey rounded-md w-full p-5 mt-3">
          <div className="w-full flex flex-col gap-5">
            <div className="flex gap-5 w-full">
              <InputField
                onChange={handlePriceChange}
                label="Orchestra Left"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="orchestraLeft"
                type="number"
                error={errors?.orchestraLeft}
                value={sectionedPrice.orchestraLeft}
              />
              <InputField
                onChange={handlePriceChange}
                label="Orchestra Middle"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="orchestraMiddle"
                type="number"
                error={errors?.orchestraMiddle}
                value={sectionedPrice.orchestraMiddle}
              />
              <InputField
                onChange={handlePriceChange}
                label="Orchestra Right"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="orchestraRight"
                type="number"
                error={errors?.orchestraRight}
                value={sectionedPrice.orchestraRight}
              />
            </div>
            <div className="w-full flex  gap-5">
              <InputField
                onChange={handlePriceChange}
                label="Balcony Left"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="balconyLeft"
                type="number"
                error={errors?.balconyLeft}
                value={sectionedPrice.balconyLeft}
              />
              <InputField
                onChange={handlePriceChange}
                label="Balcony Middle"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="balconyMiddle"
                type="number"
                error={errors?.balconyMiddle}
                value={sectionedPrice.balconyMiddle}
              />
              <InputField
                onChange={handlePriceChange}
                label="Balcony Right"
                placeholder="PHP"
                className="w-full min-w-[300px]"
                name="balconyRight"
                type="number"
                error={errors?.balconyRight}
                value={sectionedPrice.balconyRight}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
