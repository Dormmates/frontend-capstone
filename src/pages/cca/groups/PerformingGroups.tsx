import { useEffect, useState } from "react";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import SimpleCard from "../../../components/ui/SimpleCard";
import { useGetDepartments } from "../../../_lib/@react-client-query/department";
import Button from "../../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import TextInput from "../../../components/ui/TextInput";
import type { Department } from "../../../types/department";

const PerformingGroups = () => {
  const { data: departments, isLoading: fetchingDepartments, isError: errorLoadingDepartments } = useGetDepartments();
  const [addGroup, setAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Department | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    setNewGroupName(selectedGroup?.name || "");
  }, [selectedGroup]);

  if (fetchingDepartments || errorLoadingDepartments) {
    return <h1>Loading</h1>;
  }

  return (
    <ContentWrapper className="lg:!p-20">
      <h1 className="text-3xl">Performing Groups</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard label="Total Groups" value={5} />

        <Button onClick={() => setAddGroup(true)} className="text-black self-end">
          Add New Group
        </Button>
      </div>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Group Name</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Total Shows</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No Groups found.
                </TableCell>
              </TableRow>
            ) : (
              departments?.departments.map((department) => (
                <TableRow key={department.departmentId}>
                  <TableCell className="text-center">{department.name}</TableCell>
                  <TableCell>{department.trainerName ?? "No Trainer"}</TableCell>
                  <TableCell>{department.totalShows}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-start items-center gap-2">
                      <Button onClick={() => setSelectedGroup(department)} className="!bg-gray !text-black !border-lightGrey border-2">
                        Edit Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {addGroup && (
        <Modal onClose={() => setAddGroup(false)} isOpen={addGroup} title="Add New Group">
          <div className="flex flex-col gap-5">
            <TextInput className="mt-10" label={"Group Name"} value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
            <Button className="self-end !bg-green">Add Group</Button>
          </div>
        </Modal>
      )}

      {selectedGroup && (
        <Modal onClose={() => setSelectedGroup(null)} isOpen={!!selectedGroup} title="Edit Group Name">
          <div className="flex flex-col gap-5">
            <TextInput className="mt-10" label={"Group Name"} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            <Button
              disabled={selectedGroup.name.trim() === newGroupName.trim() || !newGroupName || newGroupName.length < 5}
              className="self-end !bg-green"
            >
              Save Changes
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default PerformingGroups;
