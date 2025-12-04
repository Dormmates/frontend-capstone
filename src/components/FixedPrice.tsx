import type { FixedPricing } from "@/types/ticketpricing";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const FixedPrice = ({ data }: { data: FixedPricing; hideAction?: boolean }) => {
  return (
    <Card className="rounded-sm w-full max-w-sm">
      <CardHeader className="p-2">
        <CardTitle className="flex justify-between">
          <p>Fixed Price</p>
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
    </Card>
  );
};

export default FixedPrice;
