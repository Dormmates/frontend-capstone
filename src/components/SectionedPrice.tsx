import type { SectionedPricing, TicketPricing } from "@/types/ticketpricing";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteSectionedPricing } from "@/_lib/@react-client-query/ticketpricing";
import AlertModal from "./AlertModal";
import { toast } from "sonner";

import EditPriceName from "@/pages/cca/systemSettings/EditPriceName";
import { useState } from "react";

const SectionedPrice = ({ data, hideAction = false }: { data: SectionedPricing; hideAction?: boolean }) => {
  const queryClient = useQueryClient();
  const deletePrice = useDeleteSectionedPricing();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="rounded-sm w-full max-w-sm">
      <CardHeader className="p-2">
        <CardTitle className="flex justify-between">
          <p>{data.priceName}</p>
          <Badge className="bg-accent text-accent-foreground">{data.type.toUpperCase()}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2 pt-3">
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-bold">Orchestra (Left, Middle, Right)</p>
            <div className="flex gap-2">
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.orchestraLeft}</span>,
              </p>
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.orchestraMiddle}</span>,
              </p>
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.orchestraRight}</span> pesos
              </p>
            </div>
          </div>

          <div>
            <p className="font-bold">Balcony (Left, Middle, Right)</p>
            <div className="flex gap-2">
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.balconyLeft}</span>,
              </p>
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.balconyMiddle}</span>,
              </p>
              <p className="flex items-end gap-1">
                <span className="text-2xl">{data.sectionPrices.balconyRight}</span> pesos
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground">Commission Fee: {data.commissionFee}</p>
      </CardContent>

      <CardFooter className="p-2 flex justify-end gap-2">
        {!hideAction && (
          <div className="flex gap-2">
            <EditPriceName isOpen={isOpen} setIsOpen={setIsOpen} priceId={data.id} priceName={data.priceName} />
            <AlertModal
              title={`Delete "${data.priceName}" pricing`}
              description="Are you sure you want to delete this? The operation won't continue if this pricing is used by a schedule/s already."
              onConfirm={() =>
                toast.promise(deletePrice.mutateAsync(data.id), {
                  position: "top-center",
                  loading: `Deleting ${data.priceName}...`,
                  success: () => {
                    queryClient.setQueryData<TicketPricing[]>(["pricings"], (oldData) => (oldData ? oldData.filter((p) => p.id !== data.id) : []));
                    return `Deleted ${data.priceName}`;
                  },
                  error: (err) => err.message || "Failed to delete pricing",
                })
              }
              confirmation="Delete"
              trigger={
                <Button size="icon" variant="outline">
                  <Trash2Icon className="text-red" />
                </Button>
              }
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SectionedPrice;
