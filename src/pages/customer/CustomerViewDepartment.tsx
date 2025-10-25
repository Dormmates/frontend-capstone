import { useGetDepartmentShows } from "@/_lib/@react-client-query/customer";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Breadcrumbs from "@/components/BreadCrumbs";
import { useGetDepartment } from "@/_lib/@react-client-query/department";

const CustomerViewDepartment = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();

  const { data: departmentShows, isLoading: loadingShows } = useGetDepartmentShows(departmentId as string);
  const { data: department, isLoading: loadingDepartment } = useGetDepartment(departmentId as string);

  if (loadingShows || loadingDepartment) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <PageWrapper>
        <ContentWrapper>
          <Navbar className="flex items-center gap-10 p-5 lg:p-0" />

          <div className="mt-10">
            <Breadcrumbs backHref="/" items={[{ name: "Shows" }, { name: department?.name ?? "" }]} />
          </div>

          <div className="flex w-full justify-center">
            <div className="flex items-center justify-center flex-col gap-2">
              <div className="w-48 aspect-square">
                <img className="w-full h-full object-contain" src={department?.logoUrl} alt="" />
              </div>
              <h1 className="text-5xl">{department?.name}</h1>
            </div>
          </div>
        </ContentWrapper>

        <div className="flex flex-wrap gap-5 mt-20">
          {departmentShows?.upcomingShows.map((show) => (
            <div
              onClick={() => navigate(`/show/${show.showId}`)}
              key={show.showId}
              className="relative w-full max-w-[350px] h-[550px] overflow-hidden group cursor-pointer"
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
      </PageWrapper>
    </>
  );
};

export default CustomerViewDepartment;
