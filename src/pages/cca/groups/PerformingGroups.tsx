import { useEffect, useState } from "react";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import SimpleCard from "../../../components/ui/SimpleCard";
import { useAddDepartment, useDeleteDepartment, useEditDepartment, useGetDepartments } from "../../../_lib/@react-client-query/department";
import Button from "../../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import TextInput from "../../../components/ui/TextInput";
import type { Department } from "../../../types/department";
import { useQueryClient } from "@tanstack/react-query";
import ToastNotification from "../../../utils/toastNotification";

import deleteIcon from "../../../assets/icons/delete.png";
import InputLabel from "../../../components/ui/InputLabel";
import { getFileId } from "../../../utils";

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

  const [groupDeletion, setGroupDeletion] = useState({ confirm: false, departmentId: "" });

  useEffect(() => {
    setEditGroup({ name: selectedGroup?.name as string, imagePreview: selectedGroup?.logoUrl as string, image: null as File | null });
  }, [selectedGroup]);

  if (fetchingDepartments || errorLoadingDepartments) {
    return <h1>Loading</h1>;
  }

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

  const handleDelete = () => {
    deleteDepartment.mutate(groupDeletion.departmentId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        ToastNotification.success("Deleted Group");
        setGroupDeletion({ confirm: false, departmentId: "" });
      },
      onError: (er) => {
        ToastNotification.error(er.message);
      },
    });
  };

  return (
    <ContentWrapper className="lg:!p-20">
      <h1 className="text-3xl">Performing Groups</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Groups" value={departments?.length + ""} />

        <Button onClick={() => setAddGroup(true)} className="text-black self-end">
          Add New Group
        </Button>
      </div>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Total Shows</TableHead>
              <TableHead className="text-end pr-28">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No Groups found.
                </TableCell>
              </TableRow>
            ) : (
              departments?.map((department) => (
                <TableRow key={department.departmentId}>
                  <TableCell className="w-fit">
                    <div className="flex items-center w-fit">
                      <img className="w-10 h-10" src={department.logoUrl} alt="logo" />
                      <p>{department.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{department.trainerName ?? "No Trainer"}</TableCell>
                  <TableCell>{department.totalShows}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button onClick={() => setSelectedGroup(department)} className="!bg-gray !text-black !border-lightGrey border-2">
                        Edit Details
                      </Button>
                      <Button
                        onClick={() => setGroupDeletion({ departmentId: department.departmentId, confirm: true })}
                        disabled={department.totalShows !== 0}
                        variant="plain"
                      >
                        <img src={deleteIcon} alt="delete" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(addGroup || selectedGroup) && (
        <Modal
          onClose={() => {
            setErrors({});
            setAddGroup(false);
            setSelectedGroup(null);
          }}
          isOpen={addGroup || !!selectedGroup}
          title={selectedGroup ? "Edit Group Details" : "Add New Group"}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 mt-5">
              <InputLabel label={addGroup ? "Group Logo" : "Edit Group Logo"} />

              {(newGroup.imagePreview || editGroup.imagePreview) && (
                <div className="h-[200px] w-full border rounded border-lightGrey p-2">
                  <img
                    src={addGroup ? newGroup.imagePreview : editGroup.imagePreview}
                    alt="Preview"
                    className="object-contain object-center w-full h-full"
                  />
                </div>
              )}
              <input
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

            <TextInput
              disabled={addDepartment.isPending || editDepartment.isPending}
              isError={!!errors?.name}
              errorMessage={errors?.name}
              label={"Group Name"}
              value={addGroup ? newGroup.name : editGroup.name}
              onChange={
                addGroup
                  ? (e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                  : (e) => setEditGroup((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Button
              disabled={addDepartment.isPending || editDepartment.isPending}
              onClick={addGroup ? handleAddDepartment : handleEditDepartment}
              className="self-end !bg-green"
            >
              {addGroup ? "Add Group" : "Save Changes"}
            </Button>
          </div>
        </Modal>
      )}

      {groupDeletion.confirm && (
        <Modal onClose={() => setGroupDeletion({ confirm: false, departmentId: "" })} isOpen={groupDeletion.confirm} title="Delete Performing Group">
          <div className="flex flex-col mt-10 gap-10 text-lg">
            <h1 className="text-center ">Are you sure you want to delete this group?</h1>
            <Button disabled={deleteDepartment.isPending} onClick={handleDelete} className="!bg-green self-end">
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default PerformingGroups;
