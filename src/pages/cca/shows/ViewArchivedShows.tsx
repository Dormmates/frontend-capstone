import type { ShowData } from "../../../types/show";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import archiveIcon from "../../../assets/icons/archive.png";
import deleteIcon from "../../../assets/icons/delete.png";

import { useState } from "react";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

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
    <div className="mt-10 flex flex-col gap-5">
      <SimpleCard label="Total Shows" value={archivedShow.length} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Show Type</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-end pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {archivedShow.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                No shows found.
              </TableCell>
            </TableRow>
          ) : (
            archivedShow.map((show) => (
              <TableRow key={show.showId}>
                <TableCell>
                  <div className="flex items-center justify-start gap-5">
                    <img className="w-14 h-14 object-cover object-center" src={show.showCover} alt="show image" />

                    <p>{show.title}</p>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{show.showType}</TableCell>
                <TableCell>{show.department ? show.department.name : "All Department"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <div className="relative group">
                      <Button
                        disabled={isPending}
                        className="!p-0 "
                        onClick={() => {
                          unArchiveShow(show);
                        }}
                      >
                        <img src={archiveIcon} alt="archive" />
                      </Button>

                      <div className="absolute  -left-28 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                        Unarchive Show
                      </div>
                    </div>
                    <div className="relative group">
                      <Button
                        disabled={isPending}
                        className="!p-0"
                        onClick={() => {
                          setIsDelete(true);
                          setSelectedShow(show);
                        }}
                      >
                        <img src={deleteIcon} alt="delete" />
                      </Button>

                      <div className="absolute  -left-40 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                        Permanently Delete Show
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {isDelete && (
        <Dialog open={isDelete} onOpenChange={() => setIsDelete(false)}>
          <div className="flex gap-5 mt-10">
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
        </Dialog>
      )}
    </div>
  );
};

export default ViewArchivedShows;
