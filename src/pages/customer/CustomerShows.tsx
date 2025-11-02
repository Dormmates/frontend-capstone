import { useGetDepartments } from "@/_lib/@react-client-query/department";
import { useGetShows } from "@/_lib/@react-client-query/show";
import { useEffect } from "react";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";
import type { ShowType } from "@/types/show";

import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";

const CustomerHome = () => {
  const { data: departments, isLoading } = useGetDepartments();

  useEffect(() => {
    document.title = "SLU CCA - Shows";
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageWrapper>
      <ContentWrapper>
        <div className="flex flex-col items-center w-full justify-center gap-5 mt-20 ">
          <h1 className="text-6xl font-bold text-center">All CCA Performances</h1>
          <p className="text-xl text-center">
            Experience the creativity of SLU’s artists. Browse current, upcoming, and past shows from every performing group.
          </p>

          <div className="flex flex-wrap gap-10 justify-center md:gap-20">
            {(departments ?? []).map((d) => (
              <div
                key={d.departmentId}
                className="aspect-square max-h-[300px] cursor-pointer flex items-center justify-center  rounded-lg transition duration-300"
              >
                <Link to={`/shows/${d.departmentId}`} className="flex items-center justify-center ">
                  <img className="w-full h-full max-w-[120px] object-cover hover:scale-110 transition duration-300" src={d.logoUrl} alt={d.name} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-20">
          <h1 className="text-center text-5xl mb-20">Major Production Shows</h1>
          <ShowsList showType="majorProduction" />
        </section>
      </ContentWrapper>
    </PageWrapper>
  );
};

const ShowsList = ({ departmentId, limit, showType }: { departmentId?: string; limit?: number; showType?: ShowType }) => {
  const { data: shows, isLoading: loadingShows, isError: errorShows } = useGetShows({ showType, excludeArchived: true, limit, departmentId });
  const navigate = useNavigate();

  if (loadingShows) {
    return <h1>Loading Shows</h1>;
  }

  if (errorShows || !shows) {
    return <h1>Error loading</h1>;
  }

  return (
    <div className="gap-10 grid md:grid-cols-2">
      {shows.map((show) => (
        <div
          onClick={() => navigate(`/show/${show.showId}`)}
          key={show.showId}
          className="relative w-full  h-[550px] overflow-hidden group cursor-pointer"
        >
          <img
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 group-hover:grayscale"
            src={show.showCover}
            alt={show.title}
          />

          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="w-full p-5  transform translate-y-10 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <h1 className="text-2xl text-primary font-bold">{show.title}</h1>
              <p className="text-sm line-clamp-3 text-white">{show.description}</p>
            </div>
          </div>
        </div>
      ))}

      {shows.length === 0 && <div>No Shows Found</div>}
    </div>
  );
};

export default CustomerHome;
