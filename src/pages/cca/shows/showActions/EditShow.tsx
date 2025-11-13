import { Client, Storage, ID } from "appwrite";
import ShowForm from "../ShowForm";
import type { ShowData } from "@/types/show";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateShow } from "@/_lib/@react-client-query/show";
import { getFileId } from "@/utils";
import DialogPopup from "@/components/DialogPopup";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { EditIcon } from "lucide-react";

type EditShowProps = {
  show: ShowData;
};

const EditShow = ({ show }: EditShowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const updateShow = useUpdateShow();

  return (
    <DialogPopup
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      triggerElement={
        <Button size="icon" variant="secondary">
          <EditIcon />
        </Button>
      }
      description="Edit show information and click save"
      title="Edit Show"
      className="max-w-[98%] w-full overflow-x-auto max-h-[90%] md:max-w-4xl"
    >
      <ShowForm
        showType={"group"}
        isLoading={updateShow.isPending || isSubmitting}
        onSubmit={async (data) => {
          setIsSubmitting(true);
          const projectId = import.meta.env.VITE_APP_WRITE_PROJECT_ID;
          const bucketId = import.meta.env.VITE_APP_WRITE_BUCKET_ID;
          const endPoint = import.meta.env.VITE_APP_WRITE_ENDPOINT;

          const client = new Client().setEndpoint(endPoint).setProject(projectId);
          const storage = new Storage(client);

          toast.promise(
            (async () => {
              let imageUrl;

              if (data.image) {
                const response = await storage.createFile({
                  bucketId,
                  fileId: ID.unique(),
                  file: data.image,
                });

                imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}&mode=admin`;

                if (!imageUrl) {
                  throw new Error("Failed to upload new image cover, please try again later");
                }
              }

              // Update the show after image upload
              const updated = await updateShow.mutateAsync({
                showId: show.showId as string,
                showTitle: data.title.trim(),
                description: data.description.trim(),
                department: data.group,
                genre: data.genre.join(", "),
                showType: data.productionType,
                oldFileId: data.image ? (getFileId(show?.showCover as string) as string) : undefined,
                imageUrl,
              });

              return updated;
            })(),
            {
              loading: "Updating show...",
              position: "top-center",
              success: () => {
                setIsOpen(false);
                setIsSubmitting(false);
                queryClient.invalidateQueries({ queryKey: ["shows"] });
                return "Show updated successfully";
              },
              error: (err: Error) => {
                setIsSubmitting(false);
                return err.message || "Failed to update show";
              },
            }
          );
        }}
        formType="edit"
        showFormValue={{
          title: show.title as string,
          productionType: show.showType,
          description: show.description as string,
          genre: show.genreNames as string[],
          imageCover: show.showCover as string,
          group: show.department ? (show.department.departmentId as string) : null,
          showImagePreview: show.showCover as string,
          image: null,
        }}
      />
    </DialogPopup>
  );
};

export default EditShow;
