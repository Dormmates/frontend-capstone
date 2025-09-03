import { useMemo, useState } from "react";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { useParams } from "react-router-dom";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";

import LongCard from "../../../../../../components/LongCard";
import LongCardItem from "../../../../../../components/LongCardItem";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import { useAllocateTicketByControlNumber, useGetScheduleInformation, useGetScheduleTickets } from "@/_lib/@react-client-query/schedule.ts";
import type { Distributor } from "@/types/user.ts";
import AllocateByControlNumber from "./AllocateByControlNumber";
import AllocatedBySeat from "./AllocatedBySeat";
import type { ShowData } from "@/types/show.ts";
import { useGetDistributors } from "@/_lib/@react-client-query/accounts.ts";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import ToastNotification from "../../../../../../utils/toastNotification";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { parseControlNumbers, validateControlInput } from "@/utils/controlNumber.ts";
import { useQueryClient } from "@tanstack/react-query";
import type { FlattenedSeat } from "@/types/seat.ts";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import { Label } from "@/components/ui/label";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import InputField from "@/components/InputField";
import PaginatedTable from "@/components/PaginatedTable";

const TicketAllocation = () => {
  const { user } = useAuthContext();
  const { scheduleId, showId } = useParams();
  const { data: showData, isLoading: loadingShow, isError: showError } = useGetShow(showId as string);
  const { data: schedule, isLoading: loadingSchedule, isError: errorSchedule } = useGetScheduleInformation(scheduleId as string);
  const { data: tickets, isLoading: loadingTickets, isError: ticketsError } = useGetScheduleTickets(scheduleId as string);

  const allocateTicketByControlNumber = useAllocateTicketByControlNumber();
  const queryClient = useQueryClient();

  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [isChooseDistributor, setIsChooseDistributor] = useState(false);
  const [allocationMethod, setAllocationMethod] = useState<"controlNumber" | "seat">("controlNumber");
  const [controlNumberInput, setControlNumberInput] = useState("");

  const [parsedControlNumbers, setParsedControlNumbers] = useState<number[]>();
  const [choosenSeats, setChoosenSeats] = useState<FlattenedSeat[]>([]);

  const [error, setError] = useState<{ controlNumberError?: string; distributorError?: string; seatError?: string }>({});
  const [isAllocationSummary, setIsAllocationSummary] = useState(false);

  const unAllocatedTickets = useMemo(() => {
    if (!tickets) return { orchestra: [], balcony: [] };

    const orchestra = tickets.filter((ticket) => ticket.status == "not_allocated" && !ticket.isComplimentary && ticket.ticketSection == "orchestra");
    const balcony = tickets.filter((ticket) => ticket.status == "not_allocated" && !ticket.isComplimentary && ticket.ticketSection == "balcony");

    return { orchestra, balcony };
  }, [tickets]);

  const validate = () => {
    let isValid = true;
    const newErrors: typeof error = {};

    if (!selectedDistributor) {
      ToastNotification.error("Please choose a distributor");
      newErrors.distributorError = "Please choose a distributor";
      isValid = false;
    }

    if (allocationMethod === "controlNumber") {
      if (!validateControlInput(controlNumberInput.trim())) {
        ToastNotification.error("Please enter valid format or a value");
        newErrors.controlNumberError = "Please enter valid format or a value";
        isValid = false;
      }

      try {
        const parsedControlNumbers = parseControlNumbers(controlNumberInput);
        setParsedControlNumbers(parsedControlNumbers);
      } catch (err) {
        if (err instanceof Error) {
          newErrors.controlNumberError = err.message;
          isValid = false;
        }
      }
    } else if (allocationMethod == "seat") {
      if (!choosenSeats || choosenSeats.length == 0) {
        ToastNotification.error("Please choose atleast one seat");
        newErrors.seatError = "Please choose atleast one seat";
        isValid = false;
      }
    }

    if (isValid) {
      setIsAllocationSummary(true);
    }

    setError(newErrors);
    return isValid;
  };

  const submit = () => {
    const payload = {
      distributorId: selectedDistributor?.userId + "",
      scheduleId: scheduleId as string,
      controlNumbers:
        allocationMethod === "controlNumber" ? (parsedControlNumbers as number[]) : choosenSeats.map((seat) => seat.ticketControlNumber),
      allocatedBy: user?.userId as string,
    };
    allocateTicketByControlNumber.mutate(payload, {
      onSuccess: () => {
        ToastNotification.success("Allocated Tickets to the distributor");
        setIsAllocationSummary(false);
        setSelectedDistributor(null);
        setControlNumberInput("");
        setChoosenSeats([]);
        setParsedControlNumbers(undefined);
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "distributors", scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "seatmap", scheduleId], exact: true });
      },
      onError: (err) => {
        console.log("Full error details:", err);
        ToastNotification.error(err.message);
      },
    });
  };

  if (loadingShow || loadingSchedule || loadingTickets) {
    return <h1>Loadingg....</h1>;
  }

  if (!showData || showError || errorSchedule || !schedule || ticketsError || !tickets) {
    return <h1>Error</h1>;
  }

  return (
    <ContentWrapper className="lg:!p-16 flex flex-col">
      <Breadcrumbs items={[{ name: "Return to Distributor List", href: "" }]} backHref={`/shows/schedule/${showId}/${scheduleId}/d&r`} />

      <div className="flex flex-col gap-8 mt-10">
        <h1 className="text-3xl">Allocate Ticket To a Distributor</h1>

        <div>
          <LongCard className="w-fit" labelStyle="!text-xl" label="Show Details">
            <LongCardItem label="Show Title" value={showData.title} />
            <LongCardItem label="Date" value={formatToReadableDate(schedule.datetime + "")} />
            <LongCardItem label="Time" value={formatToReadableTime(schedule.datetime + "")} />
          </LongCard>
        </div>

        <div className="flex gap-2 flex-col">
          <Label>Choose Distributor</Label>
          <Button
            disabled={
              (unAllocatedTickets.balcony.length === 0 && unAllocatedTickets.orchestra.length === 0) || allocateTicketByControlNumber.isPending
            }
            onClick={() => setIsChooseDistributor(true)}
            className={`w-fit ${error.distributorError && "border-red"}`}
            variant="outline"
          >
            <div className="flex gap-12">
              {selectedDistributor ? <h1>{selectedDistributor.firstName + " " + selectedDistributor.lastName}</h1> : <h1>No Selected Distributor</h1>}
              <p className="text-lightGrey font-normal">click to choose distributor</p>
            </div>
          </Button>
          {error.distributorError && <p className="text-red text-sm">{error.distributorError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Allocation Method</Label>
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

        {allocationMethod === "controlNumber" && (
          <>
            <div className="flex flex-col gap-3">
              <AllocateByControlNumber
                unAllocatedTickets={unAllocatedTickets}
                controlNumber={controlNumberInput}
                setControlNumbers={setControlNumberInput}
                error={error.controlNumberError}
              />

              <Button
                disabled={
                  (unAllocatedTickets.balcony.length === 0 && unAllocatedTickets.orchestra.length === 0) || allocateTicketByControlNumber.isPending
                }
                onClick={validate}
                className="!bg-green max-w-fit"
              >
                Reserve Tickets
              </Button>
            </div>
          </>
        )}
        {allocationMethod === "seat" && (
          <>
            <AllocatedBySeat choosenSeats={choosenSeats} setChoosenSeats={setChoosenSeats} />
            <Button
              disabled={
                (unAllocatedTickets.balcony.length === 0 && unAllocatedTickets.orchestra.length === 0) || allocateTicketByControlNumber.isPending
              }
              onClick={validate}
              className="!bg-green max-w-fit"
            >
              Reserve Seats
            </Button>
          </>
        )}

        {isChooseDistributor && (
          <Modal
            description="Select a distributor whom the ticket will be allocated"
            className="max-w-4xl"
            title="Select Distributor"
            isOpen={isChooseDistributor}
            onClose={() => setIsChooseDistributor(false)}
          >
            <ChooseDistributor
              closeModal={() => setIsChooseDistributor(false)}
              selectedDistributor={selectedDistributor}
              show={showData}
              onChoose={(dist) => {
                setSelectedDistributor(dist);
                setError((prev) => ({ ...prev, distributorError: "" }));
              }}
            />
          </Modal>
        )}

        {isAllocationSummary && (
          <Modal
            className="max-w-2xl"
            title="Allocation Summary"
            description="Please review the allocation summary first"
            isOpen={isAllocationSummary}
            onClose={() => setIsAllocationSummary(false)}
          >
            <LongCard className="w-full" label="Ticket">
              <LongCardItem value={selectedDistributor?.firstName + " " + selectedDistributor?.lastName} label="Distributor Name" />
              <LongCardItem value={selectedDistributor?.distributor.distributortypes.name + ""} label="Type" />
              <LongCardItem
                value={allocationMethod === "controlNumber" ? parsedControlNumbers?.length + "" : choosenSeats.length}
                label={allocationMethod === "controlNumber" ? "Total Tickets" : "Total Seats"}
              />
              <LongCardItem
                className="!whitespace-normal"
                value={allocationMethod === "controlNumber" ? controlNumberInput : choosenSeats.map((seat) => seat.seatNumber).join(", ")}
                label={allocationMethod === "controlNumber" ? "Control Numbers" : "Seat Numbers"}
              />
            </LongCard>

            {allocationMethod == "seat" && (
              <div className="mt-3">
                <p>
                  Please provide <span className="font-bold">{choosenSeats.length} tickets </span> to the distributor
                </p>
                <p>
                  Ticket Control Numbers to be given:{" "}
                  <span className="font-bold">{choosenSeats.map((seat) => seat.ticketControlNumber).join(", ")} control numbers</span>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <Button disabled={allocateTicketByControlNumber.isPending} onClick={submit} className="!bg-green">
                Confirm
              </Button>
              <Button disabled={allocateTicketByControlNumber.isPending} onClick={() => setIsAllocationSummary(false)} className="!bg-red">
                Cancel
              </Button>
            </div>
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
  const {
    data: distributors,
    isLoading: loadingDistributors,
    isError: distributorsError,
  } = useGetDistributors(show.showType !== "majorProduction" ? show.department?.departmentId : "");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    return distributors.filter((dist) => {
      const fullName = dist.firstName + " " + dist.lastName;
      return fullName.trim().includes(searchValue.trim());
    });
  }, [debouncedSearch, distributors]);

  if (loadingDistributors) {
    return <h1>Loading...</h1>;
  }

  if (!distributors || distributorsError) {
    return <h1>Failed to load distributors</h1>;
  }

  return (
    <div className="flex flex-col gap-6">
      <InputField placeholder="Search Distributor by Name" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
      <div>
        <p className="mb-3 text-sm">
          Total Distributors: <span className="font-bold">{distributors.length}</span>
        </p>

        <PaginatedTable
          data={searchedDistributors}
          columns={[
            {
              key: "name",
              header: "Full Name",
              render: (dist) => (
                <div className="flex gap-2 items-center">
                  {selectedDistributor?.userId === dist.userId && <div className="w-3 h-3 rounded-full bg-green"></div>}
                  {dist.firstName + " " + dist.lastName}
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (dist) => dist.distributor.distributortypes.name,
            },
            {
              key: "group",
              header: "Performing Group",
              render: (dist) => (dist.distributor.department ? dist.distributor.department.name : "No Group"),
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-center",
              render: (dist) => (
                <div className="flex justify-center">
                  <Button
                    disabled={selectedDistributor?.userId === dist.userId}
                    onClick={() => {
                      onChoose(dist);
                      closeModal();
                      ToastNotification.info(`Selected: ${dist.firstName + " " + dist.lastName}`);
                    }}
                    variant="outline"
                  >
                    Select Distributor
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TicketAllocation;
