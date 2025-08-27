import { Link, useParams } from "react-router-dom";
import { useGetShow } from "../../../_lib/@react-client-query/show";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import { useGetShowSchedules } from "../../../_lib/@react-client-query/schedule";
import SimpleCard from "../../../components/ui/SimpleCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";
import Button from "../../../components/ui/Button";
import Dropdown from "../../../components/ui/Dropdown";
import deleteIcon from "../../../assets/icons/delete.png";
import { useShowScheduleContext } from "../../../context/ShowSchedulesContext";
import { useEffect } from "react";

const ViewShow = () => {
  const { setSchedules } = useShowScheduleContext();
  const { id } = useParams();
  const { data: show, isLoading: isShowLoading, isError: isShowError, error: showError } = useGetShow(id as string);
  const { data: showSchedules, isLoading: isSchedulesLoading, isError: isSchedulesError, error: schedulesError } = useGetShowSchedules(id as string);

  useEffect(() => {
    if (!showSchedules) return;

    setSchedules(showSchedules);
  }, [showSchedules]);

  if (isShowLoading || isSchedulesLoading) {
    return <div>Loading...</div>;
  }

  if (isShowError || isSchedulesError || !showSchedules || !show) {
    return (
      <div className="text-red-500">
        {isShowError && <p>Failed to load show: {showError?.message}</p>}
        {isSchedulesError && <p>Failed to load schedules: {schedulesError?.message}</p>}
      </div>
    );
  }

  return (
    <ContentWrapper className="lg:!p-20 flex flex-col">
      <BreadCrumb
        backLink="/shows"
        items={[
          { name: "Shows", path: "/shows" },
          { name: show?.title + "", path: "" },
        ]}
      />

      <div>
        <div className="border border-lightGrey p-10 flex gap-5 mt-10 rounded-md shadow-sm w-fit">
          <img className="w-[200px] h-[220px] object-contain bg-gray" src={show?.showCover} alt="show image" />

          <div className="flex flex-col gap-3">
            <h1 className="font-bold text-xl uppercase">{show?.title}</h1>
            <p className="text-left break-words whitespace-pre-wrap  line-clamp-4 text-zinc-800 max-w-[500px]">{show?.description}</p>
            <div className="flex flex-col gap-2">
              <p>Genres: </p>
              <div className="flex gap-5">
                {show?.genreNames.map((name, index) => (
                  <div key={index} className="bg-gray border-2 border-lightGrey px-5 rounded-full">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex justify-between">
            <div className="flex flex-col gap-5">
              <h1 className="font-semibold text-2xl ">Show Schedule</h1>
              <SimpleCard value={showSchedules.length + ""} label="Total" />
            </div>
            <Link className="self-end" to={`/shows/add/schedule/${id}`}>
              <Button>Add New Schedule</Button>
            </Link>
          </div>

          <div className="mt-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Seating Type</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Schedule Status</TableHead>

                  <TableHead className="text-center pl-60">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {showSchedules.length == 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      No Schedules
                    </TableCell>
                  </TableRow>
                ) : (
                  showSchedules.map((schedule) => (
                    <TableRow key={schedule.scheduleId}>
                      <TableCell>{formatToReadableDate(schedule.datetime + "")}</TableCell>
                      <TableCell>{formatToReadableTime(schedule.datetime + "")}</TableCell>
                      <TableCell>{schedule.seatingType.toUpperCase()}</TableCell>
                      <TableCell>{schedule.ticketType.toUpperCase()}</TableCell>
                      <TableCell>
                        {schedule.isOpen ? (
                          <div className="flex items-center gap-2">
                            <div className="bg-green w-3 h-3 rounded-full"></div>
                            <p>Open</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="bg-red w-3 h-3 rounded-full"></div>
                            <p>Closed</p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2 justify-end items-center ">
                          <Link to={`/shows/schedule/${id}/${schedule.scheduleId}/`}>
                            <Button className="!bg-gray !border-darkGrey !border-2 !text-black" disabled={!schedule.isOpen}>
                              Go To Schedule
                            </Button>
                          </Link>
                          <Dropdown
                            isFixed={true}
                            value="Options"
                            options={[
                              { label: "Reschedule", onClick: () => alert("Reschedule Show") },
                              { label: schedule.isOpen ? "Close Schedule" : "Open Schedule", onClick: () => alert("Handle Schedule") },
                            ]}
                          />
                          <Button variant="plain" disabled={schedule.isOpen}>
                            <img src={deleteIcon} alt="delete" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default ViewShow;
