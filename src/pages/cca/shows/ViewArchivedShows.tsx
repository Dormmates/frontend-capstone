import type { ShowData } from "@/types/show.ts";
import archiveIcon from "../../../assets/icons/archive.png";
import deleteIcon from "../../../assets/icons/delete.png";
import { useState } from "react";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Modal from "@/components/Modal";
import { DataTable } from "@/components/DataTable.tsx";

type Props = {
  archivedShow: ShowData[];
  unArchiveShow: (show: ShowData) => void;
  deletShow: (show: ShowData) => Promise<boolean>;
  isPending: boolean;
};

const ViewArchivedShows = ({ archivedShow, unArchiveShow, deletShow, isPending }: Props) => {
  const [selectedShow, setSelectedShow] = useState<ShowData | null>(null);
  const [isDelete, setIsDelete] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <SimpleCard className="w-fit" label="Total Shows" value={archivedShow.length} />
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
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      disabled={isPending}
                      variant="ghost"
                      className="p-0"
                      onClick={() => {
                        unArchiveShow(showData);
                      }}
                    >
                      <img src={archiveIcon} alt="archive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unarchive Show</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      disabled={isPending}
                      variant="ghost"
                      className="p-0"
                      onClick={() => {
                        setIsDelete(true);
                        setSelectedShow(showData);
                      }}
                    >
                      <img src={deleteIcon} alt="delete" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Permanently Delete Show</TooltipContent>
                </Tooltip>
              </div>
            ),
          },
        ]}
        data={archivedShow}
      />

      {isDelete && (
        <Modal title="Permanently Delete Show" isOpen={isDelete} onClose={() => setIsDelete(false)}>
          <div className="flex gap-5 mt-5">
            <div className="w-[200px] flex items-center justify-center">
              <img className="object-cover min-w-[200px] h-full" src={selectedShow?.showCover} alt="Show Image" />
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-[100px_auto] gap-2">
                <p className="text-lightGrey">Show Title</p>
                <p className="font-medium">{selectedShow?.title}</p>
              </div>
              <div className="grid grid-cols-[100px_auto] gap-2">
                <p className="text-lightGrey">Group</p>
                <p className="font-medium">{selectedShow?.department ? selectedShow.department.name : "All Department"}</p>
              </div>
              <div className="grid grid-cols-[100px_auto] gap-2">
                <p className="text-lightGrey">Show Type</p>
                <p className="font-medium">{selectedShow?.showType?.toUpperCase()}</p>
              </div>
              <div className="grid grid-cols-[100px_auto] gap-2">
                <p className="text-lightGrey">Description</p>
                <p className="line-clamp-5 max-w-[300px] font-medium">{selectedShow?.description}</p>
              </div>
              <div className="grid grid-cols-[100px_auto] gap-2">
                <p className="text-lightGrey">Genre</p>
                <p className="font-medium">{selectedShow?.genreNames?.join(", ")}</p>
              </div>
            </div>
          </div>
          <div className="border-red border  bg-gray p-2 rounded-sm mt-5">
            <p className=" font-medium">The operation cannot be undone</p>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button
              disabled={isPending}
              onClick={async () => {
                const success = await deletShow(selectedShow as ShowData);

                if (success) {
                  setIsDelete(false);
                  setSelectedShow(null);
                }
              }}
              className="!bg-green"
            >
              Delete
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                setSelectedShow(null);
                setIsDelete(false);
              }}
              className="!bg-red"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewArchivedShows;
