import { createContext, useContext, useState, type ReactNode } from "react";
import type { Schedule } from "../types/schedule";

type ShowScheduleContextType = {
  schedules: Schedule[] | null;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[] | null>>;
};

const ShowScheduleContext = createContext<ShowScheduleContextType | undefined>(undefined);

export const useShowScheduleContext = (): ShowScheduleContextType => {
  const context = useContext(ShowScheduleContext);
  if (!context) {
    throw new Error("useShowScheduleContext must be used within a ShowSchedulesProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

const ShowSchedulesProvider = ({ children }: Props) => {
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);

  return <ShowScheduleContext.Provider value={{ schedules, setSchedules }}>{children}</ShowScheduleContext.Provider>;
};

export default ShowSchedulesProvider;
