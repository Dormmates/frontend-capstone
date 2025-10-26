import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import DeleteShow from "./showActions/DeleteShow";
import UnArchiveShow from "./showActions/UnArchiveShow";
import { TheaterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  archivedShows: ShowData[];
};

const ViewArchivedShows = ({ archivedShows }: Props) => {
  return (
    <div className="flex flex-col gap-5 w-full">
      <SimpleCard icon={<TheaterIcon size={18} />} className="w-fit" label="Total Shows" value={archivedShows.length} />
      <div className="w-full overflow-x-auto">
        <PaginatedTable
          className={archivedShows.length != 0 ? "min-w-[600px]" : ""}
          columns={[
            {
              key: "title",
              header: "Title",
              render: (show: ShowData) => (
                <div className="flex items-center justify-start gap-5">
                  <img className="w-14 h-14 object-cover object-center" src={show.showCover} alt="show image" />
                  <p>{show.title}</p>
                </div>
              ),
            },
            {
              key: "showType",
              header: "Show Type",
              render: (showData) => showData.showType.toUpperCase(),
            },
            {
              key: "department",
              header: "Department",
              render: (showData) => (showData.department ? showData.department.name : "All Department"),
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (showData) => (
                <div className="flex justify-end items-center gap-2">
                  <Link to={`/shows/${showData.showId}`}>
                    <Button>Go To Schedules</Button>
                  </Link>
                  <UnArchiveShow show={showData} />
                  <DeleteShow show={showData} />
                </div>
              ),
            },
          ]}
          data={archivedShows}
        />
      </div>
    </div>
  );
};

export default ViewArchivedShows;
