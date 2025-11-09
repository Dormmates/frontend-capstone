import { Link, useOutletContext, useParams } from "react-router-dom";
import { useCheckCloseSchedule, useGetScheduleDistributors } from "@/_lib/@react-client-query/schedule.ts";
import { useMemo, useState } from "react";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginatedTable from "@/components/PaginatedTable";
import type { Schedule } from "@/types/schedule";
import type { ShowData } from "@/types/show";
import { compressControlNumbers } from "@/utils/controlNumber";
import { useGetDepartments } from "@/_lib/@react-client-query/department";
import Dropdown from "@/components/Dropdown";
import { distributorTypeOptions } from "@/types/user";
import { useAuthContext } from "@/context/AuthContext";
import DialogPopup from "@/components/DialogPopup";
import { formatCurrency } from "@/utils";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const ScheduleDistributorAndRemittances = () => {
  const { user } = useAuthContext();
  const { scheduleId, showId } = useParams();
  const { schedule, show } = useOutletContext<{ schedule: Schedule; show: ShowData }>();
  const { data: distributors, isLoading, isError } = useGetScheduleDistributors(scheduleId as string);
  const {
    data: departments,
    isLoading: loadingDepartments,
    isError: errorDepartments,
  } = useGetDepartments(null, { enabled: show.showType == "majorProduction" });

  const [selectedType, setSelectedType] = useState("cca");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const departmentOptions = useMemo(() => {
    if (!departments) return [];
    return [{ name: "All Groups", value: "all" }, ...departments.map((d) => ({ value: d.departmentId, name: d.name }))];
  }, [departments]);

  const [searchValue, setSearchValue] = useState("");

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    return distributors.filter((dist) => {
      const matchesType = selectedType ? dist.distributorType === selectedType : true;
      const matchingName = dist.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchDeparment = selectedDepartment == "all" || selectedDepartment == dist.department.id;
      return matchingName && matchDeparment && matchesType;
    });
  }, [searchValue, distributors, selectedDepartment, selectedType]);

  if (isLoading || loadingDepartments) {
    return <Loading />;
  }

  if (!distributors || isError || errorDepartments) {
    return <Error />;
  }

  return (
    <>
      <h1 className="text-2xl">Manage Distributors</h1>

      <SimpleCard className="w-fit" label="Total Distributors" value={distributors.length} />

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <div className="w-full flex  gap-2">
            <Input
              className="w-full "
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search Distributor by Name"
            />

            <Dropdown value={selectedType} items={distributorTypeOptions} onChange={(value) => setSelectedType(value)} />

            {show.showType == "majorProduction" && selectedType == "cca" && (
              <Dropdown value={selectedDepartment} items={departmentOptions} onChange={(value) => setSelectedDepartment(value)} />
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-5">
            {(user?.roles.includes("head") || show.showType !== "majorProduction") && (
              <>
                <DialogPopup
                  className="max-w-4xl max-h-[90%]"
                  title="Distributor Balance Summary"
                  description="View the remaining balances and payment statuses of all distributors for this schedule. This includes allocated tickets, sales, payments made to the CCA, and outstanding balances."
                  triggerElement={<Button variant="secondary">View Distributor Balances</Button>}
                >
                  <AllocationSummary scheduleId={schedule.scheduleId} />
                </DialogPopup>

                <Button
                  onClick={() => {
                    const url = `/ticketInformation/${scheduleId}`;
                    window.open(url, "_blank");
                  }}
                  variant="secondary"
                >
                  Generate Ticket Allocations
                </Button>

                <Button disabled={!schedule.isOpen || show.isArchived}>
                  <Link to={`/${show.showType === "majorProduction" ? "majorShows" : "shows"}/${showId}/${scheduleId}/allocation`}>
                    Allocate Ticket
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <PaginatedTable
          className="min-w-[1000px]"
          itemsPerPage={10}
          emptyMessage="No Distributors found."
          data={searchedDistributors}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (dist) => dist.name,
            },
            {
              key: "email",
              header: "Email",
              render: (dist) => dist.email,
            },
            {
              key: "type",
              header: "Type",
              render: (dist) => dist.distributorType.toUpperCase(),
            },
            {
              key: "group",
              header: "Group",
              render: (dist) => dist.department.name ?? "No Group",
            },
            {
              key: "ticket",
              header: "Allocated Tickets",
              render: (dist) => dist.totalAllocated,
            },
            {
              key: "control",
              header: "Ticket Control Numbers",
              render: (dist) => (dist.ticketControlNumbers?.length == 0 ? "No Tickets Allocated" : compressControlNumbers(dist.ticketControlNumbers)),
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (dist) => (
                <div className="flex justify-end">
                  <Link to={`/${show.showType === "majorProduction" ? "majorShows" : "shows"}/schedule/${showId}/${scheduleId}/d&r/${dist.userId}`}>
                    <Button variant="outline">View Distributor</Button>
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

type AllocationSummaryProps = {
  scheduleId: string;
};

const AllocationSummary = ({ scheduleId }: AllocationSummaryProps) => {
  const { data, isLoading, isError } = useCheckCloseSchedule(scheduleId);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data?.withBalanceDue) return [];
    return data.withBalanceDue.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, data]);

  if (isLoading) {
    return <h1>Loadingg....</h1>;
  }

  if (isError || !data) {
    return <h1>Erorr</h1>;
  }

  return (
    <div>
      <div className="my-5">
        <p className="font-bold">Summary</p>
        <div>
          <p>Total Distributors: {data.summary.totalDistributors}</p>
          <p>Total Unpaid: {formatCurrency(data.summary.totalUnpaid)}</p>
          <p>Distributors with Balance Due: {data.summary.withBalanceDue}</p>
        </div>
      </div>

      {data.withBalanceDue.length > 0 && (
        <div>
          <InputField placeholder="Search By Name" className="my-5" onChange={(e) => setSearch(e.target.value)} value={search} />
          <p className="text-sm mb-1 text-muted-foreground">Distributors with balance due: </p>
          <PaginatedTable
            itemsPerPage={10}
            columns={[
              {
                key: "name",
                header: "Distributor Name",
                render: (dist) => dist.name,
              },
              {
                key: "total",
                header: "Total Tickets",
                render: (dist) => dist.totalTickets,
              },
              {
                key: "paid",
                header: "Total Paid",
                render: (dist) => formatCurrency(dist.totalPaid),
              },
              {
                key: "unpaid",
                header: "Balance Due",
                render: (dist) => formatCurrency(dist.unpaidAmount),
              },
              {
                key: "unpaidTickets",
                header: "Unpaid Tickets",
                render: (dist) => compressControlNumbers(dist.tickets.filter((t) => t.status !== "paidToCCA").map((t) => t.controlNumber)),
              },
            ]}
            data={filtered}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleDistributorAndRemittances;
