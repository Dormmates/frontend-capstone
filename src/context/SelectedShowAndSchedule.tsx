import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { ShowData } from "../types/show";
import type { Schedule } from "../types/schedule";

type ContextData = {
  show: ShowData | null;
  schedule: Schedule | null;
  setCurrentSelectedShow: React.Dispatch<React.SetStateAction<ShowData | null>>;
  setCurrentSelectedShowSchedule: React.Dispatch<React.SetStateAction<Schedule | null>>;
};

const Context = createContext<ContextData | undefined>(undefined);

export const useSelectedShowAndScheduleContext = (): ContextData => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSelectedShowAndScheduleContext must be used within a ShowSchedulesProvider");
  }
  return context;
};

type Props = {
  children: ReactNode;
};

const SelectedShowAndSchedule = ({ children }: Props) => {
  const [currentSelectedShow, setCurrentSelectedShow] = useState<ShowData | null>(null);
  const [currentSelectedShowSchedule, setCurrentSelectedShowSchedule] = useState<Schedule | null>(null);

  return (
    <Context.Provider
      value={{ show: currentSelectedShow, schedule: currentSelectedShowSchedule, setCurrentSelectedShow, setCurrentSelectedShowSchedule }}
    >
      {children}
    </Context.Provider>
  );
};

export default SelectedShowAndSchedule;
