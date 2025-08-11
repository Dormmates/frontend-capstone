import { ContentWrapper } from "../../../components/layout/Wrapper";
import SimpleCard from "../../../components/ui/SimpleCard";
import Button from "../../../components/ui/Button";
import { Link } from "react-router-dom";
import { useGetShows } from "../../../_lib/@react-client-query/show";
import { useMemo, useState, useEffect } from "react";
import TextInput from "../../../components/ui/TextInput";
import Dropdown from "../../../components/ui/Dropdown";
import { useGetDepartments } from "../../../_lib/@react-client-query/department";
import type { Department } from "../../../types/department";
import { useAuthContext } from "../../../context/AuthContext";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import { useDebounce } from "../../../hooks/useDeabounce";
import archiveIcon from "../../../assets/icons/archive.png";
import Modal from "../../../components/ui/Modal";
import type { ShowData } from "../../../types/show";
import EditShowDetails from "./components/EditShowDetails";

const ITEMS_PER_PAGE = 5;

const showTypes = [
  { label: "All Show Type", value: "" },
  { label: "Major Concert", value: "majorConcert" },
  { label: "Show Case", value: "showCase" },
  { label: "Major Production", value: "majorProduction" },
];

const parseDepartments = (departments: Department[]) => {
  const data = departments.map((d) => ({ label: d.name, value: d.departmentId }));
  data.unshift({ label: "All Departments", value: "" });
  return data;
};

const Shows = () => {
  const [page, setPage] = useState(1);
  const [showType, setShowType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [isEditDetails, setIsEditDetails] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const { user } = useAuthContext();
  const { data: showsData, isLoading: showsLoading } = useGetShows(user?.role === "trainer" && user?.department ? user.department.departmentId : "");
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();

  const [selectedShow, setSelectedShow] = useState<ShowData | null>();

  const departments = useMemo(() => {
    return parseDepartments(departmentsData?.departments ?? []);
  }, [departmentsData]);

  const filteredShows = useMemo(() => {
    if (!showsData?.shows) return [];
    return showsData.shows.filter((show) => {
      const matchTitle = show.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchType = !showType || show.showType === showType;
      const matchDepartment = !selectedDepartment || show.department?.departmentId === selectedDepartment || !show.department;
      return matchTitle && matchType && matchDepartment;
    });
  }, [showsData?.shows, debouncedSearch, showType, selectedDepartment]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedDepartment, showType]);

  const paginatedShows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredShows.slice(start, end);
  }, [filteredShows, page]);

  if (showsLoading || departmentsLoading) return <h1>Loading...</h1>;
  if (!showsData || !departmentsData || !user) return <h1>Error: No shows fetched.</h1>;

  return (
    <ContentWrapper className="lg:!p-20">
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
          <Button className="text-black">Add New Show</Button>
        </Link>
      </div>

      <div className="mt-10 flex gap-5">
        <TextInput
          className="min-w-[450px] max-w-[450px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Show by Title"
        />
        <Dropdown
          disabled={user?.role !== "head"}
          className="min-w-[200px]"
          onChange={(value) => setSelectedDepartment(value)}
          value={user.role === "head" ? selectedDepartment : user?.department ? user.department.departmentId : ""}
          options={departments}
        />
        <Dropdown className="min-w-[200px]" onChange={(value) => setShowType(value)} value={showType} options={showTypes} />
      </div>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Show Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Actions</TableHead>
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
                        <Button variant="primary" className="!bg-gray !text-black !border-lightGrey border-2">
                          Go To Schedules
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          setIsEditDetails(true);
                          setSelectedShow(show);
                        }}
                      >
                        Edit Details
                      </Button>
                      <div className="relative group">
                        <Button variant="plain">
                          <img src={archiveIcon} alt="archive" />
                        </Button>

                        <div className="absolute  -left-20 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                          Archive Show
                        </div>
                      </div>
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

      <Button className="fixed bottom-10 right-10 shadow-lg rounded-full !text-black">View Archived Show</Button>

      {isEditDetails && (
        <Modal isOpen={isEditDetails} title="Edit Show Details" onClose={() => setIsEditDetails(false)}>
          <EditShowDetails close={() => setIsEditDetails(false)} selectedShow={selectedShow as ShowData} />
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default Shows;
