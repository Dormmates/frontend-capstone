import { useAddNewFixedTicketPricing, useAddNewSectionedTicketPricing, useGetTicketPrices } from "@/_lib/@react-client-query/ticketpricing";
import DialogPopup from "@/components/DialogPopup";
import FixedPrice from "@/components/FixedPrice";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

const TicketPrices = () => {
  const { data: ticketPrices, isLoading, isError } = useGetTicketPrices();
  const [isNewPricing, setIsNewPricing] = useState(false);

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  if (!ticketPrices || isError) {
    return <h1>Failed to load ticket pricings...</h1>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ticket Prices</CardTitle>
        <CardDescription>
          Manage your ticket pricing templates here. You can create fixed pricing for shows with a single price, or sectioned pricing for shows with
          multiple seat categories like Orchestra or Balcony. Once created, these pricing templates can be reused when creating new shows.
        </CardDescription>
        <CardContent className="p-0">
          {ticketPrices.length == 0 ? (
            <div>No Ticket Prices Yet</div>
          ) : (
            <div className="flex flex-wrap gap-3 my-5">
              {ticketPrices.map((t, index) => {
                if (t.type == "fixed") {
                  return <FixedPrice key={index} data={t} />;
                }

                if (t.type == "sectioned") {
                  return <div>Sectioned</div>;
                }
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-0">
          <DialogPopup
            className="max-w-2xl w-[95%] md:w-full"
            isOpen={isNewPricing}
            setIsOpen={setIsNewPricing}
            title="Create a New Pricing"
            triggerElement={<Button>Create New Pricing</Button>}
            description="Choose a pricing type below. Fixed pricing applies a single price for all seats, while Sectioned pricing allows you to set different prices per seating section."
          >
            <Tabs>
              <TabsList>
                <TabsTrigger value="fixed">New Fixed Pricing</TabsTrigger>
                <TabsTrigger value="sectioned">New Sectioned Pricing</TabsTrigger>
              </TabsList>
              <TabsContent value="fixed">
                <NewFixedPricing closeModal={() => setIsNewPricing(false)} />
              </TabsContent>
              <TabsContent value="sectioned">
                <NewSectionedPricing closeModal={() => setIsNewPricing(false)} />
              </TabsContent>
            </Tabs>
          </DialogPopup>
        </CardFooter>
      </CardHeader>
    </Card>
  );
};

const NewFixedPricing = ({ closeModal }: { closeModal: () => void }) => {
  const [data, setData] = useState({ price: 0, fee: 0, pricingName: "" });
  const [errors, setErrors] = useState<{ price?: string; fee?: string; pricingName?: string }>({});
  const queryClient = useQueryClient();
  const newFixed = useAddNewFixedTicketPricing();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!data.pricingName || data.pricingName.length < 5) {
      newErrors.pricingName = "Pricing name should be greater than 5 characters";
      isValid = false;
    }

    if (data.price <= 0) {
      newErrors.price = "Ticket Price should be greater than 0 or non-negative value";
      isValid = false;
    }

    if (data.fee < 0) {
      newErrors.fee = "Commission Fee should be a non-negative value";
      isValid = false;
    }

    if (data.fee !== 0 && data.fee < data.price) {
      newErrors.fee = "Commission fee should not be greater than Ticket Price";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = () => {
    if (!validate()) return;

    toast.promise(newFixed.mutateAsync({ priceName: data.pricingName, fixedPrice: data.price, commisionFee: data.fee, type: "fixed" }), {
      position: "top-center",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["pricings"] });
        closeModal();
        return "New Fixed Pricing Added";
      },
      loading: "Adding Price...",
      error: (err) => err.message || "Failed to add new Price",
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>New Fixed Pricing</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <InputField value={data.pricingName} error={errors.pricingName} label="Pricing Name" name="pricingName" onChange={handleInputChange} />
        <InputField value={data.price} error={errors.price} type="number" label="Ticket Price" name="price" onChange={handleInputChange} />
        <InputField value={data.fee} error={errors.fee} type="number" label="Commission Fee" name="fee" onChange={handleInputChange} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={submit}>Add Pricing</Button>
      </CardFooter>
    </Card>
  );
};

const NewSectionedPricing = ({ closeModal }: { closeModal: () => void }) => {
  const queryClient = useQueryClient();
  const newSectioned = useAddNewSectionedTicketPricing();

  const [sectionedPrice, setSectionedPrice] = useState({
    orchestraLeft: 0,
    orchestraMiddle: 0,
    orchestraRight: 0,
    balconyLeft: 0,
    balconyMiddle: 0,
    balconyRight: 0,
    pricingName: "",
    commissionFee: 0,
  });

  const [errors, setErrors] = useState<{
    orchestraLeft?: string;
    orchestraMiddle?: string;
    orchestraRight?: string;
    balconyLeft?: string;
    balconyMiddle?: string;
    balconyRight?: string;
    pricingName?: string;
    commissionFee?: string;
  }>({});

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSectionedPrice((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!sectionedPrice.pricingName || sectionedPrice.pricingName.length < 5) {
      newErrors.pricingName = "Pricing name should be at least 5 characters";
      isValid = false;
    }

    if (sectionedPrice.commissionFee < 0) {
      newErrors.commissionFee = "Commission fee should be a non-negative value";
      isValid = false;
    }

    const sections = ["orchestraLeft", "orchestraMiddle", "orchestraRight", "balconyLeft", "balconyMiddle", "balconyRight"] as const;
    sections.forEach((section) => {
      if (sectionedPrice[section] <= 0) {
        newErrors[section] = "Price must be greater than 0";
        isValid = false;
      }
      if (sectionedPrice.commissionFee > sectionedPrice[section]) {
        newErrors[section] = "Commission fee cannot be greater than section price";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const submit = () => {
    if (!validate()) return;

    toast.promise(
      newSectioned.mutateAsync({
        commisionFee: sectionedPrice.commissionFee,
        priceName: sectionedPrice.pricingName,
        type: "sectioned",
        sectionPrices: {
          orchestraLeft: sectionedPrice.orchestraLeft,
          orchestraMiddle: sectionedPrice.orchestraMiddle,
          orchestraRight: sectionedPrice.orchestraRight,
          balconyLeft: sectionedPrice.balconyLeft,
          balconyMiddle: sectionedPrice.balconyMiddle,
          balconyRight: sectionedPrice.balconyRight,
        },
      }),
      {
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["pricings"] });
          closeModal();
          return "Added New Sectioned Price";
        },
        loading: `Adding ${sectionedPrice.pricingName} pricing...`,
        error: (err) => err.message || "Failed to add new Price",
        position: "top-center",
      }
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>New Sectioned Pricing</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <InputField
          label="Pricing Name"
          value={sectionedPrice.pricingName}
          error={errors.pricingName}
          onChange={(e) => setSectionedPrice((prev) => ({ ...prev, pricingName: e.target.value }))}
        />
        <div className="w-full flex flex-col gap-5">
          <div className="flex gap-5 w-full">
            <InputField
              onChange={handlePriceChange}
              label="Orchestra Left"
              placeholder="PHP"
              className="w-full "
              name="orchestraLeft"
              type="number"
              error={errors?.orchestraLeft}
              value={sectionedPrice.orchestraLeft}
            />
            <InputField
              onChange={handlePriceChange}
              label="Orchestra Middle"
              placeholder="PHP"
              className="w-full "
              name="orchestraMiddle"
              type="number"
              error={errors?.orchestraMiddle}
              value={sectionedPrice.orchestraMiddle}
            />
            <InputField
              onChange={handlePriceChange}
              label="Orchestra Right"
              placeholder="PHP"
              className="w-full"
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
              className="w-full "
              name="balconyLeft"
              type="number"
              error={errors?.balconyLeft}
              value={sectionedPrice.balconyLeft}
            />
            <InputField
              onChange={handlePriceChange}
              label="Balcony Middle"
              placeholder="PHP"
              className="w-full "
              name="balconyMiddle"
              type="number"
              error={errors?.balconyMiddle}
              value={sectionedPrice.balconyMiddle}
            />
            <InputField
              onChange={handlePriceChange}
              label="Balcony Right"
              placeholder="PHP"
              className="w-full"
              name="balconyRight"
              type="number"
              error={errors?.balconyRight}
              value={sectionedPrice.balconyRight}
            />
          </div>
        </div>
        <InputField
          label="Commission Fee"
          value={sectionedPrice.commissionFee}
          error={errors.commissionFee}
          type="number"
          onChange={(e) => setSectionedPrice((prev) => ({ ...prev, commissionFee: Number(e.target.value) }))}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={submit}>Add New Sectioned Pricing</Button>
      </CardFooter>
    </Card>
  );
};

export default TicketPrices;
