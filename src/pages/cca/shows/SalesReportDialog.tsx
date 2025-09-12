import { useState } from "react";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import type { Schedule } from "@/types/schedule";
import { toast } from "sonner";

type SalesReportDialogProps = {
  showSchedules: Schedule[];
  openSalesReport: boolean;
  setOpenSalesReport: (open: boolean) => void;
  onGenerateReport: (selectedScheduleIds: string[]) => void;
};

const SalesReportDialog = ({ showSchedules, openSalesReport, setOpenSalesReport, onGenerateReport }: SalesReportDialogProps) => {
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);

  const handleCheckboxChange = (scheduleId: string, checked: boolean) => {
    setSelectedSchedules((prev) => (checked ? [...prev, scheduleId] : prev.filter((id) => id !== scheduleId)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSchedules(checked ? showSchedules.map((s) => s.scheduleId) : []);
  };

  const handleGenerate = () => {
    if (selectedSchedules.length === 0) {
      toast.error("Please select at least one schedule", { position: "top-center" });
      return;
    }
    onGenerateReport(selectedSchedules);
    setOpenSalesReport(false);
  };

  const allSelected = selectedSchedules.length === showSchedules.length;

  return (
    <DialogPopup
      isOpen={openSalesReport}
      setIsOpen={setOpenSalesReport}
      title="Generate Sales Report"
      description="Choose schedules to include in the sales report"
      triggerElement={<Button variant="outline">Generate Sales Report</Button>}
      submitAction={handleGenerate}
      saveTitle="Generate"
    >
      <div className="overflow-x-auto rounded-lg border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Checkbox checked={allSelected} onCheckedChange={(checked) => handleSelectAll(checked as boolean)} />
                  <span>Date</span>
                </div>
              </TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10 text-gray-400">
                  No schedules found.
                </TableCell>
              </TableRow>
            ) : (
              showSchedules.map((schedule) => (
                <TableRow key={schedule.scheduleId} className={selectedSchedules.includes(schedule.scheduleId) ? "bg-blue-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedSchedules.includes(schedule.scheduleId)}
                        onCheckedChange={(checked) => handleCheckboxChange(schedule.scheduleId, checked as boolean)}
                      />
                      {formatToReadableDate(schedule.datetime + "")}
                    </div>
                  </TableCell>
                  <TableCell>{formatToReadableTime(schedule.datetime + "")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DialogPopup>
  );
};

export default SalesReportDialog;
