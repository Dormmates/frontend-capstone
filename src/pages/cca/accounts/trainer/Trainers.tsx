import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import unassign from "../../../../assets/icons/unassign.png";
import { useEditTrainer, useGetTrainers, useNewTrainer } from "@/_lib/@react-client-query/accounts.ts";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import { useGetDepartments, useRemoveDepartmentTrainerByTrainerId } from "@/_lib/@react-client-query/department.ts";
import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user.ts";
import TrainerForm from "./TrainerForm";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import AlertModal from "@/components/AlertModal";
import PaginatedTable from "@/components/PaginatedTable";
import ArchiveAccount from "../ArchiveAccount";
import DeleteAccount from "../DeleteAccount";
import UnArchiveAccount from "../UnArchiveAccount";
import { useAuthContext } from "@/context/AuthContext";

const Trainers = () => {
  const { user } = useAuthContext();
  const addTrainer = useNewTrainer();
  const editTrainer = useEditTrainer();
  const removeTrainer = useRemoveDepartmentTrainerByTrainerId();
  const queryClient = useQueryClient();

  const [isAddTrainer, setIsAddTrainer] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebounce(searchValue);
  const { data: trainers, isLoading: loadingTrainers } = useGetTrainers();
  const { data: departments, isLoading: loadingDepartments } = useGetDepartments();

  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [unassignTrainer, setUnassignTrainer] = useState({ userId: "", openModal: false });
  const [showArchived, setShowArchived] = useState(false);

  const activeTrainers = useMemo(() => {
    if (!trainers) return [];
    return trainers.filter((trainers) => !trainers.isArchived);
  }, [trainers]);

  const archivedTrainers = useMemo(() => {
    if (!trainers) return [];
    return trainers.filter((trainers) => trainers.isArchived);
  }, [trainers]);

  const searchedTrainers = useMemo(() => {
    if (!activeTrainers) return [];
    return activeTrainers.filter((trainer) => {
      const l = trainer.lastName.toLocaleLowerCase().trim();
      const f = trainer.firstName.toLocaleLowerCase().trim();
      const s = debouncedSearch.toLocaleLowerCase().trim();

      return l.includes(s) || f.includes(s) || (f + " " + l).includes(s);
    });
  }, [debouncedSearch, activeTrainers]);

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

      <div className="mt-10 flex flex-col">
        <Input
          className="min-w-[450px] max-w-[450px] mb-5"
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          placeholder="Search by Trainer Name"
        />

        <PaginatedTable
          data={searchedTrainers}
          columns={[
            {
              key: "name",
              header: "Full Name",
              render: (trainer) => (
                <span className={user?.userId === trainer.userId ? "font-bold" : ""}>
                  {user?.userId === trainer.userId ? "You: " : ""}
                  {trainer.firstName} {trainer.lastName}
                </span>
              ),
            },
            {
              key: "group",
              header: "Group",
              render: (trainer) => (trainer.department ? trainer.department.name : "No Group Assigned"),
            },
            {
              key: "email",
              header: "Email",
              render: (trainer) => trainer.email,
            },
            {
              key: "action",
              header: "Action",
              headerClassName: "text-right",
              render: (trainer) =>
                user?.userId === trainer.userId ? (
                  <p></p>
                ) : (
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
                            onClick={() =>
                              setUnassignTrainer({
                                userId: trainer.userId,
                                openModal: true,
                              })
                            }
                            disabled={!trainer.department}
                          >
                            <img src={unassign} alt="" />
                          </Button>
                        }
                      />
                      <ArchiveAccount user={trainer as User} queryKey="trainers" />
                      <DeleteAccount user={trainer as User} queryKey="trainers" />
                    </div>
                  </div>
                ),
            },
          ]}
        />
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

      {showArchived && (
        <Modal
          isOpen={showArchived}
          onClose={() => setShowArchived(false)}
          title="Archived Trainers"
          description="Archived Trainers can be  unarchived"
          className="max-w-5xl"
        >
          <div>
            <PaginatedTable
              data={archivedTrainers}
              columns={[
                {
                  key: "name",
                  header: "Full Name",
                  render: (trainer) => trainer.firstName + " " + trainer.lastName,
                },

                {
                  key: "group",
                  header: "Group",
                  render: (trainer) => (trainer.department ? trainer.department.name : "No Group Assigned"),
                },
                {
                  key: "email",
                  header: "Email",
                  render: (trainer) => trainer.email,
                },
                {
                  key: "action",
                  header: "Action",
                  headerClassName: "text-right",
                  render: (trainer) => (
                    <div className="flex justify-end items-center gap-2">
                      <UnArchiveAccount user={trainer as User} queryKey="trainers" />
                      <DeleteAccount user={trainer as User} queryKey="trainers" />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Modal>
      )}

      <Button onClick={() => setShowArchived(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full ">
        View Archived Trainers
      </Button>
    </ContentWrapper>
  );
};

export default Trainers;
