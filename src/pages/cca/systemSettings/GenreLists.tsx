import { useAddGenre, useDeleteGenre, useGetGenresWithShowCount, useUpdateGenre } from "@/_lib/@react-client-query/genre";
import AlertModal from "@/components/AlertModal";
import DialogPopup from "@/components/DialogPopup";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { CirclePlusIcon, EditIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GenreLists = () => {
  const queryClient = useQueryClient();
  const deleteGenre = useDeleteGenre();
  const { data: genres, isLoading, isError } = useGetGenresWithShowCount();

  if (isLoading) {
    return <h1>Loading..</h1>;
  }

  if (!genres || isError) {
    return <h1>Failed to load genres</h1>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <p>Manage List of Genre</p>

          <AddNewGenre />
        </CardTitle>
        <CardDescription>
          Use this section to manage the list of genres. You can add new ones, update existing names, or delete genres not in use by any show.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {genres.length === 0 ? (
          <div className="flex items-center justify-center">No Genres Yet</div>
        ) : (
          <>
            <Label>Total Genres: {genres.length}</Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-2 ">
              {genres.map((genre) => (
                <div className="border rounded-md shadow-sm p-2 " key={genre.genre}>
                  <p className="text-lg font-medium">{genre.genre}</p>
                  <p className="text-sm text-muted-foreground">Show count using this genre: {genre.showCount}</p>
                  <div className="flex justify-end mt-5 gap-2">
                    <EditGenre genre={genre.genre} />
                    <AlertModal
                      onConfirm={() => {
                        toast.promise(deleteGenre.mutateAsync(genre.genre), {
                          position: "top-center",
                          loading: "Deleting Genre...",
                          success: () => {
                            queryClient.setQueryData<{ genre: string; showCount: number }[]>(["genres", "count"], (oldData) => {
                              if (!oldData) return oldData;
                              return oldData.filter((g) => g.genre !== genre.genre);
                            });
                            return "Deleted";
                          },
                          error: (err) => err.message || "Failed to delete genre",
                        });
                      }}
                      title="Delete Genre"
                      description="This will permanently remove the selected genre from the system. You can only delete genres that are not currently assigned to any shows."
                      trigger={
                        <Button size="icon" disabled={genre.showCount > 0} variant="outline">
                          <Trash2Icon className="text-red" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const EditGenre = ({ genre }: { genre: string }) => {
  const queryClient = useQueryClient();
  const edit = useUpdateGenre();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState(genre);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!input || input.trim().length < 5) {
      setError("Genre Name must be greater than 5 characters");
      return;
    }

    toast.promise(edit.mutateAsync({ oldGenre: genre, newGenre: input }), {
      position: "top-center",
      success: () => {
        queryClient.setQueryData<{ genre: string; showCount: number }[]>(["genres", "count"], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((g) => (g.genre === genre ? { ...g, genre: input } : g));
        });
        setIsOpen(false);
        return "Updated";
      },
      error: (err) => err.message || "Failed to update genre",
      loading: "Updating...",
    });
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={`Change Name of Genre "${genre}"`}
      description="Rename this genre. This change will be reflected anywhere this genre is displayed."
      triggerElement={
        <Button size="icon" variant="outline">
          <EditIcon />
        </Button>
      }
    >
      <InputField disabled={edit.isPending} label="New Genre Name" value={input} error={error} onChange={(e) => setInput(e.target.value)} />
      <div className="flex justify-end gap-2 mt-5">
        <Button disabled={edit.isPending} variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button disabled={genre.trim().toLowerCase() === input.trim().toLowerCase() || edit.isPending} onClick={handleSubmit}>
          Edit
        </Button>
      </div>
    </DialogPopup>
  );
};

const AddNewGenre = () => {
  const queryClient = useQueryClient();
  const add = useAddGenre();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!input || input.trim().length < 5) {
      setError("Genre Name must be greater than 5 characters");
      return;
    }

    toast.promise(add.mutateAsync(input), {
      position: "top-center",
      success: () => {
        queryClient.setQueryData<{ genre: string; showCount: number }[]>(["genres", "count"], (oldData) => {
          if (!oldData) return oldData;
          return [...oldData, { genre: input, showCount: 0 }];
        });
        setIsOpen(false);
        setInput("");
        return "Added Genre";
      },
      error: (err) => err.message || "Failed to add genre",
      loading: "Adding Genre...",
    });
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={`Add a new Genre`}
      description="Create a new genre that can be assigned to shows. Make sure the name is unique and descriptive."
      triggerElement={
        <Button>
          <CirclePlusIcon />
          New Genre
        </Button>
      }
    >
      <InputField disabled={add.isPending} label="New Genre Name" value={input} error={error} onChange={(e) => setInput(e.target.value)} />
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button disabled={add.isPending} onClick={handleSubmit}>
          Add
        </Button>
      </div>
    </DialogPopup>
  );
};
export default GenreLists;
