import { useOutletContext, Link } from "react-router-dom";
import type { AllocationHistory } from "@/types/ticket";

const DistributorHistoryMenu = () => {
  const { allocationHistory } = useOutletContext<{ allocationHistory: AllocationHistory[] }>();

  const uniqueShows = allocationHistory?.reduce<AllocationHistory[]>((accumulated, item) => {
    if (!accumulated.some((x) => x.showId === item.showId)) {
      accumulated.push(item);
    }
    return accumulated;
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 my-10">
      {uniqueShows?.map((show) => (
        <Link key={show.showId} to={`/history/${show.showId}`} className="flex flex-col items-center text-center group ">
          <div className="w-full aspect-[3/4] max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px] overflow-hidden ">
            <img
              src={show.showCover}
              alt={show.showTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="mt-3 font-medium text-sm sm:text-base truncate w-full px-1">{show.showTitle}</span>
        </Link>
      ))}
    </div>
  );
};

export default DistributorHistoryMenu;
