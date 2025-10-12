import { useAddNewFixedTicketPricing, useAddNewSectionedTicketPricing, useGetTicketPrices } from "@/_lib/@react-client-query/ticketpricing";
import DialogPopup from "@/components/DialogPopup";
import FixedPrice from "@/components/FixedPrice";
import InputField from "@/components/InputField";
import SectionedPrice from "@/components/SectionedPrice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, CirclePlusIcon, TriangleAlertIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const TicketPrices = () => {
  const { data: ticketPrices, isLoading, isError } = useGetTicketPrices();
  const [isNewPricing, setIsNewPricing] = useState(false);

  const sectionedPrices = useMemo(() => {
    if (!ticketPrices) return [];

    return ticketPrices.filter((t) => t.type == "sectioned");
  }, [ticketPrices]);

  const fixedPrices = useMemo(() => {
    if (!ticketPrices) return [];

    return ticketPrices.filter((t) => t.type == "fixed");
  }, [ticketPrices]);

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  if (!ticketPrices || isError) {
    return <h1>Failed to load ticket pricings...</h1>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex justify-between">
          <p>Ticket Prices</p>
          <DialogPopup
            className="max-w-2xl w-[95%] md:w-full"
            isOpen={isNewPricing}
            setIsOpen={setIsNewPricing}
            title="Create a New Pricing"
            triggerElement={
              <Button>
                <CirclePlusIcon />
                New Pricing
              </Button>
            }
            description="Choose a pricing type below. Fixed pricing applies a single price for all seats, while Sectioned pricing allows you to set different prices per seating section."
          >
            <div className="flex items-center gap-2 mb-3 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <TriangleAlertIcon className="w-4 h-4" />
              <p className="font-bold">Note: </p>
              <p>You cannot edit the the pricing once created</p>
            </div>
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
        </CardTitle>
        <CardDescription>
          Manage your ticket pricing templates here. You can create fixed pricing for shows with a single price, or sectioned pricing for shows with
          multiple seat categories like Orchestra or Balcony. Once created, these pricing templates can be reused when creating new shows.
        </CardDescription>
        <CardContent className="p-0">
          {ticketPrices.length == 0 ? (
            <div className="flex items-center justify-center">No Ticket Prices Yet</div>
          ) : (
            <>
              <Tabs defaultValue="fixed">
                <TabsList>
                  <TabsTrigger value="fixed">Fixed Prices</TabsTrigger>
                  <TabsTrigger value="sectioned">Sectioned Prices</TabsTrigger>
                </TabsList>
                <TabsContent value="fixed">
                  {fixedPrices.length == 0 ? (
                    <div className="border h-28 my-5 rounded-md shadow-sm flex justify-center items-center font-bold">
                      <p className="flex items-center gap-2">
                        <AlertCircleIcon /> No Fixed Prices Yet
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 my-5">
                      {fixedPrices.map((t, index) => (
                        <FixedPrice key={index} data={t} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sectioned">
                  {sectionedPrices.length == 0 ? (
                    <div className="border h-28 my-5 rounded-md shadow-sm flex justify-center items-center font-bold">
                      <p className="flex items-center gap-2">
                        <AlertCircleIcon /> No Sectioned Prices Yet
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 my-5">
                      {sectionedPrices.map((t, index) => (
                        <SectionedPrice key={index} data={t} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
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
      newErrors.pricingName = "Pricing name should be at least 5 characters long";
      isValid = false;
    }

    if (Number(data.price) <= 0) {
      newErrors.price = "Ticket Price should be greater than 0";
      isValid = false;
    }

    if (Number(data.fee) < 0) {
      newErrors.fee = "Commission Fee should be a non-negative value";
      isValid = false;
    }

    if (Number(data.fee) >= Number(data.price)) {
      newErrors.fee = "Commission fee should be less than Ticket Price";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = () => {
    if (!validate()) return;

    toast.promise(newFixed.mutateAsync({ priceName: data.pricingName, fixedPrice: data.price, commissionFee: data.fee, type: "fixed" }), {
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
        <InputField
          disabled={newFixed.isPending}
          value={data.pricingName}
          error={errors.pricingName}
          label="Pricing Name"
          name="pricingName"
          onChange={handleInputChange}
        />
        <InputField
          disabled={newFixed.isPending}
          value={data.price}
          error={errors.price}
          type="number"
          label="Ticket Price"
          name="price"
          onChange={handleInputChange}
        />
        <InputField
          disabled={newFixed.isPending}
          value={data.fee}
          error={errors.fee}
          type="number"
          label="Commission Fee"
          name="fee"
          onChange={handleInputChange}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button disabled={newFixed.isPending} onClick={submit}>
          Add Pricing
        </Button>
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
        commissionFee: sectionedPrice.commissionFee,
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
          disabled={newSectioned.isPending}
          label="Pricing Name"
          value={sectionedPrice.pricingName}
          error={errors.pricingName}
          onChange={(e) => setSectionedPrice((prev) => ({ ...prev, pricingName: e.target.value }))}
        />
        <div className="w-full flex flex-col gap-5">
          <div className="flex gap-5 w-full">
            <InputField
              disabled={newSectioned.isPending}
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
              disabled={newSectioned.isPending}
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
              disabled={newSectioned.isPending}
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
              disabled={newSectioned.isPending}
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
              disabled={newSectioned.isPending}
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
              disabled={newSectioned.isPending}
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
          disabled={newSectioned.isPending}
          label="Commission Fee"
          value={sectionedPrice.commissionFee}
          error={errors.commissionFee}
          type="number"
          onChange={(e) => setSectionedPrice((prev) => ({ ...prev, commissionFee: Number(e.target.value) }))}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button disabled={newSectioned.isPending} onClick={submit}>
          Add New Sectioned Pricing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketPrices;
