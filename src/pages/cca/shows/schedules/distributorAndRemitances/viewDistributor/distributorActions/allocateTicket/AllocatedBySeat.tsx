import { useParams } from "react-router-dom";
import { useAllocateTicketByControlNumber, useGetDistributorsForAllocation, useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule.ts";
import type { FlattenedSeat } from "@/types/seat.ts";
import { useMemo, useState } from "react";
import SeatMap from "@/components/SeatMap";
import InputField from "@/components/InputField";
import { distributorTypeOptions } from "@/types/user";
import Dropdown from "@/components/Dropdown";
import PaginatedTable from "@/components/PaginatedTable";
import { compressControlNumbers } from "@/utils/controlNumber";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ShowData } from "@/types/show";
import { Label } from "@/components/ui/label";
import type { Ticket } from "@/types/ticket";
import Modal from "@/components/Modal";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import LongCard from "@/components/LongCard";
import LongCardItem from "@/components/LongCardItem";
import { compressSeats } from "@/utils/seatmap";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

type Props = {
  unAllocatedTickets: { total: number; tickets: Ticket[] };
  showData: ShowData;
};

const AllocatedBySeat = ({ unAllocatedTickets, showData }: Props) => {
  const { user } = useAuthContext();
  const allocateTicket = useAllocateTicketByControlNumber();
  const queryClient = useQueryClient();

  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const [choosenSeats, setChoosenSeats] = useState<FlattenedSeat[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<{
    userId: string;
    firstName: string;
    lastName: string;
    distributorType: string;
  } | null>(null);

  const [isChooseDistributor, setIsChooseDistributor] = useState(false);
  const [error, setError] = useState<{ distributorError?: string; seatError?: string }>({});
  const [isAllocationSummary, setIsAllocationSummary] = useState(false);

  const seatAvailabilityCount = useMemo(() => {
    if (!data) return { available: 0, unavailable: 0 };
    const available = data.filter((seat) => !seat.isComplimentary && seat.ticketControlNumber !== 0 && seat.status === "available").length;

    const unavailable = data.filter(
      (seat) => seat.isComplimentary || seat.ticketControlNumber === 0 || ["reserved", "sold"].includes(seat.status)
    ).length;

    return { available, unavailable };
  }, [data]);

  const handleClick = (seats: FlattenedSeat[]) => {
    setChoosenSeats((prev) => {
      const updated = [...prev];

      const alreadySelected = seats.every((seat) => updated.some((s) => s.seatNumber === seat.seatNumber));

      if (alreadySelected) {
        return updated.filter((s) => !seats.some((seat) => seat.seatNumber === s.seatNumber));
      } else {
        return [...updated, ...seats];
      }
    });
  };

  const validate = () => {
    let isValid = true;
    const newErrors: typeof error = {};

    if (!selectedDistributor) {
      toast.error("Please choose a distributor", { position: "top-center" });
      newErrors.distributorError = "Please choose a distributor";
      isValid = false;
    }

    if (!choosenSeats || choosenSeats.length == 0) {
      toast.error("Please choose atleast one seat", { position: "top-center" });
      newErrors.seatError = "Please choose atleast one seat";
      isValid = false;
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
      controlNumbers: choosenSeats.map((seat) => seat.ticketControlNumber),
      allocatedBy: user?.userId as string,
    };
    toast.promise(allocateTicket.mutateAsync(payload), {
      position: "top-center",
      loading: "Allocating tickets...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "distributors", scheduleId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["schedule", "seatmap", scheduleId], exact: true });
        setIsAllocationSummary(false);
        setSelectedDistributor(null);
        setChoosenSeats([]);
        return "Tickets allocated";
      },
      error: (err: any) => {
        console.log("Full error details:", err);
        return err.message || "Failed to allocate tickets";
      },
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <Error />;
  }

  return (
    <>
      <div className="flex gap-2 flex-col mt-8">
        <Label>Choose Distributor</Label>
        <Button
          disabled={unAllocatedTickets.total === 0}
          onClick={() => setIsChooseDistributor(true)}
          className={`w-fit ${error.distributorError && "border-red"}`}
          variant="outline"
        >
          <div className="flex gap-12">
            {selectedDistributor ? <h1>{selectedDistributor.firstName + " " + selectedDistributor.lastName}</h1> : <h1></h1>}
            <p className="text-lightGrey font-normal">click to choose distributor</p>
          </div>
        </Button>
        {error.distributorError && <p className="text-red text-sm">{error.distributorError}</p>}
      </div>
      <div className="flex flex-col gap-5 mb-5">
        <h1 className="text-xl">Choose Seats</h1>

        <div className="flex flex-col">
          <div className="flex flex-col items-start gap-3">
            <div className="flex gap-2 items-center ">
              <div className="w-4 h-4 bg-blue-600 border"></div>
              <p>
                Selected Seats: <span className="font-bold">{choosenSeats.length} seats</span>
              </p>
            </div>
            <div className="flex gap-2 items-center ">
              <div className="w-4 h-4 bg-darkGrey border"></div>
              <p>Unavailable Seats : {seatAvailabilityCount.unavailable}</p>
            </div>
            <div className="flex gap-2 items-center ">
              <div className="w-4 h-4 bg-white border"></div>
              <p>Available Seats: {seatAvailabilityCount.available}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`${error.distributorError && "border border-red p-1 rounded-md"}`}>
        <SeatMap
          disabled={false}
          seatMap={data}
          seatClick={(seat) => {
            if (
              seat.isComplimentary ||
              seat.ticketControlNumber == 0 ||
              seat.status === "reserved" ||
              seat.status == "paidToCCA" ||
              seat.status === "sold"
            )
              return;
            handleClick([seat]);
          }}
          rowClick={(seats) => {
            const selectableSeats = seats.filter(
              (seat) =>
                !seat.isComplimentary &&
                seat.ticketControlNumber !== 0 &&
                seat.status !== "reserved" &&
                seat.status !== "paidToCCA" &&
                seat.status !== "sold"
            );
            if (selectableSeats.length === 0) return;
            handleClick(selectableSeats);
          }}
          sectionClick={(seats) => {
            const selectableSeats = seats.filter(
              (seat) =>
                !seat.isComplimentary &&
                seat.ticketControlNumber !== 0 &&
                seat.status !== "reserved" &&
                seat.status !== "paidToCCA" &&
                seat.status !== "sold"
            );
            if (selectableSeats.length === 0) return;
            handleClick(selectableSeats);
          }}
          recStyle={(seat) => `${
            seat.isComplimentary ||
            seat.ticketControlNumber == 0 ||
            seat.status == "reserved" ||
            seat.status === "sold" ||
            seat.status === "paidToCCA"
              ? "fill-darkGrey !cursor-not-allowed"
              : "hover:fill-blue-200 cursor-pointer"
          }
    
        ${choosenSeats.includes(seat) ? "fill-blue-600" : ""}`}
        />
      </div>
      {error.seatError && <p className="text-sm text-red">{error.seatError}</p>}

      <Button disabled={unAllocatedTickets.total === 0 || allocateTicket.isPending} onClick={validate} className=" max-w-fit mt-5">
        Reserve Seats
      </Button>

      {isChooseDistributor && (
        <Modal
          description="Select a distributor whom the ticket will be allocated"
          className="max-w-4xl"
          title="Select Distributor"
          isOpen={isChooseDistributor}
          onClose={() => setIsChooseDistributor(false)}
        >
          <ChooseDistributor
            scheduleId={scheduleId as string}
            departmentId={showData.showType !== "majorProduction" ? showData.department?.departmentId ?? "" : ""}
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
            <LongCardItem value={selectedDistributor?.distributorType + ""} label="Type" />
            <LongCardItem value={choosenSeats.length} label={"Total Seats"} />
            <LongCardItem
              className="!whitespace-normal"
              value={compressSeats(choosenSeats.map((seat) => seat.seatNumber)).join(", ")}
              label={"Seat Numbers"}
            />
          </LongCard>

          <div className="mt-3">
            <p>
              Please provide <span className="font-bold">{choosenSeats.length} tickets </span> to the distributor
            </p>
            <p>
              Ticket Control Number{choosenSeats.length > 1 && "s"} to be given:{" "}
              <span className="font-bold">{compressControlNumbers(choosenSeats.map((seat) => seat.ticketControlNumber))}</span>
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button disabled={allocateTicket.isPending} onClick={() => setIsAllocationSummary(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={allocateTicket.isPending} onClick={submit}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

type ChooseDistributorProps = {
  selectedDistributor: { userId: string; firstName: string; lastName: string; distributorType: string } | null;
  show: ShowData;
  closeModal: () => void;
  onChoose: (dist: { userId: string; firstName: string; lastName: string; distributorType: string }) => void;
  scheduleId: string;
  departmentId: string;
};

const ChooseDistributor = ({ onChoose, selectedDistributor, closeModal, scheduleId, departmentId }: ChooseDistributorProps) => {
  const {
    data: distributors,
    isLoading: loadingDistributors,
    isError: distributorsError,
  } = useGetDistributorsForAllocation(scheduleId, departmentId);
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("cca");

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];

    const search = searchValue.trim().toLowerCase();

    return distributors.filter((dist) => {
      const fullName = `${dist.firstName} ${dist.lastName}`.toLowerCase();
      const matchesName = fullName.includes(search);
      const matchesType = selectedType ? dist.distributorType === selectedType : true;

      return matchesName && matchesType;
    });
  }, [searchValue, selectedType, distributors]);

  if (loadingDistributors) {
    return <h1>Loading...</h1>;
  }

  if (!distributors || distributorsError) {
    return <h1>Failed to load distributors</h1>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:items-center gap-4">
        <div className="w-full max-w-[300px]">
          <InputField placeholder="Search Distributor by Name" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        </div>
        <Dropdown value={selectedType} items={distributorTypeOptions} onChange={(value) => setSelectedType(value)} />
      </div>
      <div>
        <p className="mb-3 text-sm">
          Total Distributors: <span className="font-bold">{searchedDistributors.length}</span>
        </p>

        <PaginatedTable
          className="min-w-[800px]"
          data={searchedDistributors}
          columns={[
            {
              key: "name",
              header: "Full Name",
              render: (dist) => (
                <div className="flex gap-2 items-center">
                  {selectedDistributor?.userId === dist.userId && <div className="w-3 h-3 rounded-full bg-green"></div>}
                  {dist.lastName + ", " + dist.firstName}
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (dist) => distributorTypeOptions.find((d) => d.value === dist.distributorType)?.name,
            },
            {
              key: "group",
              header: "Performing Group",
              render: (dist) => dist.department.name,
            },
            {
              key: "current",
              header: "Tickets Allocated",
              render: (dist) => (
                <div className="flex items-center gap-2">
                  <p>{dist.tickets.length}</p>
                  {dist.tickets.length !== 0 && <p>[{compressControlNumbers(dist.tickets.map((t) => t.controlNumber))}]</p>}
                </div>
              ),
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
                      onChoose({ userId: dist.userId, firstName: dist.firstName, lastName: dist.lastName, distributorType: dist.distributorType });
                      closeModal();
                      toast.info(`Selected: ${dist.firstName + " " + dist.lastName}`, { position: "top-center" });
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

export default AllocatedBySeat;
