import ShowForm from "./ShowForm";
import { useAuthContext } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateShow } from "@/_lib/@react-client-query/show";
import type { ShowData } from "@/types/show";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContentWrapper } from "@/components/layout/Wrapper";
import Breadcrumbs from "@/components/BreadCrumbs";
import { toast } from "sonner";
import { useEffect } from "react";

const CreateShow = () => {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const createShow = useCreateShow();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const type = params.get("showType");

    if (!type || (type !== "group" && type !== "major")) {
      navigate("/shows", { replace: true });
    }

    if (!user?.roles.includes("head") && type === "major") {
      navigate("/shows", { replace: true });
    }
  }, [params, navigate]);

  useEffect(() => {
    document.title = `Create New Show - ${type?.toUpperCase()}`;
  }, [params]);

  const type = params.get("showType");

  return (
    <ContentWrapper className="mt-10">
      <Breadcrumbs backHref="/shows" items={[{ name: "Return to shows" }]} />
      <h1 className="text-3xl font-medium my-10">Create a New Show</h1>
      <ShowForm
        showType={type as "group" | "major"}
        isLoading={createShow.isPending}
        onSubmit={(data) => {
          toast.promise(
            createShow.mutateAsync({
              showTitle: data.title,
              description: data.description,
              department: data.productionType == "majorProduction" ? "" : data.group,
              genre: data.genre.join(", "),
              createdBy: user?.userId as string,
              showType: data.productionType,
              image: data.image as File,
            }),
            {
              position: "top-center",
              loading: "Creating show...",
              success: (data) => {
                queryClient.setQueryData<ShowData>(["show", data.showId], data);
                queryClient.setQueryData(["shows"], (oldData: ShowData[] | undefined) => {
                  if (!oldData) return oldData;
                  return oldData.map((show) => (show.showId === data.showId ? data : show));
                });

                navigate(`/shows/add/schedule/${data.showId}`);
                toast.info("Please add a schedule for the created show", { position: "top-center" });
                queryClient.invalidateQueries({ queryKey: ["shows"] });
                return "Show created";
              },
              error: (err) => err.message || "Failed to create show",
            }
          );
        }}
        formType="create"
        showFormValue={{
          title: "",
          productionType: type === "major" ? "majorProduction" : "",
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
