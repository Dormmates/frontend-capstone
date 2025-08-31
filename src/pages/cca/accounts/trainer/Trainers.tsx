import { ContentWrapper } from "../../../../components/layout/Wrapper";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/Table";

import archiveIcon from "../../../../assets/icons/archive.png";
import unassign from "../../../../assets/icons/unassign.png";

import { useEditTrainer, useGetTrainers, useNewTrainer } from "../../../../_lib/@react-client-query/accounts";

import { useMemo, useState } from "react";
import { useDebounce } from "../../../../hooks/useDeabounce";

import { useGetDepartments, useRemoveDepartmentTrainerByTrainerId } from "../../../../_lib/@react-client-query/department";

import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import type { Trainer } from "../../../../types/user";

import TrainerForm from "./TrainerForm";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@radix-ui/react-dialog";

const ITEMS_PER_PAGE = 5;

const Trainers = () => {
  const addTrainer = useNewTrainer();
  const editTrainer = useEditTrainer();
  const removeTrainer = useRemoveDepartmentTrainerByTrainerId();
  const queryClient = useQueryClient();

  const [isAddTrainer, setIsAddTrainer] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchValue);
  const { data: trainers, isLoading: loadingTrainers } = useGetTrainers();
  const { data: departments, isLoading: loadingDepartments } = useGetDepartments();

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const [unassignTrainer, setUnassignTrainer] = useState({ userId: "", openModal: false });

  const searchedTrainers = useMemo(() => {
    if (!trainers) return [];
    return trainers
      .filter((trainer) => !trainer.isArchived)
      .filter((trainer) => {
        const l = trainer.lastName.toLocaleLowerCase().trim();
        const f = trainer.firstName.toLocaleLowerCase().trim();
        const s = searchValue.toLocaleLowerCase().trim();

        return l.includes(s) || f.includes(s) || (f + " " + l).includes(s);
      });
  }, [debouncedSearch, trainers]);

  const paginatedTrainers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return searchedTrainers.slice(start, end);
  }, [searchedTrainers, page]);

  const groupOptions = (departments ?? [])
    .filter((department) => !department.trainerId || !department.trainerName)
    .map((department) => ({ label: department.name, value: department.departmentId }));

  const handleRemoveTrainerDepartment = () => {
    removeTrainer.mutate(unassignTrainer.userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["trainers"], exact: true });
        queryClient.invalidateQueries({ queryKey: ["departments"], exact: true });
        ToastNotification.success("Trainer Department Removed");
        setUnassignTrainer({ userId: "", openModal: false });
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  if (loadingTrainers || loadingDepartments) {
    return <h1>Loading..</h1>;
  }

  if (!trainers || !departments) {
    return <h1>Error</h1>;
  }

  return (
    <ContentWrapper className="lg:!p-20">
      <h1 className="text-3xl">Trainers</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Trainers" value={trainers?.length + ""} />
        <Button onClick={() => setIsAddTrainer(true)} className="text-black self-end">
          Add New Trainer
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <Input
          className="min-w-[450px] max-w-[450px]"
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          placeholder="Search by Trainer Name"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Full Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-end pr-28">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrainers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No Trainer Found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrainers?.map((trainer) => (
                <TableRow key={trainer.userId}>
                  <TableCell className="text-center">{trainer.firstName + " " + trainer.lastName}</TableCell>
                  <TableCell>{trainer.department ? trainer.department.name : "No Group Assigned"}</TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button onClick={() => setSelectedTrainer(trainer)} className="!bg-gray !text-black !border-lightGrey border-2">
                        Edit Details
                      </Button>
                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <Button
                            onClick={() => setUnassignTrainer({ userId: trainer.userId, openModal: true })}
                            disabled={!trainer.department}
                            className="!p-0"
                          >
                            <img src={unassign} alt="archive" />
                          </Button>

                          <div className="absolute  -left-48 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                            Remove Department Assignment
                          </div>
                        </div>
                        <div className="relative group">
                          <Button className="!p-0">
                            <img src={archiveIcon} alt="archive" />
                          </Button>

                          <div className="absolute  -left-24 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                            Archive Trainer
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* <div className="mt-5">
          <Pagination currentPage={page} totalPage={Math.ceil(trainers.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div> */}
      </div>

      {isAddTrainer && (
        <Dialog onOpenChange={() => setIsAddTrainer(false)} open={isAddTrainer}>
          <TrainerForm
            isSubmitting={editTrainer.isPending}
            groupOptions={groupOptions}
            close={() => setIsAddTrainer(false)}
            initalValues={{
              firstName: "",
              lastName: "",
              email: "",
              group: "",
              assignDepartment: false,
            }}
            onSubmit={(payload) => {
              const data = {
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                email: payload.email.trim(),
                departmentId: payload.group as string,
              };

              addTrainer.mutate(data, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["trainers"], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["departments"], exact: true });
                  ToastNotification.success("Added New Trainer");
                  setIsAddTrainer(false);
                },
                onError: (err) => {
                  ToastNotification.error(err.message);
                },
              });
            }}
          />
        </Dialog>
      )}

      {selectedTrainer && (
        <Dialog onOpenChange={() => setSelectedTrainer(null)} open={!!selectedTrainer}>
          <TrainerForm
            isSubmitting={editTrainer.isPending}
            groupOptions={groupOptions}
            close={() => setSelectedTrainer(null)}
            initalValues={{
              firstName: selectedTrainer.firstName,
              lastName: selectedTrainer.lastName,
              email: selectedTrainer.email,
              group: selectedTrainer.department?.departmentId as string,
              assignDepartment: false,
            }}
            onSubmit={(payload) => {
              const hasChanges =
                payload.firstName.trim() !== selectedTrainer.firstName.trim() ||
                payload.lastName.trim() !== selectedTrainer.lastName.trim() ||
                payload.email.trim() !== selectedTrainer.email.trim() ||
                payload.group !== selectedTrainer.department?.departmentId;

              if (!hasChanges) {
                ToastNotification.info("No Changes Detected");
                return;
              }

              const data = {
                userId: selectedTrainer.userId,
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                email: payload.email.trim(),
                departmentId: payload.group as string,
              };

              editTrainer.mutate(data, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["trainers"], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["departments"], exact: true });
                  ToastNotification.success("Updated Trainer Data");
                  setSelectedTrainer(null);
                },
                onError: (err) => {
                  ToastNotification.error(err.message);
                },
              });
            }}
          />
        </Dialog>
      )}

      {unassignTrainer.openModal && (
        <Dialog open={unassignTrainer.openModal} onOpenChange={() => setUnassignTrainer({ userId: "", openModal: false })}>
          <h1 className="text-center text-xl mt-5">Are you sure you want to unassign this trainer?</h1>

          <div className="flex items-center justify-end mt-5 gap-5 ">
            <Button disabled={removeTrainer.isPending} onClick={handleRemoveTrainerDepartment} className="!bg-green">
              Confirm
            </Button>
            <Button disabled={removeTrainer.isPending} className="!bg-red" onClick={() => setUnassignTrainer({ userId: "", openModal: false })}>
              Cancel
            </Button>
          </div>
        </Dialog>
      )}

      <Button className="fixed bottom-10 right-10 shadow-lg rounded-full !text-black">View Archived Trainers</Button>
    </ContentWrapper>
  );
};

export default Trainers;
