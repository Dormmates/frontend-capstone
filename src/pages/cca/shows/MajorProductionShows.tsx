import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import archiveIcon from "../../../assets/icons/archive.png";
import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useArchiveShow, useDeleteShow, useGetShows, useUnArchiveShow, useUpdateShow } from "@/_lib/@react-client-query/show.ts";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import ShowForm from "./ShowForm";
import ToastNotification from "@/utils/toastNotification";
import { getFileId } from "@/utils";
import ArchiveShow from "./ArchiveShow";
import ViewArchivedShows from "./ViewArchivedShows";
import PaginatedTable from "@/components/PaginatedTable";

const MajorProductionShows = () => {
  const queryClient = useQueryClient();
  const archiveShow = useArchiveShow();
  const unarchivedShow = useUnArchiveShow();
  const deleteShow = useDeleteShow();
  const updateShow = useUpdateShow();

  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows({ showType: "majorProduction" });

  const [selectedShow, setSelectedShow] = useState<ShowData | null>(null);
  const [isArchiveShow, setIsArchiveShow] = useState(false);
  const [isEditDetails, setIsEditDetails] = useState(false);
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
        {user.role === "head" && (
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

                {user.role === "head" && (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditDetails(true);
                        setSelectedShow(show);
                      }}
                    >
                      Edit Details
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsArchiveShow(true);
                            setSelectedShow(show);
                          }}
                        >
                          <img src={archiveIcon} alt="archive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Archive Show</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={activeShows}
      />

      {user.role === "head" && (
        <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full">
          View Archived Show
        </Button>
      )}

      {isEditDetails && (
        <Modal
          description="Edit show information and click save"
          className="w-full max-w-4xl"
          title="Edit Show Details"
          isOpen={isEditDetails}
          onClose={() => setIsEditDetails(false)}
        >
          <ShowForm
            showType="major"
            isLoading={updateShow.isPending}
            onSubmit={(data) => {
              console.log(data);
              ToastNotification.info("Saving Changes");
              updateShow.mutate(
                {
                  showId: selectedShow?.showId as string,
                  showTitle: data.title,
                  description: data.description,
                  department: null,
                  genre: data.genre.join(", "),
                  createdBy: user?.userId as string,
                  showType: "majorProduction",
                  image: data.image as File,
                  oldFileId: data.image ? (getFileId(selectedShow?.showCover as string) as string) : undefined,
                },
                {
                  onSuccess: (data) => {
                    queryClient.setQueryData<ShowData>(["show", data.showId], data);
                    queryClient.setQueryData(["shows", "majorProduction"], (oldData: ShowData[] | undefined) => {
                      if (!oldData) return oldData;
                      return oldData.map((show) => (show.showId === data.showId ? data : show));
                    });

                    ToastNotification.success("Updated Show");
                    setSelectedShow(null);
                    setIsEditDetails(false);
                  },
                  onError: (err) => {
                    ToastNotification.error(err.message);
                  },
                }
              );
            }}
            formType="edit"
            showFormValue={{
              title: selectedShow?.title as string,
              productionType: "majorProduction",
              description: selectedShow?.description as string,
              genre: selectedShow?.genreNames as string[],
              imageCover: selectedShow?.showCover as string,
              group: "",
              showImagePreview: selectedShow?.showCover as string,
              image: null,
            }}
          />
        </Modal>
      )}

      {isArchiveShow && (
        <ArchiveShow
          onArchive={() => {
            archiveShow.mutate(
              { showId: selectedShow?.showId as string },
              {
                onSuccess: () => {
                  queryClient.setQueryData<ShowData[]>(["shows", "majorProduction"].filter(Boolean), (oldData) => {
                    if (!oldData) return oldData;
                    return oldData.map((show) => (show.showId === selectedShow?.showId ? { ...show, isArchived: true } : show));
                  });
                  ToastNotification.success("Show Archived");
                  setIsArchiveShow(false);
                },
                onError: (err) => {
                  ToastNotification.error(err.message);
                },
              }
            );
          }}
          isPending={archiveShow.isPending}
          isOpen={isArchiveShow}
          onClose={() => {
            setSelectedShow(null);
            setIsArchiveShow(false);
          }}
        />
      )}

      {isViewArchivedShows && (
        <Modal
          description="Archived shows can be deleted or unarchived"
          className="max-w-5xl"
          title="Archived Shows"
          onClose={() => setIsViewArchivedShows(false)}
          isOpen={isViewArchivedShows}
        >
          <ViewArchivedShows
            isPending={unarchivedShow.isPending || deleteShow.isPending}
            deletShow={(show) => {
              return new Promise((resolve) => {
                deleteShow.mutate(
                  { showId: show.showId },
                  {
                    onSuccess: () => {
                      queryClient.setQueryData<ShowData[]>(["shows", "majorProduction"].filter(Boolean), (oldData) => {
                        if (!oldData) return oldData;
                        return oldData.filter((s) => show.showId != s.showId);
                      });
                      ToastNotification.success("Show Deleted Permanently");
                      resolve(true);
                    },
                    onError: (err) => {
                      ToastNotification.error(err.message);
                      resolve(false);
                    },
                  }
                );
              });
            }}
            unArchiveShow={(show) => {
              unarchivedShow.mutate(
                { showId: show.showId },
                {
                  onSuccess: () => {
                    queryClient.setQueryData<ShowData[]>(["shows", "majorProduction"].filter(Boolean), (oldData) => {
                      if (!oldData) return oldData;
                      return oldData.map((show) => (show.showId === selectedShow?.showId ? { ...show, isArchived: false } : show));
                    });
                    ToastNotification.success("Unarchived Show");
                  },
                  onError: (err) => {
                    ToastNotification.error(err.message);
                  },
                }
              );
            }}
            archivedShow={archivedShows}
          />
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default MajorProductionShows;
