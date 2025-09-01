import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import merge from "@/utils/merge";

export interface SimpleCardProps {
  label: string;
  value: string | number;
  className?: string;
}

const SimpleCard = ({ label, value, className = " border-l-green" }: SimpleCardProps) => {
  return (
    <Card className={merge("p-0 flex flex-col border-l-2 rounded-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-darkGrey">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold text-center">{value}</p>
      </CardContent>
    </Card>
  );
};

export default SimpleCard;
