import { useEffect, useMemo, useState } from "react";
import { ContentWrapper } from "../../../../components/layout/Wrapper";
import { useDebounce } from "../../../../hooks/useDeabounce";
import { useEditDistributor, useGetDistributors, useGetDistributorTypes, useNewDistributor } from "../../../../_lib/@react-client-query/accounts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import archiveIcon from "../../../../assets/icons/archive.png";
import type { Distributor } from "../../../../types/user";
import DistributorForm from "./DistributorForm";
import { useGetDepartments } from "../../../../_lib/@react-client-query/department";
import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import Pagination from "@/components/Pagination";
import InputField from "@/components/InputField";
import Modal from "@/components/Modal";

const ITEMS_PER_PAGE = 5;

const Distributors = () => {
  const addDistributor = useNewDistributor();
  const editDistributor = useEditDistributor();
  const queryClient = useQueryClient();

  const { data: distributors, isLoading: loadingDistributors, isError: errorDistributor } = useGetDistributors();
  const { data: distributorTypes, isLoading: loadingTypes, isError: errorTypes } = useGetDistributorTypes();
  const { data: departments, isLoading: loadingDepartments, isError: errorDeparments } = useGetDepartments();

  const [isAddDistributor, setIsAddDistributor] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [type, setType] = useState("all");

  const distributorTypeOptions = (distributorTypes ?? []).map((type) => ({ name: type.name, value: String(type.id) }));
  const groupOptions = (departments ?? []).map((department) => ({ name: department.name, value: department.departmentId }));

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  const searchedDistributors = useMemo(() => {
    if (!distributors) return [];
    return distributors
      .filter((distributor) => !distributor.isArchived)
      .filter((distributor) => {
        const l = distributor.lastName.toLocaleLowerCase().trim();
        const f = distributor.firstName.toLocaleLowerCase().trim();
        const s = searchValue.toLocaleLowerCase().trim();

        return l.includes(s) || f.includes(s) || (f + " " + l).includes(s);
      })
      .filter((distributor) => !type || type === "all" || Number(type) === distributor.distributor.distributortypes.id);
  }, [debouncedSearch, distributors, type]);

  const paginatedDistributors = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return searchedDistributors.slice(start, end);
  }, [searchedDistributors, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type]);

  if (loadingDistributors || loadingTypes || loadingDepartments) {
    return <h1>Loaddingg..</h1>;
  }

  if (errorDistributor || !distributors || !distributorTypes || errorDeparments || errorTypes) {
    return <h1>Error </h1>;
  }

  return (
    <ContentWrapper className="lg:!p-20">
      <h1 className="text-3xl">Distributors</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Distributors" value={searchedDistributors.length} />
        <div className="self-end flex gap-2">
          <Button>Bulk Creation</Button>
          <Button onClick={() => setIsAddDistributor(true)}>Add New Distributor</Button>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <div className="flex gap-3">
          <InputField
            className="w-full"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            placeholder="Search by Distributor Name"
          />
          <Dropdown
            className="max-w-fit"
            placeholder="Distributor Type"
            label="Distributor Type"
            value={type}
            onChange={(value) => setType(value)}
            items={[{ name: "All Distributor Type", value: "all" }, ...distributorTypeOptions]}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Distributor Type</TableHead>
              <TableHead>Performing Group</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDistributors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  No Distributor Found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDistributors?.map((distributor) => (
                <TableRow key={distributor.userId}>
                  <TableCell>{distributor.firstName + " " + distributor.lastName}</TableCell>
                  <TableCell>{distributor.email}</TableCell>
                  <TableCell>{distributor.distributor.contactNumber}</TableCell>
                  <TableCell>{distributor.distributor.distributortypes.name}</TableCell>
                  <TableCell>{distributor.distributor.department?.name ?? "No Department"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="secondary">View Distributor</Button>
                      <Button onClick={() => setSelectedDistributor(distributor)} variant="outline">
                        Edit Details
                      </Button>
                      <div className="relative group">
                        <Button variant="ghost" className="!p-0">
                          <img src={archiveIcon} alt="archive" />
                        </Button>

                        <div className="absolute  -left-24 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                          Archive Distributor
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
          <Pagination currentPage={page} totalPage={Math.ceil(distributors.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>

      {isAddDistributor && (
        <Modal
          description="Input Distributor details and click save."
          className="max-w-3xl"
          title="Add New Distributor"
          isOpen={isAddDistributor}
          onClose={() => setIsAddDistributor(false)}
        >
          <DistributorForm
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              contactNumber: "",
              type: "",
              department: "",
            }}
            distributorTypeOptions={distributorTypeOptions}
            groupOptions={groupOptions}
            isSubmitting={addDistributor.isPending}
            onSubmit={(payload) => {
              addDistributor.mutate(
                {
                  ...payload,
                  distributorType: Number(payload.type),
                  departmentId: payload.department,
                },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["distributors"], exact: true });
                    ToastNotification.success("Distributor Added");
                    setIsAddDistributor(false);
                  },
                  onError: (err) => {
                    ToastNotification.error(err.message);
                  },
                }
              );
            }}
            onCancel={() => setIsAddDistributor(false)}
          />
        </Modal>
      )}

      {selectedDistributor && (
        <Modal
          description="Edit distributor details and click save"
          className="max-w-3xl"
          title="Edit Distributor Details"
          isOpen={!!selectedDistributor}
          onClose={() => setSelectedDistributor(null)}
        >
          <DistributorForm
            isSubmitting={editDistributor.isPending}
            initialValues={{
              firstName: selectedDistributor.firstName,
              lastName: selectedDistributor.lastName,
              email: selectedDistributor.email,
              contactNumber: selectedDistributor.distributor.contactNumber,
              type: String(selectedDistributor.distributor.distributortypes.id),
              department: selectedDistributor.distributor.department?.departmentId || "",
            }}
            distributorTypeOptions={distributorTypeOptions}
            groupOptions={groupOptions}
            onSubmit={(payload) => {
              const hasChanges =
                payload.firstName.trim() !== selectedDistributor.firstName.trim() ||
                payload.lastName.trim() !== selectedDistributor.lastName.trim() ||
                payload.email.trim() !== selectedDistributor.email.trim() ||
                payload.contactNumber.trim() !== selectedDistributor.distributor.contactNumber.trim() ||
                payload.type !== String(selectedDistributor.distributor.distributortypes.id) ||
                (payload.department || null) !== (selectedDistributor.distributor.department?.departmentId || null);

              if (!hasChanges) {
                ToastNotification.info("No Changes Detected");
                return;
              }

              const data = {
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                email: payload.email.trim(),
                distributorType: Number(payload.type),
                contactNumber: payload.contactNumber.trim(),
                departmentId: payload.department,
                userId: selectedDistributor.userId,
              };

              editDistributor.mutate(data, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["distributors"], exact: true });
                  ToastNotification.success("Edited Distributor");
                  setSelectedDistributor(null);
                },
                onError: (err) => {
                  ToastNotification.error(err.message);
                },
              });
            }}
            onCancel={() => setSelectedDistributor(null)}
          />
        </Modal>
      )}

      <Button className="fixed bottom-10 right-10 shadow-lg rounded-full ">View Archived Distributors</Button>
    </ContentWrapper>
  );
};

export default Distributors;
