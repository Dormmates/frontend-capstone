import { NavLink, Outlet, useParams } from "react-router-dom";
import BreadCrumb from "../../../../components/ui/BreadCrumb";
import { useGetShow } from "../../../../_lib/@react-client-query/show";
import { ContentWrapper } from "../../../../components/layout/Wrapper";
import { useGetScheduleInformation } from "../../../../_lib/@react-client-query/schedule";
import { formatToReadableDate, formatToReadableTime } from "../../../../utils/date";

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
    { name: "Reservations", path: "reservations" },
  ];

  if (!show || !schedule || errorShow || errorSchedule) {
    return <p>Error loading</p>;
  }

  if (loadingShow || scheduleLoading) {
    return <p>Loading...</p>;
  }

  return (
    <ContentWrapper className="lg:!p-16 flex flex-col">
      <div className="flex flex-col gap-5 ">
        <BreadCrumb
          backLink={`/shows/${showId}`}
          items={[
            { name: "Shows", path: `/shows/${showId}` },
            { name: show.title, path: "" },
          ]}
        />
        <div className="flex w-full gap-10">
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
        <div className="flex gap-5">
          <div className="border border-lightGrey p-10 flex gap-5 mt-5 rounded-md shadow-sm w-fit">
            <img className="w-[150px] h-[120px] object-contain bg-gray" src={show.showCover} alt="show image" />

            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-xl uppercase">{show?.title}</h1>
              <p className="text-left break-words whitespace-pre-wrap  line-clamp-4 text-zinc-800 max-w-[500px]">{show.description}</p>
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
          <div className="flex flex-col justify-center text-2xl gap-2 mt-5 mb-10">
            <h1 className="text-center">
              You are viewing "<span className="font-bold">{show.title}</span>"
            </h1>
            <p className="text-center">
              Scheduled on <span className="font-bold">{formatToReadableDate(schedule.datetime + "")}</span> at{" "}
              <span className="font-bold">{formatToReadableTime(schedule.datetime + "")}</span>
            </p>
          </div>
        </div>
        <Outlet context={{ show, schedule }} />
      </div>
    </ContentWrapper>
  );
};

export default ViewShowScheduleLayout;
