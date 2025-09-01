import { ContentWrapper } from "@/components/layout/Wrapper.tsx";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import archiveIcon from "../../../../assets/icons/archive.png";
import unassign from "../../../../assets/icons/unassign.png";

import { useEditTrainer, useGetTrainers, useNewTrainer } from "@/_lib/@react-client-query/accounts.ts";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";

import { useGetDepartments, useRemoveDepartmentTrainerByTrainerId } from "@/_lib/@react-client-query/department.ts";

import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import type { Trainer } from "@/types/user.ts";

import TrainerForm from "./TrainerForm";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Modal from "@/components/Modal";
import AlertModal from "@/components/AlertModal";

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

  useEffect(() => {
    setPage(1);
  }, [searchedTrainers]);

  const groupOptions = (departments ?? [])
    .filter((department) => !department.trainerId || !department.trainerName)
    .map((department) => ({ name: department.name, value: department.departmentId }));

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
    <ContentWrapper>
      <h1 className="text-3xl">Trainers</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Trainers" value={trainers?.length + ""} />
        <div className="flex items-end">
          <Button onClick={() => setIsAddTrainer(true)}>Add New Trainer</Button>
        </div>
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
              <TableHead>Full Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                  <TableCell>{trainer.firstName + " " + trainer.lastName}</TableCell>
                  <TableCell>{trainer.department ? trainer.department.name : "No Group Assigned"}</TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button onClick={() => setSelectedTrainer(trainer)} variant="outline">
                        Edit Details
                      </Button>
                      <div className="flex items-center gap-2">
                        <AlertModal
                          title="Remove Trainer Assignment"
                          description="This will remove the user as a trainer on its performing group"
                          onConfirm={handleRemoveTrainerDepartment}
                          trigger={
                            <Button
                              variant="ghost"
                              className="p-0"
                              onClick={() => setUnassignTrainer({ userId: trainer.userId, openModal: true })}
                              disabled={!trainer.department}
                            >
                              <img src={unassign} alt="" />
                            </Button>
                          }
                        />

                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant="ghost" className="p-0">
                              <img src={archiveIcon} alt="archive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent> Archive Trainer</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-5">
          <Pagination currentPage={page} totalPage={Math.ceil(trainers.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>

      {isAddTrainer && (
        <Modal title="Add new Trainer Account" onClose={() => setIsAddTrainer(false)} isOpen={isAddTrainer}>
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
        </Modal>
      )}

      {selectedTrainer && (
        <Modal title="Edit Trainer" onClose={() => setSelectedTrainer(null)} isOpen={!!selectedTrainer}>
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
        </Modal>
      )}

      <Button className="fixed bottom-10 right-10 shadow-lg rounded-full ">View Archived Trainers</Button>
    </ContentWrapper>
  );
};

export default Trainers;
