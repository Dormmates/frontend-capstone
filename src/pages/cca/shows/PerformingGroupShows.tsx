import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useGetShows } from "@/_lib/@react-client-query/show.ts";
import { useEffect, useMemo, useState } from "react";
import { useGetDepartments } from "@/_lib/@react-client-query/department.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import Dropdown from "@/components/Dropdown";
import ViewArchivedShows from "./ViewArchivedShows";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import ArchiveShow from "./showActions/ArchiveShow";
import PaginatedTable from "@/components/PaginatedTable";
import EditShow from "./showActions/EditShow";
import { DramaIcon, SpotlightIcon, TheaterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const showTypes = [
  { name: "All Show Type", value: "all" },
  { name: "Major Concert", value: "majorConcert" },
  { name: "Show Case", value: "showCase" },
];

const PerformingGroupShows = () => {
  const { user } = useAuthContext();

  if (user?.departments.length === 0 && !user?.roles.includes("head")) {
    return (
      <ContentWrapper>
        <h1>You are not currently assigned to any Department</h1>
      </ContentWrapper>
    );
  }

  const { data: shows, isLoading: showsLoading } = useGetShows();

  useEffect(() => {
    document.title = `Performing Group Shows`;
  }, []);

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments(!user?.roles.includes("head") ? user?.userId : undefined);

  const [filter, setFilter] = useState({
    showType: "all",
    department: user?.roles.includes("head") ? "all" : (user?.departments[0].departmentId as string),
    search: "",
  });

  const [isViewArchivedShows, setIsViewArchivedShows] = useState(false);

  const departments = useMemo(() => {
    if (!departmentsData) return [];
    const options = departmentsData.map((d) => ({ name: d.name, value: d.departmentId }));

    return user?.roles.includes("head") ? [{ name: "All Departments", value: "all" }, ...options] : options;
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
      const matchTitle = show.title.toLowerCase().includes(filter.search.toLowerCase());
      const matchType = !filter.showType || filter.showType === "all" || show.showType === filter.showType;
      const matchDepartment = !filter.department || filter.department === "all" || show.department?.departmentId === filter.department;
      return matchTitle && matchType && matchDepartment;
    });
  }, [activeShows, filter.search, filter.showType, filter.department]);

  if (showsLoading || departmentsLoading) return <Loading />;
  if (!shows || !departmentsData || !user) return <Error />;

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Performing Group Shows</h1>
      <div className="flex justify-between mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5 gap-2">
          <SimpleCard className="w-full" icon={<TheaterIcon size={18} />} label="Total Show" value={filteredShows.length} />
          <SimpleCard
            className="w-full"
            icon={<DramaIcon size={18} />}
            label="Major Concert"
            value={filteredShows.filter((s) => s.showType === "majorConcert").length}
          />
          <SimpleCard
            className="w-full"
            icon={<SpotlightIcon size={18} />}
            label="Show Case"
            value={filteredShows.filter((s) => s.showType === "showCase").length}
          />
        </div>
        <Link className="self-end" to={"/shows/add?showType=group"}>
          <Button>Add New Show</Button>
        </Link>
      </div>
      <div className="mt-10 flex flex-col gap-5 mb-5 md:flex-row">
        <Input
          className="max-w-xl w-full"
          value={filter.search}
          onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search Show by Title"
        />
        <div className="flex gap-3">
          <Dropdown
            label="Performing Groups"
            placeholder="Select Performing Group"
            className="max-w-[200px]"
            onChange={(value) => setFilter((prev) => ({ ...prev, department: value }))}
            value={filter.department}
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
        className={filteredShows.length != 0 ? "min-w-[850px]" : ""}
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
                  <Button>Go To Schedules</Button>
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
