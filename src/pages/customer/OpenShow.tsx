import { useGetShowWithSchedules } from "@/_lib/@react-client-query/customer";
import CustomerViewShow from "./CustomerViewShow";
import { ContentWrapper, PageWrapper } from "@/components/layout/Wrapper";
import Breadcrumbs from "@/components/BreadCrumbs";
import NotFound from "@/components/NotFound";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";

const OpenShow = () => {
  const { showId } = useParams();
  const { data, isLoading } = useGetShowWithSchedules(showId as string);

  if (isLoading) {
    return <h1>Loadingg</h1>;
  }

  return (
    <PageWrapper>
      <ContentWrapper className="px-5">
        <Navbar className="flex items-center gap-10  lg:p-0" />
        <div className="mt-20">
          <div className="mb-10">
            <Breadcrumbs backHref="/" items={[{ name: "Return Home" }]} />
          </div>
          {data ? (
            <div>
              <CustomerViewShow show={data} />
            </div>
          ) : (
            <NotFound title="Show Not Found" description="" />
          )}
        </div>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default OpenShow;
