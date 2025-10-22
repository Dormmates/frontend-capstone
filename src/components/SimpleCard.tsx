import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import merge from "@/utils/merge";
import type { ReactNode } from "react";

export interface SimpleCardProps {
  label: string;
  value: string | number;
  className?: string;
  icon?: ReactNode;
}

const SimpleCard = ({ label, value, className, icon }: SimpleCardProps) => {
  return (
    <Card className={merge("p-0 flex flex-col border-l-2 ", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-darkGrey flex gap-2 text-nowrap">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold text-nowrap">{value}</p>
      </CardContent>
    </Card>
  );
};

export default SimpleCard;
