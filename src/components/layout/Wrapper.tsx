import React from "react";
import merge from "../../utils/merge";

export const PageWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={merge("max-w-[1500px] mx-auto", className)}>{children}</div>;
};

export const ContentWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={merge("py-2 lg:px-8 lg:py-5", className)}>{children}</div>;
};
