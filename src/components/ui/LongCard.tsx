import React from "react";

export interface LongCardProps {
  label: string;
  children: React.ReactNode;
  labelStyle?: string;
  className?: string;
}

const LongCard = ({ label, children, labelStyle = "", className = "" }: LongCardProps) => {
  return (
    <div className={`flex flex-col gap-5 p-5 border border-l-4 border-lightGrey border-l-black rounded-r-lg w-fit pr-10 ${className}`}>
      <span className={`text-lg ${labelStyle}`}>{label}</span>
      <div className="flex gap-10 items-start">{children}</div>
    </div>
  );
};

export default LongCard;
