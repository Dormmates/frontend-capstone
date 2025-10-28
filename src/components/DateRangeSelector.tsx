import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  const displayText = value?.from
    ? value?.to
      ? `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
      : format(value.from, "MMM d, yyyy")
    : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => range && onChange(range)}
          defaultMonth={value?.from}
          captionLayout="dropdown"
          showOutsideDays
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeSelector;
