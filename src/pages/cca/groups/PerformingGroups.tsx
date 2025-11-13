import { useEffect, useMemo, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import {
  useAddDepartment,
  useAssingDepartmentTrainers,
  useDeleteDepartment,
  useEditDepartment,
  useGetDepartments,
} from "@/_lib/@react-client-query/department.ts";
import type { Department } from "@/types/department.ts";
import { useQueryClient } from "@tanstack/react-query";
import { getFileId } from "@/utils";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import InputField from "@/components/InputField";
import { Label } from "@/components/ui/label";
import AlertModal from "@/components/AlertModal";
import PaginatedTable from "@/components/PaginatedTable";
import { toast } from "sonner";
import { EditIcon, GroupIcon, Trash2Icon, UserRoundPenIcon } from "lucide-react";
import { useGetTrainers } from "@/_lib/@react-client-query/accounts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { MultiSelect } from "@/components/MultiSelect";
import Loading from "@/components/Loading";
import Error from "@/components/Error";
import { Client, Storage, ID } from "appwrite";

const PerformingGroups = () => {
  const { user } = useAuthContext();
  const addDepartment = useAddDepartment();
  const deleteDepartment = useDeleteDepartment();
  const editDepartment = useEditDepartment();
  const queryClient = useQueryClient();
  const userId = !user?.roles.includes("head") ? user?.userId : "";

  const { data: departments, isLoading: fetchingDepartments, isError: errorLoadingDepartments } = useGetDepartments(userId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addGroup, setAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Department | null>(null);

  const [newGroup, setNewGroup] = useState({ name: "", imagePreview: "", image: null as File | null });
  const [editGroup, setEditGroup] = useState({ name: "", imagePreview: "", image: null as File | null });

  const [errors, setErrors] = useState<{ name?: string; logo?: string }>();
  const [isAssignTrainer, setIsAssignTrainer] = useState<Department | null>(null);

  useEffect(() => {
    setEditGroup({ name: selectedGroup?.name as string, imagePreview: selectedGroup?.logoUrl as string, image: null as File | null });
  }, [selectedGroup]);

  useEffect(() => {
    document.title = `CCA Performing Groups`;
  }, []);

  const validateGroup = (group: typeof newGroup, isNew: boolean) => {
    const newErrors: typeof errors = {};
    const name = group.name?.trim() ?? "";
    let isValid = true;

    if (name.length === 0) {
      newErrors.name = "This field is required";
      isValid = false;
    } else if (name.length < 5) {
      newErrors.name = "Group name should be greater than 5";
      isValid = false;
    }

    if (isNew && !group.image) {
      newErrors.logo = "Please Upload Logo";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddDepartment = () => {
    if (!validateGroup(newGroup, true)) return;

    setIsSubmitting(true);

    const projectId = import.meta.env.VITE_APP_WRITE_PROJECT_ID;
    const bucketId = import.meta.env.VITE_APP_WRITE_BUCKET_ID;
    const endPoint = import.meta.env.VITE_APP_WRITE_ENDPOINT;
    const client = new Client().setEndpoint(endPoint).setProject(projectId);
    const storage = new Storage(client);

    toast.promise(
      (async () => {
        let imageUrl;

        if (newGroup.image) {
          const response = await storage.createFile({
            bucketId,
            fileId: ID.unique(),
            file: newGroup.image,
          });

          imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}&mode=admin`;

          if (!imageUrl) {
            throw new globalThis.Error("Failed to upload image, please try again later");
          }
        }

        return addDepartment.mutateAsync({
          name: newGroup.name,
          imageUrl: imageUrl as string,
        });
      })(),
      {
        position: "top-center",
        loading: "Adding group...",
        success: () => {
          queryClient.invalidateQueries({ exact: true, queryKey: ["departments"] });
          setAddGroup(false);
          setNewGroup({ name: "", imagePreview: "", image: null });
          setIsSubmitting(false);
          return "Group added";
        },
        error: (err: Error) => {
          setIsSubmitting(false);
          return err.message || "Failed to add group";
        },
      }
    );
  };

  const handleEditDepartment = () => {
    if (!validateGroup(editGroup, false)) return;

    if (editGroup.name.trim() === (selectedGroup?.name?.trim() ?? "") && !editGroup.image) {
      toast.info("No Changes Detected", { position: "top-center" });
      return;
    }

    setIsSubmitting(true);

    const projectId = import.meta.env.VITE_APP_WRITE_PROJECT_ID;
    const bucketId = import.meta.env.VITE_APP_WRITE_BUCKET_ID;
    const endPoint = import.meta.env.VITE_APP_WRITE_ENDPOINT;
    const client = new Client().setEndpoint(endPoint).setProject(projectId);
    const storage = new Storage(client);

    toast.promise(
      (async () => {
        let imageUrl;

        if (editGroup.image) {
          const response = await storage.createFile({
            bucketId,
            fileId: ID.unique(),
            file: editGroup.image,
          });

          imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}&mode=admin`;

          if (!imageUrl) {
            throw new globalThis.Error("Failed to upload new image, please try again later");
          }
        }

        return editDepartment.mutateAsync({
          departmentId: selectedGroup?.departmentId as string,
          name: editGroup.name,
          oldFileId: editGroup.image ? getFileId(selectedGroup?.logoUrl as string) ?? undefined : undefined,
          imageUrl,
        });
      })(),
      {
        position: "top-center",
        loading: "Updating group...",
        success: () => {
          queryClient.invalidateQueries({ exact: true, queryKey: ["departments"] });
          setSelectedGroup(null);
          setEditGroup({ name: "", imagePreview: "", image: null });
          setIsSubmitting(false);
          return "Group updated";
        },
        error: (err: Error) => {
          setIsSubmitting(false);
          return err.message || "Failed to update group";
        },
      }
    );
  };

  const handleDelete = (groupId: string) => {
    toast.promise(deleteDepartment.mutateAsync(groupId), {
      position: "top-center",
      loading: "Deleting group...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        return "Group deleted ";
      },
      error: (err) => err.message || "Failed to delete group",
    });
  };

  if (fetchingDepartments) {
    return <Loading />;
  }

  if (errorLoadingDepartments || !departments) {
    return <Error />;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Performing Groups</h1>

      {!user?.roles.includes("head") && user?.departments.length == 0 ? (
        <div>You are not currently assigned to any departmnet</div>
      ) : (
        <>
          <div className="flex justify-between mt-10">
            <SimpleCard icon={<GroupIcon size={18} />} label="Total Groups" value={departments?.length + ""} />

            {user?.roles.includes("head") && (
              <div className="flex items-end">
                <Button onClick={() => setAddGroup(true)}>Add New Group</Button>
              </div>
            )}
          </div>
          <div className="mt-10">
            <PaginatedTable
              className="min-w-[1000px]"
              itemsPerPage={10}
              data={departments}
              columns={[
                {
                  key: "name",
                  header: "Group Name",
                  render: (department) => (
                    <div className="flex items-center w-fit">
                      <img className="w-10 h-10" src={department.logoUrl} alt="logo" />
                      <p>{department.name}</p>
                    </div>
                  ),
                },
                {
                  key: "trainer",
                  header: "Trainers",
                  render: (department) => {
                    if (department.trainers.length === 0) return "";

                    return (
                      <div className="flex gap-2">
                        {department.trainers.map((trainer, index) => {
                          const isYou = trainer.trainerId === user?.userId;
                          const name = isYou ? `(You) ${trainer.trainerName}` : `${trainer.trainerName}`;

                          return (
                            <span key={trainer.trainerId} className={isYou ? "font-bold" : ""}>
                              {name}
                              {index < department.trainers.length - 1 ? ", " : ""}
                            </span>
                          );
                        })}
                      </div>
                    );
                  },
                },
                {
                  key: "total",
                  header: "Total Shows",
                  render: (department) => department.totalShows,
                },
                {
                  key: "members",
                  header: "Total Members",
                  render: (department) => department.totalMembers,
                },
                {
                  key: "action",
                  header: "Actions",
                  headerClassName: "text-right",
                  render: (department) => (
                    <div className="flex justify-end items-center gap-2">
                      <Link to={`/performing-groups/${department.departmentId}`}>
                        <Button>Manage Members</Button>
                      </Link>
                      <Button size="icon" onClick={() => setSelectedGroup(department)} variant="secondary">
                        <EditIcon />
                      </Button>

                      {user?.roles.includes("head") && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setIsAssignTrainer(department);
                            }}
                          >
                            <UserRoundPenIcon />
                          </Button>

                          <AlertModal
                            trigger={
                              <Button size="icon" disabled={department.totalShows !== 0 || department.totalMembers !== 0} variant="destructive">
                                <Trash2Icon />
                              </Button>
                            }
                            onConfirm={() => handleDelete(department.departmentId)}
                            title="Delete Performing Group"
                            description="This action cannot be undone. This will permanently delete the selected performing group."
                          />
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>{" "}
        </>
      )}

      {isAssignTrainer && (
        <Modal
          title={`Manage "${isAssignTrainer.name}" trainer`}
          onClose={() => {
            setIsAssignTrainer(null);
          }}
          isOpen={!!isAssignTrainer}
        >
          <AssignTrainer setIsAssignTrainer={setIsAssignTrainer} department={isAssignTrainer} />
        </Modal>
      )}

      {(addGroup || selectedGroup) && (
        <Modal
          title={addGroup ? "Add new Performing Group" : "Edit Performing Group"}
          onClose={() => {
            setErrors({});
            setAddGroup(false);
            setSelectedGroup(null);
          }}
          isOpen={addGroup || !!selectedGroup}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 mt-5">
              <Label>{addGroup ? "Group Logo" : "Edit Group Logo"}</Label>

              {(newGroup.imagePreview || editGroup.imagePreview) && (
                <div className="h-[200px] w-full border rounded border-lightGrey p-2">
                  <img
                    src={addGroup ? newGroup.imagePreview : editGroup.imagePreview}
                    alt="Preview"
                    className="object-contain object-center w-full h-full"
                  />
                </div>
              )}
              <Input
                disabled={addDepartment.isPending || editDepartment.isPending || isSubmitting}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      alert("Image must be less than 10MB.");
                      return;
                    }

                    const imageURL = URL.createObjectURL(file);

                    if (addGroup) {
                      setNewGroup((prev) => ({
                        ...prev,
                        imagePreview: imageURL,
                        image: file,
                      }));
                    } else {
                      setEditGroup((prev) => ({
                        ...prev,
                        imagePreview: imageURL,
                        image: file,
                      }));
                    }
                  }
                }}
              />
              {errors?.logo && <p className="text-sm text-red mt-1">{errors.logo}</p>}
            </div>

            <InputField
              disabled={addDepartment.isPending || editDepartment.isPending || isSubmitting}
              error={errors?.name}
              label={"Group Name"}
              value={addGroup ? newGroup.name : editGroup.name}
              onChange={
                addGroup
                  ? (e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                  : (e) => setEditGroup((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Button
              disabled={addDepartment.isPending || editDepartment.isPending || isSubmitting}
              onClick={addGroup ? handleAddDepartment : handleEditDepartment}
            >
              {addGroup ? "Add Group" : "Save Changes"}
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

const AssignTrainer = ({
  department,
  setIsAssignTrainer,
}: {
  department: Department;
  setIsAssignTrainer: (value: React.SetStateAction<Department | null>) => void;
}) => {
  const queryClient = useQueryClient();
  const assignTrainer = useAssingDepartmentTrainers();
  const { user } = useAuthContext();

  const { data: trainers, isLoading, isError } = useGetTrainers();
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>(department.trainers.map((t) => t.trainerId));
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!trainers) return [];
    return trainers.filter((trainer) => !trainer.isArchived);
  }, [trainers]);

  const trainerOptions = filtered.map((trainer) => ({
    label: `${trainer.firstName} ${trainer.lastName} ${
      trainer.departments.length > 0 ? `(${trainer.departments.map((t) => t.name)} trainer)` : "(No Group)"
    }`,
    value: trainer.userId,
  }));

  const trainersDropdown = useMemo(() => {
    if (!trainers) return [];

    return trainers
      .filter((t) => !t.isArchived)
      .map((t) => ({
        name: t.userId === user?.userId ? `(You) ${t.firstName} ${t.lastName}` : `${t.firstName} ${t.lastName}`,
        value: t.userId,
      }));
  }, [trainers, user]);

  if (isLoading) {
    return <h1>Loading Trainers...</h1>;
  }

  if (!trainers || isError) {
    return <h1>Failed to load list of trainers</h1>;
  }

  const handleSubmitAssign = () => {
    if (!selectedTrainers) {
      setError("Please Choose a Trainer to be assigned");
      return;
    }

    toast.promise(assignTrainer.mutateAsync({ trainers: selectedTrainers, departmentId: department.departmentId }), {
      position: "top-center",
      loading: "Assigning Trainer...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"], exact: true });
        queryClient.invalidateQueries({ queryKey: ["trainers"], exact: true });
        setIsAssignTrainer(null);
        return "Trainer Assigned";
      },
      error: (err) => err.message || "Failed to Assign Trainer",
    });
  };

  return (
    <>
      <div className="flex items-center mt-5">
        {trainersDropdown.length !== 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Select Trainers</CardTitle>
              <CardDescription>You can assign multiple trainers on this department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <MultiSelect
                  defaultValue={selectedTrainers}
                  placeholder="Select Trainers"
                  onValueChange={(trainers) => setSelectedTrainers(trainers)}
                  options={trainerOptions}
                />
                {error && <p className="text-red text-sm">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmitAssign}>Assign Trainer</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Available Trainers</CardTitle>
              <CardDescription>There are no trainer accounts or trainer accounts are archived</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
};

export default PerformingGroups;
