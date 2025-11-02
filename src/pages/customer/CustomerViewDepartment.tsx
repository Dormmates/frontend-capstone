import { useGetDepartmentShows } from "@/_lib/@react-client-query/customer";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Breadcrumbs from "@/components/BreadCrumbs";
import { useGetDepartment } from "@/_lib/@react-client-query/department";
import { useState } from "react";
import type { ShowDataWithSchedules } from "@/types/show";
import CustomerViewShow from "./CustomerViewShow";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import Countdown from "@/components/Countdown";
import Loading from "@/components/Loading";

const CustomerViewDepartment = () => {
  const { departmentId } = useParams();

  const { data: departmentShows, isLoading: loadingShows } = useGetDepartmentShows(departmentId as string);
  const { data: department, isLoading: loadingDepartment } = useGetDepartment(departmentId as string);

  const [selectedShow, setSelectedShow] = useState<ShowDataWithSchedules | null>(null);

  if (loadingShows || loadingDepartment) {
    return <Loading />;
  }

  return (
    <>
      <PageWrapper>
        <ContentWrapper className="px-3">
          <Navbar className="flex items-center gap-10 p-3 lg:p-0" />

          <div className="flex w-full justify-center mt-20">
            <div className="flex items-center justify-center flex-col gap-2">
              <div className="w-48 aspect-square">
                <img className="w-full h-full object-contain" src={department?.logoUrl} alt="" />
              </div>
              <h1 className="text-5xl">{department?.name}</h1>
            </div>
          </div>

          {selectedShow && (
            <div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setSelectedShow(null)} variant="outline" size="sm">
                  <ChevronLeftIcon />
                </Button>
                <p className="text-sm text-muted-foreground">Return to main lists</p>
              </div>
              <div className="mt-10">
                <CustomerViewShow show={selectedShow} />
              </div>
              <div className="mt-20">
                <p className="font-semibold mb-2 text-sm">Explore Other Shows: </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                  {departmentShows?.otherShows
                    .filter((s) => s.showId !== selectedShow.showId)
                    .slice(0, 3)
                    .map((show) => (
                      <div
                        onClick={() => {
                          setSelectedShow(show);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        key={show.showId}
                        className="relative w-full  h-[350px] overflow-hidden group cursor-pointer"
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
                </div>
              </div>
            </div>
          )}

          {!selectedShow && (
            <>
              <div className="mt-40">
                <Breadcrumbs backHref="/" items={[{ name: "Shows" }, { name: department?.name ?? "" }]} />
              </div>
              <div>
                {departmentShows?.featuredShow && (
                  <>
                    <h1 className="mt-10 font-bold text-xl mb-2">Upcoming Show</h1>
                    <div
                      onClick={() => {
                        setSelectedShow(departmentShows.featuredShow);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      key={departmentShows.featuredShow.showId}
                      className="relative w-full h-[550px] overflow-hidden group cursor-pointer"
                    >
                      <img
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 group-hover:grayscale"
                        src={departmentShows.featuredShow.showCover}
                        alt={departmentShows.featuredShow.title}
                      />

                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent">
                        <div className="w-full p-5  transform translate-y-10 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <h1 className="text-2xl text-primary font-bold">{departmentShows.featuredShow.title}</h1>
                          <p className="text-sm line-clamp-3 text-white">{departmentShows.featuredShow.description}</p>
                        </div>
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold">
                      {formatToReadableDate(departmentShows.featuredShow.nextSchedule?.datetime + "")} at{" "}
                      {formatToReadableTime(departmentShows.featuredShow.nextSchedule?.datetime + "")}
                    </h1>
                    <p className="text-xl">
                      Starts in: <Countdown showDate={departmentShows.featuredShow.nextSchedule?.datetime + ""} />
                    </p>
                  </>
                )}
              </div>
              {departmentShows?.featuredShow && <h1 className="mt-10 font-bold text-xl -mb-8">Explore Other Shows</h1>}
              <div className="grid md:grid-cols-2 gap-5 mt-10">
                {departmentShows?.otherShows.map((show) => (
                  <div
                    onClick={() => {
                      setSelectedShow(show);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    key={show.showId}
                    className="relative w-full h-[550px] overflow-hidden group cursor-pointer"
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
              </div>
            </>
          )}
        </ContentWrapper>
      </PageWrapper>
    </>
  );
};

export default CustomerViewDepartment;
