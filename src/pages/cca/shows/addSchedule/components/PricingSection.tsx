import React from "react";
import type { ErrorKeys, ScheduleFormData, SeatPricing } from "@/types/schedule.ts";
import Dropdown from "@/components/Dropdown";
import { Label } from "@/components/ui/label";
import type { FixedPricing, SectionedPricing } from "@/types/ticketpricing";
import InputField from "@/components/InputField";
import { formatSectionName } from "@/utils/seatmap";

const pricingOptions = [
  { name: "Fixed", value: "fixed" },
  { name: "Sectioned Pricing", value: "sectionedPricing" },
];

interface Props {
  scheduleData: ScheduleFormData;
  fixedPrice: FixedPricing;
  sectionedPrice: SectionedPricing;
  setFixedPrice: React.Dispatch<React.SetStateAction<FixedPricing>>;
  setSectionedPrice: React.Dispatch<React.SetStateAction<SectionedPricing>>;
  handleSeatPricingType: (value: SeatPricing) => void;
  errors: Partial<Record<ErrorKeys, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
}

const PricingSection = ({
  scheduleData,
  fixedPrice,
  sectionedPrice,
  setFixedPrice,
  setSectionedPrice,
  handleSeatPricingType,
  setErrors,
  errors,
}: Props) => {
  const handleFixedPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!/^[0-9]*$/.test(value)) return;

    const numValue = value === "" ? 0 : Number(value);

    const updated: FixedPricing = {
      ...fixedPrice,
      [name]: numValue,
    };

    setFixedPrice(updated);

    if (name === "fixedPrice") {
      if (numValue < 50) {
        setErrors((prev) => ({
          ...prev,
          ticketPrice: "Ticket price must be greater than 50",
        }));
      } else {
        setErrors((prev) => ({ ...prev, ticketPrice: undefined }));
      }
    }

    if (updated.commissionFee > updated.fixedPrice * 0.9) {
      setErrors((prev) => ({
        ...prev,
        fixedCommisionFee: "Commission Fee must not be greater than 10% of the price",
      }));
    } else {
      setErrors((prev) => ({ ...prev, fixedCommisionFee: undefined }));
    }
  };

  const handleSectionedPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!/^[0-9]*$/.test(value)) return;

    const numValue = value === "" ? 0 : Number(value);

    const updated: SectionedPricing = {
      ...sectionedPrice,
      sectionPrices: {
        ...sectionedPrice.sectionPrices,
        ...(name in sectionedPrice.sectionPrices ? { [name]: numValue } : {}),
      },
      commissionFee: name === "commissionFee" ? numValue : sectionedPrice.commissionFee,
    };

    setSectionedPrice(updated);

    Object.entries(updated.sectionPrices).forEach(([sectionName, price]) => {
      setErrors((prev) => ({
        ...prev,
        [(sectionName + "Price") as ErrorKeys]: price < 50 ? `${formatSectionName(sectionName)} price must be greater than 50` : undefined,
      }));
    });

    const minSectionPrice = Math.min(...Object.values(updated.sectionPrices));

    if (updated.commissionFee > minSectionPrice * 0.9) {
      setErrors((prev) => ({
        ...prev,
        sectionedCommisionFee: "Commission fee must not be greater than 10% all section prices",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        sectionedCommisionFee: undefined,
      }));
    }
  };

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
          handleSeatPricingType(value as SeatPricing);

          setFixedPrice({ type: "fixed", fixedPrice: 0, commissionFee: 0 });
          setSectionedPrice({
            type: "sectioned",
            sectionPrices: {
              orchestraLeft: 0,
              orchestraMiddle: 0,
              orchestraRight: 0,
              balconyLeft: 0,
              balconyMiddle: 0,
              balconyRight: 0,
            },
            commissionFee: 0,
          });

          setErrors((prev) => ({
            ...prev,
            ticketPrice: undefined,
            fixedCommisionFee: undefined,
            sectionedCommisionFee: undefined,
            orchestraLeftPrice: undefined,
            orchestraMiddlePrice: undefined,
            orchestraRightPrice: undefined,
            balconyLeftPrice: undefined,
            balconyMiddlePrice: undefined,
            balconyRightPrice: undefined,
          }));
        }}
      />

      <Label>Seating Price</Label>

      {scheduleData.seatPricing === "fixed" || scheduleData.seatingConfiguration === "freeSeating" ? (
        <div className={`border border-lightGrey rounded-md w-full p-3 mt-3 `}>
          <div className="flex flex-col md:flex-row gap-2 md:gap-5">
            <InputField
              maxLength={4}
              error={errors.ticketPrice}
              value={fixedPrice.fixedPrice}
              label="Ticket Price"
              name="fixedPrice"
              onChange={handleFixedPrice}
            />
            <InputField
              maxLength={4}
              error={errors.fixedCommisionFee}
              value={fixedPrice.commissionFee}
              label="Commission Fee"
              name="commissionFee"
              onChange={handleFixedPrice}
            />
          </div>
        </div>
      ) : (
        <div className={`border border-lightGrey rounded-md w-full p-3 mt-3 `}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row w-full gap-2">
              <InputField
                maxLength={4}
                error={errors.orchestraLeftPrice}
                value={sectionedPrice.sectionPrices.orchestraLeft}
                label="Orchestra Left"
                name="orchestraLeft"
                onChange={handleSectionedPrice}
              />
              <InputField
                maxLength={4}
                error={errors.orchestraMiddlePrice}
                value={sectionedPrice.sectionPrices.orchestraMiddle}
                label="Orchestra Middle"
                name="orchestraMiddle"
                onChange={handleSectionedPrice}
              />
              <InputField
                maxLength={4}
                error={errors.orchestraRightPrice}
                value={sectionedPrice.sectionPrices.orchestraRight}
                label="Orchestra Right"
                name="orchestraRight"
                onChange={handleSectionedPrice}
              />
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-2">
              <InputField
                maxLength={4}
                error={errors.balconyLeftPrice}
                value={sectionedPrice.sectionPrices.balconyLeft}
                label="Balcony Left"
                name="balconyLeft"
                onChange={handleSectionedPrice}
              />
              <InputField
                maxLength={4}
                error={errors.balconyMiddlePrice}
                value={sectionedPrice.sectionPrices.balconyMiddle}
                label="Balcony Middle"
                name="balconyMiddle"
                onChange={handleSectionedPrice}
              />
              <InputField
                maxLength={4}
                error={errors.balconyRightPrice}
                value={sectionedPrice.sectionPrices.balconyRight}
                label="Balcony Right"
                name="balconyRight"
                onChange={handleSectionedPrice}
              />
            </div>
            <InputField
              maxLength={4}
              error={errors.sectionedCommisionFee}
              value={sectionedPrice.commissionFee}
              label="Commission Fee"
              name="commissionFee"
              onChange={handleSectionedPrice}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
