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
    <div className="grid grid-cols-5 gap-5 my-10 place-items-center">
      {uniqueShows?.map((show) => (
        <Link to={`/history/${show.showId}`}>
          <div key={show.showId} className="flex flex-col gap-4 items-center">
            <img className="h-[300px] w-[150px] rounded" src={show.showCover} alt="" />
            <span>{show.showTitle}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DistributorHistoryMenu;
