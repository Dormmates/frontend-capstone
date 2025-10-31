import type { Ticket } from "@/types/ticket.ts";
import InputField from "@/components/InputField";
import {
  useAllocateTicketToMultipleDistributors,
  useGetDistributorsForAllocation,
  type ScheduleDistributorForAllocation,
} from "@/_lib/@react-client-query/schedule";
import Dropdown from "@/components/Dropdown";
import { useEffect, useMemo, useState } from "react";
import { distributorTypeOptions } from "@/types/user";
import { compressControlNumbers } from "@/utils/controlNumber";
import { Button } from "@/components/ui/button";
import { useGetDepartments } from "@/_lib/@react-client-query/department";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  scheduleId: string;
  departmentId: string;
  unAllocatedTickets: { total: number; tickets: Ticket[] };
  error?: string;
};

const itemsPerPage = 15;

const AllocateByControlNumber = ({ scheduleId, departmentId, unAllocatedTickets }: Props) => {
  const { user } = useAuthContext();
  const allocateTicket = useAllocateTicketToMultipleDistributors();
  const queryClient = useQueryClient();

  const {
    data: distributors,
    isLoading: loadingDistributors,
    isError: distributorsError,
  } = useGetDistributorsForAllocation(scheduleId, departmentId);

  const { data: departments, isLoading: loadingDepartments, isError: errorDepartments } = useGetDepartments(null);

  const [isAllocationSummary, setIsAllocationSummary] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<{ ticketsCount?: string }>({});
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("cca");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [haveAllocations, setHaveAllocations] = useState(false);
  const [selectedDistributors, setSelectedDistributors] = useState<ScheduleDistributorForAllocation[]>([]);
  const [ticketsCount, setTicketsCount] = useState<number | undefined>();

  const departmentOptions = useMemo(() => {
    if (!departments) return [];
    return [{ name: "All Groups", value: "all" }, ...departments.map((d) => ({ value: d.departmentId, name: d.name }))];
  }, [departments]);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    const search = searchValue.trim().toLowerCase();

    return distributors.filter((dist) => {
      const fullName = `${dist.firstName} ${dist.lastName}`.toLowerCase();
      const matchesName = fullName.includes(search);
      const matchesType = selectedType ? dist.distributorType === selectedType : true;
      const matchDeparment = selectedDepartment == "all" || selectedDepartment == dist.department.id;

      return matchesName && matchesType && matchDeparment;
    });
  }, [searchValue, selectedType, distributors, selectedDepartment]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return searchedDistributors.slice(start, end);
  }, [searchedDistributors, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [searchedDistributors]);

  const validate = () => {
    if (selectedDistributors.some((s) => s.tickets.length > 0)) {
      setHaveAllocations(true);
    } else {
      setIsAllocationSummary(true);
    }
  };

  const validateTicketsCount = (count: number | undefined, selectedCount: number) => {
    const totalNeeded = (count ?? 0) * selectedCount;
    const totalAvailable = unAllocatedTickets.total;

    if (count === undefined) {
      setError({});
    } else if (count <= 0) {
      setError({ ticketsCount: "Value must be greater than 0" });
    } else if (totalNeeded > totalAvailable) {
      setError({
        ticketsCount: `Exceeds available unallocated tickets (${totalAvailable} remaining)`,
      });
    } else {
      setError({});
    }
  };

  const sortDistributors = (list: ScheduleDistributorForAllocation[]) => {
    return [...list].sort((a, b) => a.lastName.localeCompare(b.lastName));
  };

  const submit = () => {
    if (!ticketsCount) return;

    const payload = {
      allocations: selectedDistributors.map((d) => ({ distributorId: d.userId, ticketCount: ticketsCount, name: d.lastName + ", " + d.firstName })),
      scheduleId: scheduleId as string,
      allocatedBy: user?.userId as string,
    };
    toast.promise(allocateTicket.mutateAsync(payload), {
      position: "top-center",
      loading: "Allocating tickets...",
      success: (res) => {
        console.log(res);
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "distributors", "allocation"], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "distributors", scheduleId], exact: true });
        setIsAllocationSummary(false);
        setSelectedDistributors([]);
        return "Tickets allocated";
      },
      error: (err: any) => {
        console.log("Full error details:", err);
        return err.message || "Failed to allocate tickets";
      },
    });
  };

  if (loadingDistributors || loadingDepartments) {
    return <h1>Loading...</h1>;
  }

  if (!distributors || distributorsError || errorDepartments) {
    return <h1>Failed to load distributors</h1>;
  }

  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          Remining Tickets for Allocation: <span className="font-normal">{unAllocatedTickets.total} tickets remaining</span>
        </p>

        <p className="font-bold">
          Unallocated Control Numbers:{" "}
          <span className="font-normal">{compressControlNumbers([...unAllocatedTickets.tickets.map((t) => t.controlNumber)])}</span>
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-full max-w-[300px]">
            <InputField placeholder="Search Distributor by Name" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </div>
          <Dropdown value={selectedType} items={distributorTypeOptions} onChange={(value) => setSelectedType(value)} />
          {selectedType == "cca" && (
            <Dropdown
              disabled={!!departmentId}
              value={!!departmentId ? departmentId : selectedDepartment}
              items={departmentOptions}
              onChange={(value) => setSelectedDepartment(value)}
            />
          )}
        </div>
        <div>
          <p className="font-semibold mb-2">Selected Distributors: {selectedDistributors.length}</p>
          {selectedDistributors.length !== 0 && (
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-4">
                Specify how many tickets each distributor will receive. Control numbers will be automatically assigned.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="flex-1">
                  <InputField
                    error={error.ticketsCount}
                    value={ticketsCount ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        const numericValue = value === "" ? undefined : Number(value);
                        setTicketsCount(numericValue);
                        validateTicketsCount(numericValue, selectedDistributors.length);
                      }
                    }}
                    label="Enter ticket count"
                    placeholder="e.g. 5"
                  />

                  {selectedDistributors.length > 0 && (ticketsCount ?? 0) > 0 && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      Total to allocate:{" "}
                      <span
                        className={`font-semibold ${
                          (ticketsCount ?? 0) * selectedDistributors.length > unAllocatedTickets.total ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {(ticketsCount ?? 0) * selectedDistributors.length} / {unAllocatedTickets.total}
                      </span>
                    </p>
                  )}
                </div>

                <Button onClick={validate} disabled={!ticketsCount || !!error.ticketsCount || selectedDistributors.length === 0}>
                  Allocate Tickets
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[40px] text-center">
                    <Checkbox
                      checked={
                        paginatedItems.length > 0 && paginatedItems.every((dist) => selectedDistributors.some((s) => s.userId === dist.userId))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newSelections = paginatedItems.filter((dist) => !selectedDistributors.some((s) => s.userId === dist.userId));
                          const updated = sortDistributors([...selectedDistributors, ...newSelections]);
                          setSelectedDistributors(updated);
                          validateTicketsCount(ticketsCount, updated.length);
                        } else {
                          const updated = selectedDistributors.filter((s) => !paginatedItems.some((dist) => dist.userId === s.userId));
                          setSelectedDistributors(updated);
                          validateTicketsCount(ticketsCount, updated.length);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground py-5">Full Name</TableHead>
                  <TableHead className="text-muted-foreground py-5">Type</TableHead>
                  <TableHead className="text-muted-foreground py-5">Performing Group</TableHead>
                  <TableHead className="text-muted-foreground py-5">Count of Tickets Allocated</TableHead>
                  <TableHead className="text-muted-foreground py-5">Control Numbers</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      No Data Found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((dist) => {
                    const isSelected = selectedDistributors.some((d) => d.userId === dist.userId);

                    return (
                      <TableRow key={dist.userId}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              let updated;
                              if (checked) {
                                updated = sortDistributors([...selectedDistributors, dist]);
                              } else {
                                updated = selectedDistributors.filter((d) => d.userId !== dist.userId);
                              }
                              setSelectedDistributors(updated);
                              validateTicketsCount(ticketsCount, updated.length);
                            }}
                          />
                        </TableCell>
                        <TableCell>{dist.lastName + ", " + dist.firstName}</TableCell>
                        <TableCell>{distributorTypeOptions.find((d) => d.value === dist.distributorType)?.name}</TableCell>
                        <TableCell>{dist.department.name}</TableCell>
                        <TableCell>{dist.tickets.length}</TableCell>
                        <TableCell>
                          {dist.tickets.length !== 0 ? (
                            <p>[{compressControlNumbers(dist.tickets.map((t) => t.controlNumber))}]</p>
                          ) : (
                            <p>No Tickets Allocated</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-sm">
            Total: <span className="font-bold">{searchedDistributors.length}</span>
          </p>

          <Pagination
            currentPage={page}
            totalPage={Math.ceil(searchedDistributors.length / itemsPerPage)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
      {haveAllocations && (
        <Modal
          title="Confirm Additional Allocation"
          description="Some distributors already have allocated tickets."
          isOpen={haveAllocations}
          onClose={() => setHaveAllocations(false)}
          className="max-w-2xl"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded-lg">
              <p className="font-semibold">⚠️ Please confirm:</p>
              <p>The following distributors already have ticket allocations. Are you sure you want to assign them more tickets?</p>
            </div>

            <PaginatedTable
              data={selectedDistributors.filter((d) => d.tickets.length > 0)}
              itemsPerPage={5}
              columns={[
                {
                  key: "name",
                  header: "Distributor Name",
                  render: (d) => `${d.lastName}, ${d.firstName}`,
                },
                {
                  key: "department",
                  header: "Department",
                  render: (d) => d.department.name,
                },
                {
                  key: "currentTickets",
                  header: "Currently Allocated Tickets",
                  render: (d) => d.tickets.length,
                },
                {
                  key: "controlNumbers",
                  header: "Control Numbers",
                  render: (d) => compressControlNumbers(d.tickets.map((d) => d.controlNumber)),
                },
              ]}
            />

            <div className="flex justify-end gap-3 mt-5">
              <Button variant="outline" onClick={() => setHaveAllocations(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setHaveAllocations(false);
                  setIsAllocationSummary(true);
                }}
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isAllocationSummary && (
        <Modal
          className="max-w-2xl"
          title="Allocation Summary"
          description="Please review the allocation summary first"
          isOpen={isAllocationSummary}
          onClose={() => {
            if (allocateTicket.isPending) return;
            setIsAllocationSummary(false);
          }}
        >
          <PaginatedTable
            data={selectedDistributors}
            itemsPerPage={10}
            columns={[
              {
                key: "name",
                header: "Distributor",
                render: (dist) => dist.lastName + ", " + dist.lastName,
              },
              {
                key: "type",
                header: "Type",
                render: (dist) => distributorTypeOptions.find((d) => d.value === dist.distributorType)?.name,
              },
              {
                key: "department",
                header: "Department",
                render: (dist) => dist.department.name,
              },
              {
                key: "tickets",
                header: "Tickets Count",
                render: () => ticketsCount,
              },
            ]}
          />
          <div className="flex justify-end gap-3 mt-5">
            <Button disabled={allocateTicket.isPending} onClick={() => setIsAllocationSummary(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={allocateTicket.isPending} onClick={submit}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AllocateByControlNumber;
