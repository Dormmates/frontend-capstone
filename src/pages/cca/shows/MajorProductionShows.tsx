import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
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
import { TheaterIcon } from "lucide-react";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const MajorProductionShows = () => {
  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows({ showType: "majorProduction" });

  const [isViewArchivedShows, setIsViewArchivedShows] = useState(false);

  const [search, setSearch] = useState("");

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
      const matchTitle = show.title.toLowerCase().includes(search.toLowerCase());
      return matchTitle;
    });
  }, [activeShows, search]);

  useEffect(() => {
    document.title = `Major Production Shows`;
  }, []);

  if (showsLoading) return <Loading />;
  if (!shows || !user) return <Error />;

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Major Production Shows</h1>
      <div className="flex flex-col gap-5 justify-between ">
        <div className="flex gap-5 mt-10">
          <SimpleCard
            icon={<TheaterIcon size={18} />}
            label="Major Production"
            value={activeShows.filter((s) => s.showType === "majorProduction").length}
          />
        </div>
        {user.roles.includes("head") && (
          <Link className="lg:self-end" to={"/majorShows/add?showType=major"}>
            <Button>Add New Major Production</Button>
          </Link>
        )}
      </div>
      <div className="mt-10 mb-5 flex gap-5">
        <Input className="w-fulls max-w-xl" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Show by Title" />
      </div>
      <PaginatedTable
        className={filteredShows.length != 0 ? "min-w-[700px]" : ""}
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
                <Link to={`/majorShows/${show.showId}`}>
                  <Button>Go To Schedules</Button>
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
        data={filteredShows}
      />

      {user.roles.includes("head") && (
        <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full">
          View Archived Show
        </Button>
      )}

      {isViewArchivedShows && (
        <Modal
          description="Archived shows can be deleted or unarchived"
          className="max-w-5xl w-full"
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
