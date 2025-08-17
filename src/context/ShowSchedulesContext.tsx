import { createContext, useContext, useState, type ReactNode } from "react";

type ShowScheduleData = {
  scheduleId: string;
  datetime: Date;
  isOpen: boolean;
};

type ShowScheduleContextType = {
  schedules: ShowScheduleData[] | null;
  setSchedules: React.Dispatch<React.SetStateAction<ShowScheduleData[] | null>>;
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
  const [schedules, setSchedules] = useState<ShowScheduleData[] | null>(null);

  return <ShowScheduleContext.Provider value={{ schedules, setSchedules }}>{children}</ShowScheduleContext.Provider>;
};

export default ShowSchedulesProvider;
