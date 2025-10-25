import { useEditDistributor, useGetDistributors, useNewDistributor } from "@/_lib/@react-client-query/accounts";
import { useAuthContext } from "@/context/AuthContext";
import { distributorTypeOptions, type Distributor, type User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDeabounce";
import { ContentWrapper } from "@/components/layout/Wrapper";
import { EditIcon, MailIcon, PhoneIcon, Users } from "lucide-react";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import BulkDistributorCreation from "./BulkDistributorCreation";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import PaginatedTable from "@/components/PaginatedTable";
import ArchiveAccount from "../accounts/ArchiveAccount";
import Modal from "@/components/Modal";
import DistributorForm from "../accounts/distributors/DistributorForm";
import SimpleCard from "@/components/SimpleCard";
import { useGetDepartments } from "@/_lib/@react-client-query/department";
import UnArchiveAccount from "../accounts/UnArchiveAccount";
import Breadcrumbs from "@/components/BreadCrumbs";
import NotFound from "@/components/NotFound";

const ViewPerformingGroups = () => {
  const addDistributor = useNewDistributor();
  const editDistributor = useEditDistributor();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { groupId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.roles.includes("head") && user?.departments.length === 0) {
      navigate("/");
    }
  }, [navigate, user]);

  const { data: distributors, isLoading: loadingDistributors, isError: errorDistributor } = useGetDistributors({ departmentId: groupId as string });
  const { data: departments, isLoading: loadingDepartments, isError: errorDeparments } = useGetDepartments();

  const [isAddDistributor, setIsAddDistributor] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const canOpenDialog = user?.departments.length !== 0 || user?.roles?.includes("head");
  const [pendingBulkCreation, setIsPendingBulkCreation] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue);

  const activeDistributors = useMemo(() => {
    if (!distributors) return [];
    return distributors.filter((distributor) => !distributor.isArchived);
  }, [distributors]);

  const archivedDistributors = useMemo(() => {
    if (!distributors) return [];
    return distributors.filter((distributor) => distributor.isArchived);
  }, [distributors]);

  const letters = useMemo(() => {
    if (!distributors) return [];
    return [...new Set(activeDistributors.map((d) => d.lastName.charAt(0).toUpperCase()))].sort();
  }, [activeDistributors]);

  const filteredDistributors = useMemo(() => {
    if (selectedLetter == "All") return activeDistributors;
    return activeDistributors.filter((d) => d.lastName.charAt(0) == selectedLetter);
  }, [selectedLetter, activeDistributors]);

  const searchedDistributors = useMemo(() => {
    if (!filteredDistributors) return [];
    return filteredDistributors.filter((distributor) => {
      const l = distributor.lastName.toLocaleLowerCase().trim();
      const f = distributor.firstName.toLocaleLowerCase().trim();
      const s = searchValue.toLocaleLowerCase().trim();

      return l.includes(s) || f.includes(s) || (f + " " + l).includes(s);
    });
  }, [debouncedSearch, filteredDistributors]);

  const groupOptions = useMemo(() => {
    if (!departments || !user) return [];

    if (user.roles.includes("head")) {
      return departments.map((department) => ({
        name: department.name,
        value: department.departmentId,
      }));
    }

    // if (user.department) {
    //   return [
    //     {
    //       name: user.department.name,
    //       value: user.department.departmentId,
    //     },
    //   ];
    // }

    return [];
  }, [departments, user]);

  useEffect(() => {
    document.title = `${groupOptions.find((t) => t.value === groupId)?.name ?? "Performing Group"} Members`;
  }, [groupOptions]);

  if (loadingDistributors || loadingDepartments) {
    return <h1>Loaddingg..</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">{groupOptions.find((t) => t.value === groupId)?.name ?? "Performing Group"} Members</h1>

      <div className="my-10">
        <Breadcrumbs
          backHref="/performing-groups"
          items={[
            { name: "Performing Groups", href: "/performing-groups" },
            { name: (groupOptions.find((t) => t.value === groupId)?.name as string) ?? "Performing Group" },
          ]}
        />
      </div>

      {errorDistributor || !distributors || errorDeparments ? (
        <NotFound title="Performing Group Not Found" description="This Performing Group does not exist or have been deleted already" />
      ) : (
        <>
          <div className="flex justify-between mt-10">
            <SimpleCard icon={<Users size={18} />} label="Total Members" value={activeDistributors.length} />

            {canOpenDialog && (
              <div className="self-end flex gap-2">
                <DialogPopup
                  isOpen={isOpen}
                  setIsOpen={(value) => {
                    if (pendingBulkCreation) {
                      return;
                    }

                    setIsOpen(value);
                  }}
                  className="w-[98%] lg:w-full max-w-5xl max-h-[90%]"
                  description={
                    <>
                      <p>
                        This option is <strong>only for CCA Member Distributor</strong> accounts. All accounts created using this feature will be
                        assigned as <strong>CCA Member type</strong>.
                      </p>

                      <p>
                        <strong>Instructions:</strong>
                      </p>
                      <ul className="list-decimal pl-5 space-y-1">
                        <li>Choose a CSV or Excel file to upload.</li>
                        <li>
                          The file should contain exactly <strong>4 columns</strong>:
                          <br />
                          (firstname, lastname, email, contactNumber)
                        </li>
                      </ul>
                    </>
                  }
                  title="Bulk Distributor Account Creation"
                  triggerElement={<Button variant="secondary">Bulk Member Creation</Button>}
                >
                  <BulkDistributorCreation setIsPendingBulkCreation={setIsPendingBulkCreation} group={groupId as string} />
                </DialogPopup>

                <Button onClick={() => setIsAddDistributor(true)}>Add New Member</Button>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-5">
            <div className="flex gap-3">
              <InputField className="w-full" onChange={(e) => setSearchValue(e.target.value)} value={searchValue} placeholder="Search by  Name" />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant={selectedLetter === "All" ? "default" : "outline"} size="sm" onClick={() => setSelectedLetter("All")}>
                All
              </Button>

              {letters.map((letter) => (
                <Button key={letter} variant={selectedLetter === letter ? "default" : "outline"} size="sm" onClick={() => setSelectedLetter(letter)}>
                  {letter}
                </Button>
              ))}
            </div>

            <p className="text-sm">Total : {searchedDistributors.length}</p>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {searchedDistributors.map((distributor) => {
                return (
                  <div
                    onClick={() => navigate(`/manage/distributors/${distributor.userId}`)}
                    className={`p-5 border rounded-md shadow-sm font-medium cursor-pointer hover:shadow-xl `}
                    key={distributor.userId}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-2xl mb-2 break-words">
                        {distributor.lastName}, {distributor.firstName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground font-semibold text-sm">
                      <MailIcon className="w-4 h-4" />
                      <p>{distributor.email}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground font-semibold text-sm">
                      <PhoneIcon className="w-4 h-4" />
                      <p>{distributor.distributor.contactNumber}</p>
                    </div>

                    <div className="flex justify-start items-center gap-2 mt-5 flex-wrap">
                      {(user?.roles.includes("head") || user?.departments.length !== 0) && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDistributor(distributor);
                            }}
                          >
                            <EditIcon />
                          </Button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ArchiveAccount queryKey="distributors" user={distributor as User} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
              type: "cca",
              department: groupId as string,
            }}
            distributorTypeOptions={distributorTypeOptions.filter((t) => t.value === "cca")}
            groupOptions={groupOptions.filter((g) => g.value === groupId)}
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
                    queryClient.invalidateQueries({ queryKey: ["distributors", groupId], exact: true });
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
              firstName: selectedDistributor.firstName,
              lastName: selectedDistributor.lastName,
              email: selectedDistributor.email,
              contactNumber: selectedDistributor.distributor.contactNumber,
              type: selectedDistributor.distributor.distributorType,
              department: selectedDistributor.distributor.department?.departmentId || "",
            }}
            distributorTypeOptions={distributorTypeOptions.filter((t) => t.value === "cca")}
            groupOptions={groupOptions.filter((g) => g.value === groupId)}
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
                  queryClient.invalidateQueries({ queryKey: ["distributors", groupId], exact: true });
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
                  render: (distributor) => distributor.lastName + ", " + distributor.firstName,
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
                  render: () => "CCA Member",
                },
                {
                  key: "group",
                  header: "Performing Group",
                  render: (distributor) => distributor.distributor.department?.name ?? "No Department",
                },
                {
                  key: "action",
                  header: "Actions",
                  headerClassName: "text-right",
                  render: (distributor) => (
                    <div className="flex justify-end items-center gap-2">
                      <UnArchiveAccount queryKey="distributors" user={distributor as User} />
                      {/* <DeleteAccount queryKey="distributors" user={distributor as User} /> */}
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
          View Archived Members
        </Button>
      )}
    </ContentWrapper>
  );
};

export default ViewPerformingGroups;
