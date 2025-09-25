import { Link, useOutletContext, useParams } from "react-router-dom";
import { useGetScheduleDistributors } from "@/_lib/@react-client-query/schedule.ts";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginatedTable from "@/components/PaginatedTable";
import type { Schedule } from "@/types/schedule";

const ScheduleDistributorAndRemittances = () => {
  const { scheduleId, showId } = useParams();
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { data: distributors, isLoading, isError } = useGetScheduleDistributors(scheduleId as string);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    return distributors.filter((dist) => {
      const matchingName = dist.name.includes(searchValue);
      return matchingName;
    });
  }, [debouncedSearch, distributors]);

  if (isLoading) {
    return <h1>Loading....</h1>;
  }

  if (!distributors || isError) {
    return <h1>Error</h1>;
  }

  return (
    <>
      <h1 className="text-2xl">Manage Distributors</h1>

      <SimpleCard className="w-fit border-l-green" label="Total Distributors" value={distributors.length} />

      <div className="flex flex-col gap-10">
        <div className="flex justify-between">
          <Input
            className="max-w-[500px]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Distributor by Name"
          />
          <Button disabled={!schedule.isOpen}>
            <Link to={`/shows/${showId}/${scheduleId}/allocation`}>Allocate Ticket</Link>
          </Button>
        </div>

        <PaginatedTable
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
              render: (dist) => dist.distributorType,
            },
            {
              key: "group",
              header: "Group",
              render: (dist) => dist.department ?? "No Group",
            },
            {
              key: "ticket",
              header: "Allocated Tickets",
              render: (dist) => dist.totalAllocated,
            },
            {
              key: "sold",
              header: "Sold Tickets",
              render: (dist) => dist.totalSold,
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
