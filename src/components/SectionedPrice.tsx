import type { SectionedPricing } from "@/types/ticketpricing";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const SectionedPrice = ({ data }: { data: SectionedPricing; hideAction?: boolean }) => {
  return (
    <Card className="rounded-sm w-full max-w-sm">
      <CardHeader className="p-2">
        <CardTitle className="flex justify-between">
          <p>Sectioned Price</p>
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
    </Card>
  );
};

export default SectionedPrice;
