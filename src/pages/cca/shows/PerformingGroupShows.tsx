import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useGetShows } from "@/_lib/@react-client-query/show.ts";
import { useMemo, useState } from "react";
import { useGetDepartments } from "@/_lib/@react-client-query/department.ts";
import type { Department } from "@/types/department.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Dropdown";
import ViewArchivedShows from "./ViewArchivedShows";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import ArchiveShow from "./showActions/ArchiveShow";
import PaginatedTable from "@/components/PaginatedTable";
import EditShow from "./showActions/EditShow";

const showTypes = [
  { name: "All Show Type", value: "all" },
  { name: "Major Concert", value: "majorConcert" },
  { name: "Show Case", value: "showCase" },
];

const parseDepartments = (departments: Department[]) => {
  const data = departments.map((d) => ({ name: d.name, value: d.departmentId }));
  data.unshift({ name: "All Departments", value: "all" });
  return data;
};

const PerformingGroupShows = () => {
  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows({
    departmentId: user?.role === "trainer" && user?.department ? user.department.departmentId : "",
  });
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();

  const [filter, setFilter] = useState({ showType: "all", department: "all", search: "" });
  const debouncedSearch = useDebounce(filter.search, 500);

  const [isViewArchivedShows, setIsViewArchivedShows] = useState(false);

  const departments = useMemo(() => {
    return parseDepartments(departmentsData ?? []);
  }, [departmentsData]);

  const activeShows = useMemo(() => {
    if (!shows) return [];
    return shows.filter((show) => !show.isArchived);
  }, [shows]);

  const archivedShows = useMemo(() => {
    if (!shows) return [];
    return shows.filter((show) => show.isArchived);
  }, [shows]);

  const filteredShows = useMemo(() => {
    if (!shows) return [];
    return activeShows.filter((show) => {
      const matchTitle = show.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchType = !filter.showType || filter.showType === "all" || show.showType === filter.showType;
      const matchDepartment = !filter.department || filter.department === "all" || show.department?.departmentId === filter.department;
      return matchTitle && matchType && matchDepartment;
    });
  }, [activeShows, debouncedSearch, filter.showType, filter.department]);

  if (showsLoading || departmentsLoading) return <h1>Loading...</h1>;
  if (!shows || !departmentsData || !user) return <h1>Error: No shows fetched.</h1>;

  return (
    <ContentWrapper>
      <h1 className="text-3xl">{user.department?.name} Shows</h1>
      <div className="flex justify-between">
        <div className="flex gap-5 mt-10">
          <SimpleCard label="Total Show" value={filteredShows.length} />
          <SimpleCard className="border-l-red" label="Major Concert" value={filteredShows.filter((s) => s.showType === "majorConcert").length} />
          <SimpleCard className="border-l-orange-300" label="Show Case" value={filteredShows.filter((s) => s.showType === "showCase").length} />
        </div>
        <Link className="self-end" to={"/shows/add?showType=group"}>
          <Button>Add New Show</Button>
        </Link>
      </div>
      <div className="mt-10 flex gap-5 mb-5">
        <Input
          className="min-w-[450px] max-w-[450px]"
          value={filter.search}
          onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search Show by Title"
        />
        <div className="flex gap-3">
          <Dropdown
            disabled={user.role === "trainer"}
            label="Performing Groups"
            placeholder="Select Performing Group"
            className="max-w-[200px]"
            onChange={(value) => setFilter((prev) => ({ ...prev, department: value }))}
            value={user.role === "head" ? filter.department : user?.department ? user.department.departmentId : ""}
            items={departments}
          />
          <Dropdown
            label="Show Types"
            placeholder="Select Show Type"
            className="max-w-[200px]"
            onChange={(value) => setFilter((prev) => ({ ...prev, showType: value }))}
            value={filter.showType}
            items={showTypes}
          />
        </div>
      </div>

      <PaginatedTable
        columns={[
          {
            key: "title",
            header: "Title",
            render: (show: ShowData) => (
              <div className="flex items-center justify-start gap-5">
                <img className="w-14 h-14 object-cover object-center" src={show.showCover} alt="show image" />
                <p>{show.title}</p>
              </div>
            ),
          },
          {
            key: "department",
            header: "Department",
            render: (show: ShowData) => <span className="capitalize">{show?.department?.name}</span>,
          },
          {
            key: "showType",
            header: "Show Type",
            render: (show: ShowData) => <span className="capitalize">{show.showType}</span>,
          },
          {
            key: "totalSchedules",
            header: "Total Schedules",
            render: (show: ShowData) => show.showschedules.length,
          },
          {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (show: ShowData) => (
              <div className="flex justify-end items-center gap-2">
                <Link to={`/shows/${show.showId}`}>
                  <Button variant="outline">Go To Schedules</Button>
                </Link>

                <EditShow show={show} />
                <ArchiveShow show={show} />
              </div>
            ),
          },
        ]}
        data={filteredShows}
      />

      <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full">
        View Archived Show
      </Button>

      {isViewArchivedShows && (
        <Modal
          description="Archived shows can be deleted or unarchived"
          className="max-w-5xl"
          title="Archived Shows"
          onClose={() => setIsViewArchivedShows(false)}
          isOpen={isViewArchivedShows}
        >
          <ViewArchivedShows archivedShows={archivedShows} />
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default PerformingGroupShows;
