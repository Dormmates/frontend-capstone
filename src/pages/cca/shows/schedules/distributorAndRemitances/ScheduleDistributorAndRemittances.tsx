import { Link, useParams } from "react-router-dom";
import { useGetScheduleDistributors } from "@/_lib/@react-client-query/schedule.ts";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 5;

const ScheduleDistributorAndRemittances = () => {
  const { scheduleId, showId } = useParams();
  const { data: distributors, isLoading, isError } = useGetScheduleDistributors(scheduleId as string);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);
  const [page, setPage] = useState(1);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    return distributors.filter((dist) => {
      const matchingName = dist.name.includes(searchValue);
      return matchingName;
    });
  }, [debouncedSearch, distributors]);

  const paginatedDistributors = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return searchedDistributors.slice(start, end);
  }, [searchedDistributors, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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
          <Link to={`/shows/${showId}/${scheduleId}/allocation`}>
            <Button>Allocate Ticket</Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Allocated Tickets</TableHead>
              <TableHead>Sold Tickets </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDistributors.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-10 text-gray-400" colSpan={7}>
                  No Distributors Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedDistributors.map((dist, index) => (
                <TableRow key={index}>
                  <TableCell>{dist.name}</TableCell>
                  <TableCell>{dist.email}</TableCell>
                  <TableCell>{dist.distributorType}</TableCell>
                  <TableCell>{dist?.department ?? "No Group"}</TableCell>
                  <TableCell>{dist.totalAllocated}</TableCell>
                  <TableCell>{dist.totalSold}</TableCell>
                  <TableCell className="text-center">
                    <Link to={`/shows/schedule/${showId}/${scheduleId}/d&r/${dist.userId}`}>
                      <Button variant="outline">View Distributor</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ScheduleDistributorAndRemittances;
