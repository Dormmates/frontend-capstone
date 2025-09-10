import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { formatToReadableDate } from "@/utils/date";

interface DateSelectorProps {
  date: Date | null;
  handleDateSelect: (selectedDate: Date) => void;
  error?: string;
  disabled?: boolean;
  initialValue?: Date;
}

const DateSelector = ({ disabled, date, handleDateSelect, initialValue, error }: DateSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col ">
      <Label className="my-2">Date</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} className={`z-1 ${error && "border-red"}`} asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            {date ? formatToReadableDate(date.toLocaleDateString()) : "Select date"}
            <ChevronDownIcon className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 z-[1000000]" align="start">
          <Calendar
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            className="border mt-2 rounded-md !bg-white"
            required
            mode="single"
            today={initialValue ?? new Date()}
            selected={initialValue ?? (date || undefined)}
            onSelect={(selectedDate: Date) => {
              handleDateSelect(selectedDate);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
};

export default DateSelector;
