import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { Link } from "react-router-dom";
import { useArchiveShow, useDeleteShow, useGetShows, useUnArchiveShow, useUpdateShow } from "@/_lib/@react-client-query/show.ts";
import { useMemo, useState } from "react";
import { useGetDepartments } from "@/_lib/@react-client-query/department.ts";
import type { Department } from "@/types/department.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import archiveIcon from "../../../assets/icons/archive.png";
import type { ShowData, ShowType } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Dropdown from "@/components/Dropdown";
import ToastNotification from "../../../utils/toastNotification";
import ViewArchivedShows from "./ViewArchivedShows";
import { Button } from "@/components/ui/button";
import ShowForm from "./ShowForm";
import Modal from "@/components/Modal";
import { getFileId } from "@/utils";
import ArchiveShow from "./ArchiveShow";
import { useQueryClient } from "@tanstack/react-query";
import PaginatedTable from "@/components/PaginatedTable";

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
  const queryClient = useQueryClient();
  const archiveShow = useArchiveShow();
  const unarchivedShow = useUnArchiveShow();
  const deleteShow = useDeleteShow();
  const updateShow = useUpdateShow();

  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows({
    departmentId: user?.role === "trainer" && user?.department ? user.department.departmentId : "",
  });
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();

  const [filter, setFilter] = useState({ showType: "all", department: "all", search: "" });
  const debouncedSearch = useDebounce(filter.search, 500);

  const [selectedShow, setSelectedShow] = useState<ShowData | null>(null);
  const [isArchiveShow, setIsArchiveShow] = useState(false);
  const [isEditDetails, setIsEditDetails] = useState(false);
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
              </div>
            ),
          },
        ]}
        data={filteredShows}
      />

      <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full">
        View Archived Show
      </Button>

      {isEditDetails && (
        <Modal
          description="Edit show information and click save"
          className="w-full max-w-4xl"
          title="Edit Show Details"
          isOpen={isEditDetails}
          onClose={() => setIsEditDetails(false)}
        >
          <ShowForm
            showType="group"
            isLoading={updateShow.isPending}
            onSubmit={(data) => {
              ToastNotification.info("Saving Changes");
              updateShow.mutate(
                {
                  showId: selectedShow?.showId as string,
                  showTitle: data.title,
                  description: data.description,
                  department: data.group as string,
                  genre: data.genre.join(", "),
                  createdBy: user?.userId as string,
                  showType: data.productionType as ShowType,
                  image: data.image as File,
                  oldFileId: data.image ? (getFileId(selectedShow?.showCover as string) as string) : undefined,
                },
                {
                  onSuccess: (data) => {
                    queryClient.setQueryData<ShowData>(["show", data.showId], data);
                    queryClient.setQueryData(["shows", user?.department?.departmentId].filter(Boolean), (oldData: ShowData[] | undefined) => {
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
              productionType: selectedShow?.showType as ShowType,
              description: selectedShow?.description as string,
              genre: selectedShow?.genreNames as string[],
              imageCover: selectedShow?.showCover as string,
              group: selectedShow?.department?.departmentId as string,
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
                  queryClient.setQueryData<ShowData[]>(["shows", user?.department?.departmentId].filter(Boolean), (oldData) => {
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
                      queryClient.setQueryData<ShowData[]>(["shows", user?.department?.departmentId].filter(Boolean), (oldData) => {
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
                    queryClient.setQueryData<ShowData[]>(["shows", user?.department?.departmentId].filter(Boolean), (oldData) => {
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

export default PerformingGroupShows;
