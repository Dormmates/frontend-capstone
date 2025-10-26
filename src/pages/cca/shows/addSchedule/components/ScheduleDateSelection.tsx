import type { ScheduleFormData } from "@/types/schedule.ts";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import DateSelector from "@/components/DateSelector";
import { X } from "lucide-react";

interface Props {
  scheduleData: ScheduleFormData;
  removeDate: (index: number) => void;
  handleDateChange: (value: Date, index: number) => void;
  handleTimeChange: (value: string, index: number) => void;
  errors?: Partial<Record<"dates", string>>;
}

interface DateTimeSelectionProps {
  dateItem: { date: Date | null; time: string };
  index: number;
  handleDateChange: (value: Date, index: number) => void;
  handleTimeChange: (value: string, index: number) => void;
  removeDate: (index: number) => void;
  removeHidden: boolean;
  errors?: Partial<Record<"dates", string>>;
}

const ScheduleDateSelection = ({ errors, scheduleData, removeDate, handleDateChange, handleTimeChange }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      {scheduleData.dates.map((dateItem, index) => (
        <DateTimeSelection
          key={index}
          errors={errors}
          dateItem={dateItem}
          index={index}
          handleDateChange={handleDateChange}
          handleTimeChange={handleTimeChange}
          removeDate={removeDate}
          removeHidden={scheduleData.dates.length === 1}
        />
      ))}
    </div>
  );
};

const DateTimeSelection = ({ dateItem, removeHidden, index, handleDateChange, handleTimeChange, removeDate, errors }: DateTimeSelectionProps) => {
  return (
    <div className="flex gap-4 items-start relative border p-3 rounded-sm">
      <DateSelector error={errors?.dates} date={dateItem.date} handleDateSelect={(selectedDate) => handleDateChange(selectedDate, index)} />
      <InputField
        error={errors?.dates}
        label="Time"
        type="time"
        step={900}
        id={`time-picker-${index}`}
        value={dateItem.time?.slice(0, 5)}
        onChange={(e) => handleTimeChange(e.target.value, index)}
        className="bg-background appearance-none"
      />

      <Button onClick={() => removeDate(index)} className={`absolute  -top-5 -right-6 ${removeHidden && "hidden"}`} variant="link">
        <X className="text-red" />
      </Button>
    </div>
  );
};

export default ScheduleDateSelection;
