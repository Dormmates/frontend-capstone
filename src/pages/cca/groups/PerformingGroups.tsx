import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useAddDepartment, useDeleteDepartment, useEditDepartment, useGetDepartments } from "@/_lib/@react-client-query/department.ts";
import type { Department } from "@/types/department.ts";
import { useQueryClient } from "@tanstack/react-query";
import ToastNotification from "../../../utils/toastNotification";
import deleteIcon from "../../../assets/icons/delete.png";
import { getFileId } from "@/utils";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import InputField from "@/components/InputField";
import { Label } from "@/components/ui/label";
import AlertModal from "@/components/AlertModal";
import PaginatedTable from "@/components/PaginatedTable";

const PerformingGroups = () => {
  const addDepartment = useAddDepartment();
  const deleteDepartment = useDeleteDepartment();
  const editDepartment = useEditDepartment();
  const queryClient = useQueryClient();
  const { data: departments, isLoading: fetchingDepartments, isError: errorLoadingDepartments } = useGetDepartments();
  const [addGroup, setAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Department | null>(null);

  const [newGroup, setNewGroup] = useState({ name: "", imagePreview: "", image: null as File | null });
  const [editGroup, setEditGroup] = useState({ name: "", imagePreview: "", image: null as File | null });

  const [errors, setErrors] = useState<{ name?: string; logo?: string }>();

  useEffect(() => {
    setEditGroup({ name: selectedGroup?.name as string, imagePreview: selectedGroup?.logoUrl as string, image: null as File | null });
  }, [selectedGroup]);

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

    ToastNotification.info("Adding Group");

    addDepartment.mutate(
      { name: newGroup.name, image: newGroup.image as File },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ exact: true, queryKey: ["departments"] });
          setAddGroup(false);
          ToastNotification.success("Added Group");
          setNewGroup({ name: "", imagePreview: "", image: null });
        },
        onError: (er) => {
          ToastNotification.error(er.message);
        },
      }
    );
  };

  const handleEditDepartment = () => {
    if (!validateGroup(editGroup, false)) return;

    if (editGroup.name.trim() === (selectedGroup?.name?.trim() ?? "") && !editGroup.image) {
      ToastNotification.info("No Changes Detected");
      return;
    }

    ToastNotification.info("Editing Group");
    const payload: {
      departmentId: string;
      name: string;
      image?: File;
      oldFileId?: string;
    } = {
      departmentId: selectedGroup?.departmentId as string,
      name: editGroup.name,
      image: editGroup.image ?? undefined,
      oldFileId: editGroup.image ? (getFileId(selectedGroup?.logoUrl as string) as string) : undefined,
    };

    editDepartment.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ exact: true, queryKey: ["departments"] });
        setSelectedGroup(null);
        ToastNotification.success("Edited Group");
        setEditGroup({ name: "", imagePreview: "", image: null });
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  const handleDelete = (groupId: string) => {
    deleteDepartment.mutate(groupId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        ToastNotification.success("Deleted Group");
      },
      onError: (er) => {
        ToastNotification.error(er.message);
      },
    });
  };

  if (fetchingDepartments) {
    return <h1>Loading</h1>;
  }

  if (errorLoadingDepartments || !departments) {
    return <h1>Error Loading</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Performing Groups</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Groups" value={departments?.length + ""} />

        <div className="flex items-end">
          <Button onClick={() => setAddGroup(true)}>Add New Group</Button>
        </div>
      </div>

      <div className="mt-10">
        <PaginatedTable
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
              header: "Trainer name",
              render: (department) => department.trainerName ?? "No Trainer",
            },
            {
              key: "total",
              header: "Total Shows",
              render: (department) => department.totalShows,
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (department) => (
                <div className="flex justify-end items-center gap-2">
                  <Button onClick={() => setSelectedGroup(department)} variant="outline">
                    Edit Details
                  </Button>

                  <AlertModal
                    trigger={
                      <Button disabled={department.totalShows !== 0} variant="ghost">
                        <img src={deleteIcon} alt="delete" />
                      </Button>
                    }
                    onConfirm={() => handleDelete(department.departmentId)}
                    title="Delete Performing Group"
                    description="This action cannot be undone. This will permanently delete the selected performing group."
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

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
                disabled={addDepartment.isPending || editDepartment.isPending}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 1024 * 1024) {
                      alert("Image must be less than 1MB.");
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
              disabled={addDepartment.isPending || editDepartment.isPending}
              error={errors?.name}
              label={"Group Name"}
              value={addGroup ? newGroup.name : editGroup.name}
              onChange={
                addGroup
                  ? (e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                  : (e) => setEditGroup((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Button disabled={addDepartment.isPending || editDepartment.isPending} onClick={addGroup ? handleAddDepartment : handleEditDepartment}>
              {addGroup ? "Add Group" : "Save Changes"}
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default PerformingGroups;
