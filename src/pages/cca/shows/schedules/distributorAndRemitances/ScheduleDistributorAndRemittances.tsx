import { Link, useOutletContext, useParams } from "react-router-dom";
import { useGetScheduleDistributors } from "@/_lib/@react-client-query/schedule.ts";
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
    return <h1>Loading....</h1>;
  }

  if (!distributors || isError || errorDepartments) {
    return <h1>Error</h1>;
  }

  return (
    <>
      <h1 className="text-2xl">Manage Distributors</h1>

      <SimpleCard className="w-fit" label="Total Distributors" value={distributors.length} />

      <div className="flex flex-col gap-10">
        <div className="flex justify-between">
          <div className="w-full flex  gap-2">
            <Input
              className="w-full max-w-[500px]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search Distributor by Name"
            />

            <Dropdown value={selectedType} items={distributorTypeOptions} onChange={(value) => setSelectedType(value)} />

            {show.showType == "majorProduction" && selectedType == "cca" && (
              <Dropdown value={selectedDepartment} items={departmentOptions} onChange={(value) => setSelectedDepartment(value)} />
            )}
          </div>

          <div className="flex gap-2">
            {(user?.roles.includes("head") || show.showType !== "majorProduction") && (
              <>
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
                  <Link to={`/shows/${showId}/${scheduleId}/allocation`}>Allocate Ticket</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <PaginatedTable
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
                  <Link to={`/shows/schedule/${showId}/${scheduleId}/d&r/${dist.userId}`}>
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

export default ScheduleDistributorAndRemittances;
