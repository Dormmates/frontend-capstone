import { ContentWrapper } from "../../../components/layout/Wrapper";

import { Link } from "react-router-dom";
import { useArchiveShow, useDeleteShow, useGetShows, useUnArchiveShow } from "../../../_lib/@react-client-query/show";
import { useMemo, useState, useEffect } from "react";

import { useGetDepartments } from "../../../_lib/@react-client-query/department";
import type { Department } from "../../../types/department";
import { useAuthContext } from "../../../context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "../../../hooks/useDeabounce";
import archiveIcon from "../../../assets/icons/archive.png";

import type { ShowData } from "../../../types/show";
import EditShowDetails from "./EditShowDetails";
import { useQueryClient } from "@tanstack/react-query";
import ToastNotification from "../../../utils/toastNotification";
import ViewArchivedShows from "./ViewArchivedShows";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Dropdown from "@/components/Dropdown";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 5;

const showTypes = [
  { name: "All Show Type", value: "all" },
  { name: "Major Concert", value: "majorConcert" },
  { name: "Show Case", value: "showCase" },
  { name: "Major Production", value: "majorProduction" },
];

const parseDepartments = (departments: Department[]) => {
  const data = departments.map((d) => ({ name: d.name, value: d.departmentId }));
  data.unshift({ name: "All Departments", value: "all" });
  return data;
};

const Shows = () => {
  const queryClient = useQueryClient();
  const archiveShow = useArchiveShow();
  const unarchiveShow = useUnArchiveShow();
  const deleteShow = useDeleteShow();

  const { user } = useAuthContext();
  const { data: shows, isLoading: showsLoading } = useGetShows(user?.role === "trainer" && user?.department ? user.department.departmentId : "");
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();

  const [page, setPage] = useState(1);
  const [showType, setShowType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedShow, setSelectedShow] = useState<ShowData | null>();
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

  const filteredShows = useMemo(() => {
    if (!shows) return [];
    return activeShows.filter((show) => {
      const matchTitle = show.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchType = !showType || showType === "all" || show.showType === showType;
      const matchDepartment = !selectedDepartment || selectedDepartment === "all" || show.department?.departmentId === selectedDepartment;
      return matchTitle && matchType && matchDepartment;
    });
  }, [activeShows, debouncedSearch, showType, selectedDepartment]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedDepartment, showType]);

  const paginatedShows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredShows.slice(start, end);
  }, [filteredShows, page]);

  if (showsLoading || departmentsLoading) return <h1>Loading...</h1>;
  if (!shows || !departmentsData || !user) return <h1>Error: No shows fetched.</h1>;

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Shows</h1>

      <div className="flex justify-between">
        <div className="flex gap-5 mt-10">
          <SimpleCard label="Total Show" value={filteredShows.length} />
          <SimpleCard className="border-l-red" label="Major Concert" value={filteredShows.filter((s) => s.showType === "majorConcert").length} />
          <SimpleCard className="border-l-orange-300" label="Show Case" value={filteredShows.filter((s) => s.showType === "showCase").length} />
          <SimpleCard
            className="border-l-green"
            label="Major Production"
            value={filteredShows.filter((s) => s.showType === "majorProduction").length}
          />
        </div>
        <Link className="self-end" to={"/shows/add"}>
          <Button>Add New Show</Button>
        </Link>
      </div>

      <div className="mt-10 flex gap-5">
        <Input
          className="min-w-[450px] max-w-[450px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Show by Title"
        />
        <Dropdown
          label="Performing Groups"
          placeholder="Select Performing Group"
          className="max-w-[200px]"
          onChange={(value) => setSelectedDepartment(value)}
          value={user.role === "head" ? selectedDepartment : user?.department ? user.department.departmentId : ""}
          items={departments}
        />
        <Dropdown
          label="Show Types"
          placeholder="Select Show Type"
          className="max-w-[200px]"
          onChange={(value) => setShowType(value)}
          value={showType}
          items={showTypes}
        />
      </div>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Show Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No shows found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedShows.map((show) => (
                <TableRow key={show.showId}>
                  <TableCell>
                    <div className="flex items-center justify-start gap-5">
                      <img className="w-14 h-14 object-cover object-center" src={show.showCover} alt="show image" />

                      <p>{show.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{show.showType}</TableCell>
                  <TableCell>{show.department ? show.department.name : "All Department"}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-5">
          <Pagination currentPage={page} totalPage={Math.ceil(filteredShows.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>

      <Button onClick={() => setIsViewArchivedShows(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full ">
        View Archived Show
      </Button>

      {isEditDetails && (
        <Dialog open={isEditDetails} onOpenChange={() => setIsEditDetails(false)}>
          <EditShowDetails groups={departmentsData} close={() => setIsEditDetails(false)} selectedShow={selectedShow as ShowData} />
        </Dialog>
      )}

      {isArchiveShow && (
        <Dialog open={isArchiveShow} onOpenChange={() => setIsArchiveShow(false)}>
          <div className="mt-5">
            <h1 className="font-semibold mb-2">Archiving this show will permanently:</h1>
            <ul className="list-disc ml-6 space-y-1">
              <li>Remove the show from the active and archived shows list.</li>
              <li>
                Delete <strong>all schedules</strong> associated with this show.
              </li>
              <li>
                Delete <strong>all allocated tickets</strong> linked to these schedules.
              </li>
              <li>
                Delete <strong>all seat reservations</strong> for the schedules.
              </li>
              <li>
                Delete <strong>all remittance and sales records</strong> for the show.
              </li>
              <li>
                Delete <strong>all logs and history</strong> related to this show.
              </li>
            </ul>
            <div className="border-red border  bg-gray p-2 rounded-sm mt-5">
              <p className=" font-medium">This action will erase all data related to this show and cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button
                disabled={archiveShow.isPending}
                onClick={() =>
                  archiveShow.mutate(
                    { showId: selectedShow?.showId as string },
                    {
                      onSuccess: () => {
                        queryClient.setQueryData<ShowData[]>(["shows"], (oldData) => {
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
                  )
                }
                className="!bg-green"
              >
                Archive Show
              </Button>
              <Button disabled={archiveShow.isPending} onClick={() => setIsArchiveShow(false)} className="!bg-red">
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {isViewArchivedShows && (
        <Dialog onOpenChange={() => setIsViewArchivedShows(false)} open={isViewArchivedShows}>
          <ViewArchivedShows
            isPending={unarchiveShow.isPending || deleteShow.isPending}
            deletShow={(show) => {
              return new Promise((resolve) => {
                deleteShow.mutate(
                  { showId: show.showId },
                  {
                    onSuccess: () => {
                      queryClient.setQueryData<ShowData[]>(["shows"], (oldData) => {
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
              unarchiveShow.mutate(
                { showId: show.showId },
                {
                  onSuccess: () => {
                    queryClient.setQueryData<ShowData[]>(["shows"], (oldData) => {
                      if (!oldData) return oldData;
                      return oldData.map((s) => (show.showId === s?.showId ? { ...show, isArchived: false } : s));
                    });
                    ToastNotification.success("Unarchived Show");
                  },
                  onError: (err) => {
                    ToastNotification.error(err.message);
                  },
                }
              );
            }}
            archivedShow={shows.filter((show) => show.isArchived)}
          />
        </Dialog>
      )}
    </ContentWrapper>
  );
};

export default Shows;
