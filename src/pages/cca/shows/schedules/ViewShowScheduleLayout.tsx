import { NavLink, Outlet, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useGetScheduleInformation } from "@/_lib/@react-client-query/schedule.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import Breadcrumbs from "@/components/BreadCrumbs";
import { CircleAlertIcon, InfoIcon } from "lucide-react";
import NotFound from "@/components/NotFound";
import { useEffect } from "react";

const ViewShowScheduleLayout = () => {
  const { showId, scheduleId } = useParams();
  const { data: show, isLoading: loadingShow, isError: errorShow } = useGetShow(showId as string);
  const { data: schedule, isLoading: scheduleLoading, isError: errorSchedule } = useGetScheduleInformation(scheduleId as string);

  useEffect(() => {
    document.title = `${show?.title} - ${formatToReadableDate(schedule?.datetime + "")}`;
  }, [schedule, show]);

  const links = [
    { name: "Summary", path: "" },
    { name: "Ticket Distributors", path: "d&r" },
    { name: "Tickets", path: "tickets" },
    { name: "Seats", path: "seats", hidden: schedule?.seatingType === "freeSeating" },
    // { name: "Tally Data", path: "tally" },
    // { name: "Reservations", path: "reservations" },
  ];

  if (loadingShow || scheduleLoading) {
    return <p>Loading...</p>;
  }

  return (
    <ContentWrapper className="flex flex-col ">
      <div className="flex flex-col gap-5 ">
        <Breadcrumbs
          backHref={`/shows/${showId}`}
          items={[
            { name: "Schedules", href: `/shows/${showId}` },
            { name: show?.title ?? "Not Found" },
            { name: `${formatToReadableDate(schedule?.datetime + "")} at ${formatToReadableTime(schedule?.datetime + "")}` },
          ]}
        />

        {!show || !schedule || errorShow || errorSchedule ? (
          <NotFound title="Schedule Not Found" description="This Schedule does not exist or have been deleted already" />
        ) : (
          <>
            {schedule.ticketType == "ticketed" && (
              <div className="flex flex-wrap w-full gap-10 my-5">
                {links
                  .filter((link) => !link.hidden)
                  .map((link) => (
                    <NavLink
                      key={link.path}
                      end={link.path == ""}
                      className={({ isActive }) => (isActive ? "font-semibold text-lg" : "font-normal text-lightGrey")}
                      to={`/shows/schedule/${showId}/${scheduleId}/${link.path}`}
                    >
                      {link.name}
                    </NavLink>
                  ))}
              </div>
            )}
            {!schedule.isOpen && (
              <div className="flex  flex-col bg-muted border shadow-sm border-l-red border-l-4 rounded-md w-full p-3 gap-1 ">
                <div className="flex items-center gap-2">
                  <CircleAlertIcon className="text-red w-4 font-bold" />
                  <p className="font-medium text-sm">Note - Schedule is currently closed</p>
                </div>
                <p className="text-sm text-muted-foreground ">
                  Actions such as ticket allocation, remittance, and related tasks are restricted until the schedule is reopened.
                </p>
              </div>
            )}
            {show.isArchived && (
              <div className="flex  flex-col bg-muted border shadow-sm border-l-red border-l-4 rounded-md w-full p-3 gap-1 ">
                <div className="flex items-center gap-2">
                  <CircleAlertIcon className="text-red w-4 font-bold" />
                  <p className="font-medium text-sm">Note - This Show Schedule is currently Archived</p>
                </div>
                <p className="text-sm text-muted-foreground ">
                  Actions such as ticket allocation, remittance, and related tasks are restricted until the show is unarchived.
                </p>
              </div>
            )}
            {schedule.ticketType == "ticketed" ? (
              <Outlet context={{ show, schedule }} />
            ) : (
              <div className="flex flex-col w-full justify-center items-center mt-20">
                <div className="flex items-center gap-2">
                  <InfoIcon />
                  <h1 className="font-bold text-2xl">No Data Available</h1>
                </div>
                <p className="text-muted-foreground">This show schedule is non-ticketed type and does not require any tickets.</p>
              </div>
            )}
          </>
        )}
      </div>
    </ContentWrapper>
  );
};

export default ViewShowScheduleLayout;
