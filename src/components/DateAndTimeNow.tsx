import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useEffect, useState } from "react";

const DateAndTimeNow = () => {
  const [dateNow, setDateNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start w-full ml-5 gap-3 ">
      <div className="text-sm">{formatToReadableDate(dateNow + "")}</div>
      <div className="text-sm">{formatToReadableTime(dateNow + "")}</div>
    </div>
  );
};

export default DateAndTimeNow;
