import { NavLink, Outlet, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useGetScheduleInformation } from "@/_lib/@react-client-query/schedule.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import Breadcrumbs from "@/components/BreadCrumbs";
import { CircleAlertIcon } from "lucide-react";

const ViewShowScheduleLayout = () => {
  const { showId, scheduleId } = useParams();
  const { data: show, isLoading: loadingShow, isError: errorShow } = useGetShow(showId as string);
  const { data: schedule, isLoading: scheduleLoading, isError: errorSchedule } = useGetScheduleInformation(scheduleId as string);

  const links = [
    { name: "Summary", path: "" },
    { name: "Distributor and Remittance", path: "d&r" },
    { name: "Tickets", path: "tickets" },
    { name: "Seats", path: "seats", hidden: schedule?.seatingType === "freeSeating" },
    { name: "Tally Data", path: "tally" },
    // { name: "Reservations", path: "reservations" },
  ];

  if (loadingShow || scheduleLoading) {
    return <p>Loading...</p>;
  }

  if (!show || !schedule || errorShow || errorSchedule) {
    return <p>Error loading</p>;
  }

  return (
    <ContentWrapper className="flex flex-col ">
      <div className="flex flex-col gap-5 ">
        <Breadcrumbs
          backHref={`/shows/${showId}`}
          items={[
            { name: "Schedules", href: `/shows/${showId}` },
            { name: show.title },
            { name: `${formatToReadableDate(schedule.datetime + "")} at ${formatToReadableTime(schedule.datetime + "")}` },
          ]}
        />
        <div className="flex flex-wrap w-full gap-10 my-5">
          {links
            .filter((link) => !link.hidden)
            .map((link) => (
              <NavLink
                key={link.path}
                end={link.path == ""}
                className={({ isActive }) => (isActive ? "font-semibold" : "font-normal text-lightGrey")}
                to={`/shows/schedule/${showId}/${scheduleId}/${link.path}`}
              >
                {link.name}
              </NavLink>
            ))}
        </div>
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
        {/* <div className="flex gap-5">
          <ShowCard title={show.title} description={""} showImage={show.showCover} genres={show.genreNames} />
          <div className="flex flex-col justify-center text-2xl gap-2 mt-5 mb-10">
            <h1 className="text-center">
              You are viewing "<span className="font-bold">{show.title}</span>"
            </h1>
            <p className="text-center">
              Scheduled on <span className="font-bold">{formatToReadableDate(schedule.datetime + "")}</span> at{" "}
              <span className="font-bold">{formatToReadableTime(schedule.datetime + "")}</span>
            </p>
          </div>
        </div> */}
        <Outlet context={{ show, schedule }} />
      </div>
    </ContentWrapper>
  );
};

export default ViewShowScheduleLayout;
