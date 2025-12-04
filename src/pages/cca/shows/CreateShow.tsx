import ShowForm from "./ShowForm";
import { useAuthContext } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateShow } from "@/_lib/@react-client-query/show";
import type { ShowData } from "@/types/show";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContentWrapper } from "@/components/layout/Wrapper";
import Breadcrumbs from "@/components/BreadCrumbs";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Client, Storage, ID } from "appwrite";
import imageCompression from "browser-image-compression";

const CreateShow = () => {
  const [params] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const createShow = useCreateShow();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    document.title = `Create New Show`;
  }, [params]);

  return (
    <ContentWrapper className="mt-10">
      <Breadcrumbs backHref={`/shows`} items={[{ name: "Return to shows" }]} />
      <h1 className="text-3xl font-medium my-10">Create a New Show</h1>
      <ShowForm
        isLoading={createShow.isPending || isSubmitting}
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
                const compressedBlob = await imageCompression(data.image, {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1500,
                  useWebWorker: true,
                  fileType: "image/webp",
                });

                const compressedFile = new File([compressedBlob], data.image.name.replace(/\.[^/.]+$/, "") + ".webp", { type: compressedBlob.type });

                const response = await storage.createFile({
                  bucketId,
                  fileId: ID.unique(),
                  file: compressedFile,
                });

                imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}&mode=admin`;

                if (!imageUrl) {
                  throw new Error("Failed to upload image, please try again later");
                }
              }

              const created = await createShow.mutateAsync({
                showTitle: data.title.trim(),
                description: data.description.trim(),
                department: data.productionType === "majorProduction" ? "" : data.group,
                genre: data.genre.join(", "),
                createdBy: user?.userId as string,
                showType: data.productionType,
                imageUrl,
              });

              return created;
            })(),
            {
              loading: "Creating show...",
              position: "top-center",
              success: (created: ShowData) => {
                queryClient.invalidateQueries({ queryKey: ["shows"] });
                navigate(`/shows/add/schedule/${created.showId}`);
                toast.info("Please add a schedule for the created show", { position: "top-center" });
                setIsSubmitting(false);
                return "Show created successfully";
              },
              error: (err: Error) => {
                setIsSubmitting(false);
                return err.message || "Failed to create show";
              },
            }
          );
        }}
        formType="create"
        showFormValue={{
          title: "",
          productionType: "",
          description: "",
          genre: [],
          imageCover: "",
          group: "",
          showImagePreview: "",
          image: null,
        }}
      />
    </ContentWrapper>
  );
};

export default CreateShow;
