import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetShows } from "@/_lib/@react-client-query/show.ts";
import Modal from "@/components/Modal";
import ArchiveShow from "./showActions/ArchiveShow";
import ViewArchivedShows from "./ViewArchivedShows";
import PaginatedTable from "@/components/PaginatedTable";
import EditShow from "./showActions/EditShow";

const MajorProductionShows = () => {
  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows({ showType: "majorProduction" });

  const [isViewArchivedShows, setIsViewArchivedShows] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

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
      return matchTitle;
    });
  }, [activeShows, debouncedSearch]);

  if (showsLoading) return <h1>Loading...</h1>;
  if (!shows || !user) return <h1>Error: No shows fetched.</h1>;

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Major Production Shows</h1>
      <div className="flex justify-between ">
        <div className="flex gap-5 mt-10">
          <SimpleCard
            className="border-l-green"
            label="Major Production"
            value={filteredShows.filter((s) => s.showType === "majorProduction").length}
          />
        </div>
        {user.roles.includes("head") && (
          <Link className="self-end" to={"/shows/add?showType=major"}>
            <Button>Add New Major Production</Button>
          </Link>
        )}
      </div>
      <div className="mt-10 mb-5 flex gap-5">
        <Input
          className="min-w-[450px] max-w-[450px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Show by Title"
        />
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

                {user.roles.includes("head") && (
                  <>
                    <EditShow show={show} />
                    <ArchiveShow show={show} />
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={activeShows}
      />

      {user.roles.includes("head") && (
        <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full">
          View Archived Show
        </Button>
      )}

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

export default MajorProductionShows;
