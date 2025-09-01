import React from "react";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface LongCardProps {
  label: string;
  children: React.ReactNode;
  labelStyle?: string;
  className?: string;
}

const LongCard = ({ label, children, labelStyle, className }: LongCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <Label className={`${labelStyle}`}>{label}</Label>
        </CardTitle>
        <CardContent className="flex gap-10 items-start flex-wrap p-0 !mt-5">{children}</CardContent>
      </CardHeader>
    </Card>
  );
};

export default LongCard;
