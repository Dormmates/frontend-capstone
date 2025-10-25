import { useGetCCAHeads, useRemoveCCAHeadRole } from "@/_lib/@react-client-query/accounts";
import AlertModal from "@/components/AlertModal";
import { ContentWrapper } from "@/components/layout/Wrapper";
import PaginatedTable from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDeabounce";
import { useEffect, useMemo, useState } from "react";
import ArchiveAccount from "../ArchiveAccount";
import type { User } from "@/types/user";
import SimpleCard from "@/components/SimpleCard";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import UnArchiveAccount from "../UnArchiveAccount";
import CreateCCAHead from "./CreateCCAHead";
import { UserRoundXIcon, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CCAHeads = () => {
  const queryClient = useQueryClient();
  const removeCCAHeadRole = useRemoveCCAHeadRole();
  const { user } = useAuthContext();
  const { data, isLoading, isError } = useGetCCAHeads();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [isAddHead, setIsAddHead] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeCCAHeads = useMemo(() => {
    if (!data) return [];
    return data.filter((head) => !head.isArchived);
  }, [data]);

  const archivedCCAHeads = useMemo(() => {
    if (!data) return [];
    return data.filter((head) => head.isArchived);
  }, [data]);

  const searchedTrainers = useMemo(() => {
    if (!activeCCAHeads) return [];
    return activeCCAHeads.filter((head) => {
      const l = head.lastName.toLocaleLowerCase().trim();
      const f = head.firstName.toLocaleLowerCase().trim();
      const s = debouncedSearch.toLocaleLowerCase().trim();

      return l.includes(s) || f.includes(s) || (f + " " + l).includes(s);
    });
  }, [debouncedSearch, activeCCAHeads]);

  useEffect(() => {
    document.title = `SLU CCA Heads`;
  }, []);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">CCA Heads</h1>

      <div className="flex justify-between mt-10">
        <SimpleCard icon={<Users size={18} />} label="Total Trainers" value={data?.length + ""} />
        <div className="flex items-end">
          <Button onClick={() => setIsAddHead(true)}>Add New CCA Head</Button>
        </div>
      </div>

      <div className="mt-10 flex flex-col">
        <Input
          className="min-w-[450px] max-w-[450px] mb-5"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder="Search by CCA Head Name"
        />

        <PaginatedTable
          data={searchedTrainers}
          columns={[
            {
              key: "name",
              header: "Full Name",
              render: (head) => (
                <span className={user?.userId === head.userId ? "font-bold" : ""}>
                  {user?.userId === head.userId ? "You: " : ""}
                  {head.firstName} {head.lastName}
                </span>
              ),
            },
            {
              key: "email",
              header: "Email",
              render: (head) => head.email,
            },
            {
              key: "action",
              header: "Action",
              headerClassName: "text-right",
              render: (head) =>
                user?.userId === head.userId ? (
                  <p></p>
                ) : (
                  <div className="flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2">
                      <ArchiveAccount user={head as User} queryKey="heads" />
                      <AlertModal
                        tooltip="Remove as CCA Head"
                        description={`This will remove this account from the list of CCA Heads and revoke its role privileges.`}
                        onConfirm={() => {
                          toast.promise(removeCCAHeadRole.mutateAsync(head.userId), {
                            position: "top-center",
                            loading: "Removing role...",
                            success: () => {
                              queryClient.setQueryData<User[]>(["heads"], (oldData) => {
                                if (!oldData) return oldData;
                                return oldData.filter((h) => h.userId !== head.userId);
                              });
                              return "Role removed";
                            },
                            error: (err) => err.message || "Failed to remove role",
                          });
                        }}
                        title={`Remove "${head.firstName} ${head.lastName}" as CCA Head`}
                        trigger={
                          <Button variant="outline" className="h-7 w-7 p-2 rounded-full flex items-center justify-center">
                            <UserRoundXIcon />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ),
            },
          ]}
        />
      </div>

      {isAddHead && (
        <Modal
          title="Create new CCA Head"
          description="You can either create new CCA Head account or make existing trainer to be CCA Head"
          isOpen={isAddHead}
          onClose={() => setIsAddHead(false)}
        >
          <CreateCCAHead closeModal={() => setIsAddHead(false)} />
        </Modal>
      )}

      {showArchived && (
        <Modal
          isOpen={showArchived}
          onClose={() => setShowArchived(false)}
          title="Archived Heads"
          description="Archived Heads can be  unarchived"
          className="max-w-5xl"
        >
          <div>
            <PaginatedTable
              data={archivedCCAHeads}
              columns={[
                {
                  key: "name",
                  header: "Full Name",
                  render: (head) => head.firstName + " " + head.lastName,
                },

                {
                  key: "email",
                  header: "Email",
                  render: (head) => head.email,
                },
                {
                  key: "action",
                  header: "Action",
                  headerClassName: "text-right",
                  render: (trainer) => (
                    <div className="flex justify-end items-center gap-2">
                      <UnArchiveAccount user={trainer as User} queryKey="heads" />
                      {/* <DeleteAccount user={trainer as User} queryKey="heads" /> */}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Modal>
      )}

      <Button onClick={() => setShowArchived(true)} className="fixed bottom-10 right-10 shadow-lg rounded-full ">
        View Archived Heads
      </Button>
    </ContentWrapper>
  );
};

export default CCAHeads;
