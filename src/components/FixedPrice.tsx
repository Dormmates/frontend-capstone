import type { FixedPricing } from "@/types/ticketpricing";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EditIcon, Trash2Icon } from "lucide-react";

const FixedPrice = ({ data }: { data: FixedPricing }) => {
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
        <p className="text-muted-foreground">Commission Fee: {data.commisionFee}</p>
      </CardContent>
      <CardFooter className="p-2 flex justify-end gap-2">
        <Button variant="outline">
          <EditIcon />
        </Button>
        <Button variant="outline">
          <Trash2Icon className="text-red" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FixedPrice;
