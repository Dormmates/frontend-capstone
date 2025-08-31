import React from "react";
import { Label } from "./ui/label";

export interface LongCardProps {
  label: string;
  children: React.ReactNode;
  labelStyle?: string;
  className?: string;
}

const LongCard = ({ label, children, labelStyle = "", className = "" }: LongCardProps) => {
  return (
    <div className={`flex flex-col gap-5 p-5 border border-l-4 border-lightGrey border-l-black rounded-r-lg w-fit pr-10 ${className}`}>
      <Label className={labelStyle}>{label}</Label>
      <div className="flex gap-10 items-start flex-wrap">{children}</div>
    </div>
  );
};

export default LongCard;
