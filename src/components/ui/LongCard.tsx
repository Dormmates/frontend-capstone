import React from "react";

export interface LongCardProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const LongCard = ({ label, children }: LongCardProps) => {
  return (
    <div className="flex flex-col gap-5 p-5 border border-l-4 border-lightGrey border-l-black rounded-r-lg w-fit pr-10">
      <span className=" text-lg">{label}</span>
      <div className="flex gap-10 items-center">{children}</div>
    </div>
  );
};

export default LongCard;
