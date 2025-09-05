import type { ShowData } from "@/types/show.ts";
import SimpleCard from "@/components/SimpleCard";
import { DataTable } from "@/components/DataTable.tsx";
import DeleteShow from "./showActions/DeleteShow";
import UnArchiveShow from "./showActions/UnArchiveShow";

type Props = {
  archivedShows: ShowData[];
};

const ViewArchivedShows = ({ archivedShows }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      <SimpleCard className="w-fit" label="Total Shows" value={archivedShows.length} />
      <DataTable
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
                <UnArchiveShow show={showData} />
                <DeleteShow show={showData} />
              </div>
            ),
          },
        ]}
        data={archivedShows}
      />
    </div>
  );
};

export default ViewArchivedShows;
