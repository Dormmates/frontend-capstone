import React, { useMemo, useState } from "react";
import { useGetShow } from "../../../../../_lib/@react-client-query/show";
import { useParams } from "react-router-dom";
import { ContentWrapper } from "../../../../../components/layout/Wrapper";
import BreadCrumb from "../../../../../components/ui/BreadCrumb";
import LongCard from "../../../../../components/ui/LongCard";
import LongCardItem from "../../../../../components/ui/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "../../../../../utils/date";
import { useGetScheduleInformation, useGetShowSchedules } from "../../../../../_lib/@react-client-query/schedule";
import type { Distributor } from "../../../../../types/user";
import Button from "../../../../../components/ui/Button";
import InputLabel from "../../../../../components/ui/InputLabel";
import AllocateByControlNumber from "./AllocateByControlNumber";
import AllocatedBySeat from "./AllocatedBySeat";
import Modal from "../../../../../components/ui/Modal";
import type { ShowData } from "../../../../../types/show";
import { useGetDistributors } from "../../../../../_lib/@react-client-query/accounts";
import { useDebounce } from "../../../../../hooks/useDeabounce";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/Table";
import TextInput from "../../../../../components/ui/TextInput";
import ToastNotification from "../../../../../utils/toastNotification";

const TicketAllocation = () => {
  const { scheduleId, showId } = useParams();
  const { data: showData, isLoading: loadingShow, isError: showError } = useGetShow(showId as string);
  const { data: schedule, isLoading: loadingSchedule, isError: errorSchedule } = useGetScheduleInformation(scheduleId as string);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  const [isChooseDistributor, setIsChooseDistributor] = useState(false);
  const [allocationMethod, setAllocationMethod] = useState<"controlNumber" | "seat">("controlNumber");

  if (!showData || showError || errorSchedule || !schedule) {
    return <h1>Error</h1>;
  }

  if (loadingShow || loadingSchedule) {
    return <h1>Loadingg....</h1>;
  }

  return (
    <ContentWrapper className="lg:!p-16 flex flex-col">
      <BreadCrumb items={[{ name: "Return", path: "" }]} backLink={`/shows/schedule/${showId}/${scheduleId}/d&r`} />

      <div className="flex flex-col gap-8 mt-10">
        <h1 className="text-3xl">Allocate Ticket To a Distributor</h1>

        <LongCard labelStyle="!text-xl" label="Show Details">
          <LongCardItem label="Show Title" value={showData.title} />
          <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
          <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
        </LongCard>

        <div className="flex gap-2 flex-col">
          <InputLabel label="Choose Distributor" />
          <Button onClick={() => setIsChooseDistributor(true)} variant="plain" className="!text-black border border-lightGrey border-md w-fit">
            <div className="flex gap-12">
              {selectedDistributor ? <h1>{selectedDistributor.firstName + " " + selectedDistributor.lastName}</h1> : <h1>No Selected Distributor</h1>}
              <p className="text-lightGrey font-normal">click to choose distributor</p>
            </div>
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <InputLabel label="Allocation Method" />
          <div className="flex gap-2">
            <div className="flex gap-2">
              <input
                checked={allocationMethod === "controlNumber"}
                onChange={(e) => setAllocationMethod(e.target.value as "controlNumber")}
                type="radio"
                id="controlNumber"
                name="allocationMethod"
                value="controlNumber"
              />
              <label htmlFor="controlNumber">By Control Number</label>
            </div>
            {schedule.seatingType === "controlledSeating" && (
              <div className="flex gap-2">
                <input
                  checked={allocationMethod === "seat"}
                  onChange={(e) => setAllocationMethod(e.target.value as "seat")}
                  type="radio"
                  id="seat"
                  name="allocationMethod"
                  value="seat"
                />
                <label htmlFor="seat">By Seat Map</label>
              </div>
            )}
          </div>
        </div>

        {allocationMethod === "controlNumber" && <AllocateByControlNumber />}
        {allocationMethod === "seat" && <AllocatedBySeat />}

        {isChooseDistributor && (
          <Modal
            className="w-full max-w-[800px]"
            isOpen={isChooseDistributor}
            onClose={() => setIsChooseDistributor(false)}
            title="Choose Distributor"
          >
            <ChooseDistributor
              closeModal={() => setIsChooseDistributor(false)}
              selectedDistributor={selectedDistributor}
              show={showData}
              onChoose={(dist) => setSelectedDistributor(dist)}
            />
          </Modal>
        )}
      </div>
    </ContentWrapper>
  );
};

type ChooseDistributorProps = {
  selectedDistributor: Distributor | null;
  show: ShowData;
  closeModal: () => void;
  onChoose: (dist: Distributor) => void;
};

const ChooseDistributor = ({ show, onChoose, selectedDistributor, closeModal }: ChooseDistributorProps) => {
  const ITEMS_PER_PAGE = 5;
  const {
    data: distributors,
    isLoading: loadingDistributors,
    isError: distributorsError,
  } = useGetDistributors(show.showType !== "majorProduction" ? show.department?.departmentId : "");
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    return distributors.filter((dist) => {
      const fullName = dist.firstName + " " + dist.lastName;
      return fullName.trim().includes(searchValue.trim());
    });
  }, [debouncedSearch, distributors]);

  const paginatedDistributors = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return searchedDistributors.splice(start, end);
  }, [page, searchedDistributors]);

  if (!distributors || distributorsError) {
    return <h1>Failed to load distributors</h1>;
  }

  if (loadingDistributors) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="mt-5 text-sm">List of Distributors</p>
      <TextInput placeholder="Search Distributor by Name" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
      <div>
        <p className="mb-3 text-sm">
          Total Distributors: <span className="font-bold">{distributors.length}</span>
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Performing Group</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDistributors.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-10 text-gray-400" colSpan={4}>
                  No Distributors Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedDistributors.map((dist) => (
                <TableRow key={dist.userId}>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {selectedDistributor?.userId === dist.userId && <div className="w-3 h-3 rounded-full bg-green"></div>}
                      {dist.firstName + " " + dist.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{dist.distributor.distributortypes.name}</TableCell>
                  <TableCell>{dist.distributor.department ? dist.distributor.department.name : "No Group"}</TableCell>
                  <TableCell>
                    <Button
                      disabled={selectedDistributor?.userId === dist.userId}
                      onClick={() => {
                        onChoose(dist);
                        closeModal();
                        ToastNotification.info(`Selected: ${dist.firstName + " " + dist.lastName}`);
                      }}
                      className="!bg-gray !text-black !border-lightGrey border-2"
                    >
                      Select Distributor
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-5">
          <Pagination currentPage={page} totalPage={Math.ceil(distributors.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>
    </div>
  );
};

export default TicketAllocation;
