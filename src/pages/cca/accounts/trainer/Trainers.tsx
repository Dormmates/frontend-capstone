import { ContentWrapper } from "../../../../components/layout/Wrapper";
import SimpleCard from "../../../../components/ui/SimpleCard";

import Button from "../../../../components/ui/Button";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/Table";

import archiveIcon from "../../../../assets/icons/archive.png";
import { useGetTrainers, useNewTrainer } from "../../../../_lib/@react-client-query/accounts";
import TextInput from "../../../../components/ui/TextInput";
import { useMemo, useState } from "react";
import { useDebounce } from "../../../../hooks/useDeabounce";
import Modal from "../../../../components/ui/Modal";
import { useGetDepartments } from "../../../../_lib/@react-client-query/department";
import Dropdown from "../../../../components/ui/Dropdown";
import { isValidEmail } from "../../../../utils";
import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import type { Trainer } from "../../../../types/user";
import EditTrainer from "./EditTrainer";

const ITEMS_PER_PAGE = 5;

const Trainers = () => {
  const addTrainer = useNewTrainer();
  const queryClient = useQueryClient();

  const [isAddTrainer, setIsAddTrainer] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchValue);
  const { data: trainers, isLoading: loadingTrainers } = useGetTrainers();
  const { data: departments, isLoading: loadingDepartments } = useGetDepartments();

  const [newTrainer, setNewTrainer] = useState({ firstName: "", lastName: "", email: "", group: "" });
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; group?: string }>();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTrainer((prev) => ({ ...prev, [name]: value }));
  };

  const groupOptions = (departments ?? [])
    .filter((department) => !department.trainerId || !department.trainerName)
    .map((department) => ({ label: department.name, value: department.departmentId }));

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (newTrainer.firstName.trim().length < 1 || !newTrainer.firstName.trim()) {
      newErrors.firstName = "First Name should have value";
      isValid = false;
    }

    if (newTrainer.lastName.trim().length < 1 || !newTrainer.lastName.trim()) {
      newErrors.lastName = "Last Name should have value";
      isValid = false;
    }

    if (newTrainer.email.trim().length < 1 || !newTrainer.email.trim()) {
      newErrors.email = "Email should have value";
      isValid = false;
    }

    if (!isValidEmail(newTrainer.email.trim())) {
      newErrors.email = "Invalid Email Format";
      isValid = false;
    }

    if (!newTrainer.group) {
      newErrors.group = "Please Select a Group to assign this trainer";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      firstName: newTrainer.firstName,
      lastName: newTrainer.lastName,
      email: newTrainer.email,
      departmentId: newTrainer.group,
    };

    addTrainer.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["trainers"], exact: true });
        setNewTrainer({ firstName: "", lastName: "", email: "", group: "" });
        setIsAddTrainer(false);
        ToastNotification.success("Created Trainer");
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
        <TextInput
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
                      <div className="relative group">
                        <Button variant="plain">
                          <img src={archiveIcon} alt="archive" />
                        </Button>

                        <div className="absolute  -left-20 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                          Archive Trainer
                        </div>
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
        <Modal className="max-w-[800px] w-full" title="Add New Trainer Account" onClose={() => setIsAddTrainer(false)} isOpen={isAddTrainer}>
          <div className="border border-lightGrey rounded-md p-5 mt-5">
            <h1 className="text-lg">Basic Information</h1>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex gap-5">
                <TextInput
                  isError={!!errors?.firstName}
                  errorMessage={errors?.firstName}
                  disabled={addTrainer.isPending}
                  placeholder="eg. Juan"
                  name="firstName"
                  label="First Name"
                  value={newTrainer.firstName}
                  onChange={handleInputChange}
                />
                <TextInput
                  isError={!!errors?.lastName}
                  errorMessage={errors?.lastName}
                  disabled={addTrainer.isPending}
                  placeholder="eg. Dela Cruz"
                  name="lastName"
                  label="Last Name"
                  value={newTrainer.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex gap-5">
                <TextInput
                  isError={!!errors?.email}
                  errorMessage={errors?.email}
                  disabled={addTrainer.isPending}
                  type="email"
                  placeholder="eg. trainer@slu.edu.ph"
                  name="email"
                  label="SLU Email"
                  value={newTrainer.email}
                  onChange={handleInputChange}
                />
                <Dropdown
                  isError={!!errors?.group}
                  errorMessage={errors?.group}
                  disabled={addTrainer.isPending}
                  onChange={(value) => setNewTrainer((prev) => ({ ...prev, group: value }))}
                  className="w-full"
                  options={groupOptions}
                  value={newTrainer.group}
                  label="Performing Group"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5 gap-2">
            <Button onClick={handleSubmit} disabled={addTrainer.isPending} className="!bg-green">
              Create Account
            </Button>
            <Button
              disabled={addTrainer.isPending}
              onClick={() => {
                setIsAddTrainer(false);
                setNewTrainer({ firstName: "", lastName: "", email: "", group: "" });
              }}
              className="!bg-red"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {selectedTrainer && (
        <Modal className="max-w-[800px] w-full" title="Trainer Details" onClose={() => setSelectedTrainer(null)} isOpen={!!selectedTrainer}>
          <EditTrainer trainer={selectedTrainer} departments={departments} />
        </Modal>
      )}

      <Button className="fixed bottom-10 right-10 shadow-lg rounded-full !text-black">View Archived Trainers</Button>
    </ContentWrapper>
  );
};

export default Trainers;
