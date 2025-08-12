import { NavLink, Outlet, useParams } from "react-router-dom";
import BreadCrumb from "../../../../components/ui/BreadCrumb";
import { useGetShow } from "../../../../_lib/@react-client-query/show";
import { ContentWrapper } from "../../../../components/layout/Wrapper";

const links = [
  { name: "Summary", path: "" },
  { name: "Distributor and Remittance", path: "d&r" },
  { name: "Tickets", path: "tickets" },
  { name: "Seats", path: "seats" },
  { name: "Tally Data", path: "tally" },
  { name: "Reservations", path: "reservations" },
];

const ViewShowScheduleLayout = () => {
  const { showId, scheduleId } = useParams();
  const { data, isLoading, isError } = useGetShow(showId as string);

  if (!data || isError) {
    return <p>Error loading</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <ContentWrapper className="lg:!p-16 flex flex-col">
      <div className="flex flex-col gap-5 ">
        <BreadCrumb
          backLink={`/shows/${showId}`}
          items={[
            { name: "Shows", path: `/shows/${showId}` },
            { name: data.title, path: "" },
          ]}
        />
        <div className="flex w-full gap-10">
          {links.map((link) => (
            <NavLink
              end={link.path == ""}
              className={({ isActive }) => (isActive ? "font-semibold" : "font-normal text-lightGrey")}
              to={`/schedule/${showId}/${scheduleId}/${link.path}`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <Outlet context={{ showId, scheduleId }} />;
      </div>
    </ContentWrapper>
  );
};

export default ViewShowScheduleLayout;
