import type { FixedPricing, TicketPricing } from "@/types/ticketpricing";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteFixedPricing } from "@/_lib/@react-client-query/ticketpricing";
import AlertModal from "./AlertModal";
import { toast } from "sonner";
import { useState } from "react";
import EditPriceName from "@/pages/cca/systemSettings/EditPriceName";

const FixedPrice = ({ data, hideAction = false }: { data: FixedPricing; hideAction?: boolean }) => {
  const queryClient = useQueryClient();
  const deletePrice = useDeleteFixedPricing();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="rounded-sm w-full max-w-sm">
      <CardHeader className="p-2">
        <CardTitle className="flex justify-between">
          <p>{data.priceName}</p>
          <Badge className="bg-accent text-accent-foreground">{data.type.toUpperCase()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <p className="font-bold flex items-end gap-1">
          <span className="text-4xl">{data.fixedPrice}</span>
          pesos
        </p>
        <p className="text-muted-foreground">Commission Fee: {data.commissionFee}</p>
      </CardContent>
      <CardFooter className="p-2 flex justify-end gap-2 items-end">
        {/* <Button variant="outline">
          <EditIcon />
        </Button> */}
        {!hideAction && (
          <>
            <EditPriceName isOpen={isOpen} setIsOpen={setIsOpen} priceId={data.id} priceName={data.priceName} />
            <AlertModal
              description="Are you sure you want to delete this? The operation won't continue if this pricing is used by a schedule/s already."
              title={`Delete "${data.priceName}" price`}
              onConfirm={() => {
                toast.promise(deletePrice.mutateAsync(data.id), {
                  position: "top-center",
                  loading: `Deleting ${data.priceName}...`,
                  success: () => {
                    queryClient.setQueryData<TicketPricing[]>(["pricings"], (oldData) => {
                      if (!oldData) return [];
                      return oldData.filter((price) => price.id !== data.id);
                    });
                    return `Deleted ${data.priceName}`;
                  },
                  error: (err) => err.message || "Failed to delete price",
                });
              }}
              confirmation="Delete"
              trigger={
                <Button size="icon" variant="outline">
                  <Trash2Icon className="text-red" />
                </Button>
              }
            />
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default FixedPrice;
