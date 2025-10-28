import { useEffect, useMemo, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useEditDistributor, useGetDistributors, useNewDistributor } from "@/_lib/@react-client-query/accounts.ts";
import { distributorTypeOptions, type Distributor, type DistributorTypes, type User } from "@/types/user.ts";
import DistributorForm from "./DistributorForm";
import { useQueryClient } from "@tanstack/react-query";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import InputField from "@/components/InputField";
import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";
import ArchiveAccount from "../ArchiveAccount";
import UnArchiveAccount from "../UnArchiveAccount";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { EditIcon, Users } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import DeleteAccount from "../DeleteAccount";

const Distributors = () => {
  const { user } = useAuthContext();
  const addDistributor = useNewDistributor();
  const editDistributor = useEditDistributor();
  const queryClient = useQueryClient();

  const { data: distributors, isLoading: loadingDistributors, isError: errorDistributor } = useGetDistributors({ excludeCCA: true });

  const [isAddDistributor, setIsAddDistributor] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [selectedDistributors, setSelectedDistributors] = useState<Distributor[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [type, setType] = useState("all");

  const [searchValue, setSearchValue] = useState("");

  const activeDistributors = useMemo(() => {
    if (!distributors) return [];
    return distributors.filter((distributor) => !distributor.isArchived);
  }, [distributors]);

  const archivedDistributors = useMemo(() => {
    if (!distributors) return [];
    return distributors.filter((distributor) => distributor.isArchived);
  }, [distributors]);

  const searchedDistributors = useMemo(() => {
    if (!activeDistributors) return [];
    return activeDistributors.filter((distributor) => {
      const l = distributor.lastName.toLowerCase().trim();
      const f = distributor.firstName.toLowerCase().trim();
      const s = searchValue.toLowerCase().trim();
      const t = type === "all" || distributor.distributor.distributorType === type;

      return (l.includes(s) || f.includes(s) || (f + " " + l).includes(s)) && t;
    });
  }, [searchValue, activeDistributors, type]);

  useEffect(() => {
    document.title = `External Distributors`;
  }, []);

  if (loadingDistributors) {
    return <h1>Loaddingg..</h1>;
  }

  if (errorDistributor || !distributors) {
    return <h1>Error </h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Distributors</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard icon={<Users size={18} />} label="Total Distributors" value={searchedDistributors.length} />

        {(user?.departments.length !== 0 || user?.roles.includes("head")) && (
          <div className="self-end flex gap-2">
            <Button onClick={() => setIsAddDistributor(true)}>Add New Distributor</Button>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-5">
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
            items={[{ name: "All Distributor Type", value: "all" }, ...distributorTypeOptions.filter((d) => d.value !== "cca")]}
          />
        </div>

        {selectedDistributors.length !== 0 && (
          <div className="flex flex-col gap-2 m-0">
            <p className="text-sm font-medium">Selected Distributors: {selectedDistributors.length}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast.info("This feature will come soon", { position: "top-center" })}>
                Archive Selected Distributors
              </Button>
              <Button variant="secondary" onClick={() => toast.info("This feature will come soon", { position: "top-center" })}>
                Delete Selected Distributors
              </Button>
            </div>
          </div>
        )}

        <PaginatedTable
          onSelectionChange={(selectedDistributors) => {
            setSelectedDistributors(selectedDistributors);
          }}
          data={searchedDistributors}
          columns={[
            {
              key: "name",
              header: "Full Name",
              render: (distributor) => distributor.firstName + " " + distributor.lastName,
            },
            {
              key: "email",
              header: "Email",
              render: (distributor) => distributor.email,
            },
            {
              key: "contact",
              header: "Contact Number",
              render: (distributor) => distributor.distributor.contactNumber,
            },
            {
              key: "type",
              header: "Distributor Type",
              render: (distributor) => distributorTypeOptions.find((d) => d.value === distributor.distributor.distributorType)?.name,
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (distributor) => (
                <div className="flex justify-end items-center gap-2">
                  <Link to={`/manage/distributors/${distributor.userId}`}>
                    <Button variant="outline">View Distributor</Button>
                  </Link>

                  {(user?.roles.includes("head") || user?.departments.length !== 0) && (
                    <>
                      <Button onClick={() => setSelectedDistributor(distributor)} variant="outline">
                        <EditIcon />
                      </Button>
                      <ArchiveAccount queryKey="distributors" user={distributor as User} />
                      {/* <DeleteAccount queryKey="distributors" user={distributor as User} /> */}
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
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
              userId: "",
              firstName: "",
              lastName: "",
              email: "",
              contactNumber: "",
              type: "" as DistributorTypes,
              department: "",
            }}
            distributorTypeOptions={distributorTypeOptions.filter((t) => t.value !== "cca")}
            groupOptions={[]}
            isSubmitting={addDistributor.isPending}
            onSubmit={(payload) => {
              toast.promise(
                addDistributor.mutateAsync({
                  ...payload,
                  distributorType: payload.type,
                  departmentId: payload.department,
                }),
                {
                  position: "top-center",
                  loading: "Adding distributor...",
                  success: () => {
                    queryClient.invalidateQueries({ queryKey: ["distributors"], exact: true });
                    setIsAddDistributor(false);
                    return "Distributor Added";
                  },
                  error: (err) => err.message || "Failed to add distributor",
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
              userId: selectedDistributor.userId,
              firstName: selectedDistributor.firstName,
              lastName: selectedDistributor.lastName,
              email: selectedDistributor.email,
              contactNumber: selectedDistributor.distributor.contactNumber,
              type: selectedDistributor.distributor.distributorType,
              department: selectedDistributor.distributor.department?.departmentId || "",
            }}
            distributorTypeOptions={distributorTypeOptions.filter((t) => t.value !== "cca")}
            groupOptions={[]}
            onSubmit={(payload) => {
              const hasChanges =
                payload.firstName.trim() !== selectedDistributor.firstName.trim() ||
                payload.lastName.trim() !== selectedDistributor.lastName.trim() ||
                payload.email.trim() !== selectedDistributor.email.trim() ||
                payload.contactNumber.trim() !== selectedDistributor.distributor.contactNumber.trim() ||
                payload.type !== String(selectedDistributor.distributor.distributorType) ||
                (payload.department || null) !== (selectedDistributor.distributor.department?.departmentId || null);

              if (!hasChanges) {
                toast.info("No Changes Detected");
                return;
              }

              const data = {
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                email: payload.email.trim(),
                distributorType: payload.type,
                contactNumber: payload.contactNumber.trim(),
                departmentId: payload.department,
                userId: selectedDistributor.userId,
              };

              toast.promise(editDistributor.mutateAsync(data), {
                position: "top-center",
                loading: "Updating distributor...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["distributors"], exact: true });
                  setSelectedDistributor(null);
                  return "Distributor updated";
                },
                error: (err) => err.message || "Failed to update distributor",
              });
            }}
            onCancel={() => setSelectedDistributor(null)}
          />
        </Modal>
      )}

      {showArchived && (
        <Modal
          isOpen={showArchived}
          onClose={() => setShowArchived(false)}
          title="Archived Distributors"
          description="Archived distributors can be  unarchived"
          className="max-w-5xl"
        >
          <div>
            <PaginatedTable
              selectable
              data={archivedDistributors}
              columns={[
                {
                  key: "name",
                  header: "Full Name",
                  render: (distributor) => distributor.firstName + " " + distributor.lastName,
                },
                {
                  key: "email",
                  header: "Email",
                  render: (distributor) => distributor.email,
                },
                {
                  key: "contact",
                  header: "Contact Number",
                  render: (distributor) => distributor.distributor.contactNumber,
                },
                {
                  key: "type",
                  header: "Distributor Type",
                  render: (distributor) => distributor.distributor.distributorType,
                },
                {
                  key: "action",
                  header: "Actions",
                  headerClassName: "text-right",
                  render: (distributor) => (
                    <div className="flex justify-end items-center gap-2">
                      <UnArchiveAccount queryKey="distributors" user={distributor as User} />
                      <DeleteAccount queryKey="distributors" user={distributor as User} />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Modal>
      )}

      {(user?.departments.length !== 0 || user?.roles.includes("head")) && (
        <Button onClick={() => setShowArchived(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full ">
          View Archived Distributors
        </Button>
      )}
    </ContentWrapper>
  );
};

export default Distributors;
