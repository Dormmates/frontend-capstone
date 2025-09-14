import { useGetScheduleInformation, useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule";
import Breadcrumbs from "@/components/BreadCrumbs";
import SeatMap from "@/components/SeatMap";
import type { Schedule } from "@/types/schedule";
import type { FlattenedSeat } from "@/types/seat.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOutletContext, useParams, Link } from "react-router-dom";
import InputField from "@/components/InputField";
import type { InputReservationData, ReservationData } from "@/types/reservation";
import Modal from "@/components/Modal";

const CustomerViewSchedule = () => {
  const context = useOutletContext<{ schedule?: Schedule }>();
  const { showId, scheduleId } = useParams();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<FlattenedSeat[]>([]);
  const [lockSeats, setLockSeats] = useState(false);
  const [inputReservation, setInputReservation] = useState<InputReservationData>({
    firstName: "",
    lastName: "",
    emailAddress: "",
    contactNumber: "",
  });

  const reservationData: ReservationData = {
    scheduleId,
    selectedSeats,
    firstName: inputReservation?.firstName,
    lastName: inputReservation?.lastName,
    emailAddress: inputReservation?.emailAddress,
    contactNumber: inputReservation?.contactNumber,
  };

  const handleReservationSubmission = () => {
    const errors: string[] = [];
    if (selectedSeats.length < 1) errors.push("Please select atleast 1 seat");
    if (selectedSeats.length > 0 && !lockSeats) errors.push("Please confirm seat selection");
    if (!reservationData.firstName.trim()) errors.push("First Name is required");
    if (!reservationData.lastName.trim()) errors.push("Last Name is required");
    if (!reservationData.emailAddress.trim()) errors.push("Email Address is required");
    if (!reservationData.contactNumber.trim()) errors.push("Contact Number is required");

    if (errors.length > 0) {
      setErrorMessages(errors);
      setErrorModal((prev) => !prev);
      return;
    }

    setSuccessModal((prev) => !prev);
  };

  const handleErrorModalClose = () => {
    setErrorMessages([]);
    setErrorModal((prev) => !prev);
  };

  const {
    data: fetchedSchedule,
    isLoading,
    isError,
  } = useGetScheduleInformation(scheduleId as string, {
    enabled: !context?.schedule,
  });

  const schedule = context?.schedule ?? fetchedSchedule;

  if (isLoading) return <p>Loading schedule...</p>;
  if (!schedule || isError) return <p>Error loading schedule</p>;

  return (
    <div className="mt-20">
      <Breadcrumbs backHref={`/customer/show/${showId}`} items={[{ name: "Change Schedule" }]} />

      <h1 className="text-xl font-medium mt-10 ">
        {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
      </h1>

      {schedule.seatingType === "controlledSeating" && (
        <ScheduleSeatMap
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          lockSeats={lockSeats}
          setLockedSeats={setLockSeats}
        />
      )}

      {schedule.seatingType === "freeSeating" && <div>Input ticket quantity</div>}

      <div className="mt-10">
        <ReservationInputForm inputReservation={inputReservation} setInputReservation={setInputReservation} />
      </div>

      <div className="flex justify-end mt-5">
        <Button onClick={handleReservationSubmission} className="px-10 py-6 text-lg w-[200px]">
          Confirm Reservation
        </Button>
      </div>

      <Modal
        title="Input Errors Detected!"
        description="Fix your inputs"
        isOpen={errorModal}
        onClose={() => handleErrorModalClose()}
      >
        <div className="flex flex-col gap-2">
          {errorMessages.map((error, index) => (
            <span className="text-red text-xl" key={index}>
              {error}
            </span>
          ))}
        </div>
      </Modal>

      <Modal
        title="Reservation Summary"
        description="Confirm your Reservation Details before submission"
        isOpen={successModal}
        onClose={() => setSuccessModal((prev) => !prev)}
      >
        <div className="flex flex-col gap-2"></div>
        <Link className="flex justify-end" to={`/customer`}>
          <Button>Submit Reservation</Button>
        </Link>
      </Modal>
    </div>
  );
};

const ScheduleSeatMap = ({
  selectedSeats,
  setSelectedSeats,
  lockSeats,
  setLockedSeats,
}: {
  selectedSeats: FlattenedSeat[];
  setSelectedSeats: React.Dispatch<React.SetStateAction<FlattenedSeat[]>>;
  lockSeats: boolean;
  setLockedSeats: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const handleSeatSelection = (clicked: FlattenedSeat | FlattenedSeat[]) => {
    if (lockSeats) return;

    const clickedSeats = Array.isArray(clicked) ? clicked : [clicked];

    const selectableSeats = clickedSeats.filter(
      (s) => s.status !== "reserved" && s.status !== "sold" && s.status !== "vip"
    );

    if (selectableSeats.length === 0) return;

    setSelectedSeats((prev = []) => {
      const seatNumbers = selectableSeats.map((s) => s.seatNumber);
      const allSelected = selectableSeats.every((s) => prev.some((p) => p.seatNumber === s.seatNumber));

      return allSelected
        ? prev.filter((seat) => !seatNumbers.includes(seat.seatNumber))
        : [...prev, ...selectableSeats.filter((s) => !prev.some((p) => p.seatNumber === s.seatNumber))];
    });
  };

  if (isLoading) {
    return <h1>Loadingg</h1>;
  }

  if (isError || !data) {
    return <h1>Error Loading Seat Map</h1>;
  }

  return (
    <>
      <SeatMap
        recStyle={(seat) => {
          return `${
            selectedSeats?.some((s) => s.seatNumber === seat.seatNumber)
              ? "fill-blue-400"
              : seat.status === "reserved" || seat.status === "sold" || seat.status === "vip"
              ? "fill-red"
              : ""
          }`;
        }}
        seatMap={data}
        seatClick={(clickedSeat: FlattenedSeat) => {
          handleSeatSelection(clickedSeat);
        }}
        rowClick={(clickedSeat: FlattenedSeat[]) => {
          handleSeatSelection(clickedSeat);
        }}
        sectionClick={(clickedSeat: FlattenedSeat[]) => {
          handleSeatSelection(clickedSeat);
        }}
      />

      <div className="flex justify-end mt-5">
        <Button onClick={() => setLockedSeats((prev) => !prev)} className={`px-10 py-6 text-lg w-[200px]`}>
          {lockSeats ? "Unlock Seats" : "Confirm Seats"}
        </Button>
      </div>
    </>
  );
};

const ReservationInputForm = ({
  inputReservation,
  setInputReservation,
}: {
  inputReservation: InputReservationData | undefined;
  setInputReservation: React.Dispatch<React.SetStateAction<InputReservationData>>;
}) => {
  const inputFieldProps: { label: string; placeholder: string; id: keyof InputReservationData }[] = [
    { label: "First Name", id: "firstName", placeholder: "eg: Mark" },
    { label: "Last Name", id: "lastName", placeholder: "eg: Dela Cruz" },
    { label: "Email Address", id: "emailAddress", placeholder: "eg: sample@gmail.com" },
    { label: "Contact Number", id: "contactNumber", placeholder: "eg: 09123456789" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        {inputFieldProps.map((prop) => (
          <InputField
            className="h-[50px]"
            key={prop.id}
            label={prop.label}
            id={prop.id}
            placeholder={prop.placeholder}
            value={inputReservation?.[prop.id] ?? ""}
            onChange={(e) => setInputReservation((prev) => ({ ...prev!, [prop.id]: e.target.value }))}
          />
        ))}
      </div>
    </>
  );
};

export default CustomerViewSchedule;
