import ShowForm from "./ShowForm";
import { useAuthContext } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateShow } from "@/_lib/@react-client-query/show";
import ToastNotification from "@/utils/toastNotification";
import type { ShowData } from "@/types/show";
import { useNavigate } from "react-router-dom";
import { ContentWrapper } from "@/components/layout/Wrapper";
import Breadcrumbs from "@/components/BreadCrumbs";

const CreateShow = () => {
  const queryClient = useQueryClient();
  const createShow = useCreateShow();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <ContentWrapper className="mt-10">
      <Breadcrumbs backHref="/shows" items={[{ name: "Return to shows" }]} />
      <h1 className="text-3xl font-medium my-10">Create a New Show</h1>
      <ShowForm
        isLoading={createShow.isPending}
        onSubmit={(data) => {
          ToastNotification.info("Creating new show");
          createShow.mutate(
            {
              showTitle: data.title,
              description: data.description,
              department: data.productionType == "majorProduction" ? null : data.group,
              genre: data.genre.join(", "),
              createdBy: user?.userId as string,
              showType: data.productionType,
              image: data.image as File,
            },
            {
              onSuccess: (data) => {
                queryClient.setQueryData<ShowData>(["show", data.showId], data);
                queryClient.setQueryData(["shows"], (oldData: ShowData[] | undefined) => {
                  if (!oldData) return oldData;
                  return oldData.map((show) => (show.showId === data.showId ? data : show));
                });
                navigate(`/shows/add/schedule/${data.showId}`);
                ToastNotification.success("Show created");
                ToastNotification.info("Please add a schedule for the created show", 5000);
                queryClient.setQueryData<ShowData>(["show", data.showId], data);
                queryClient.setQueryData(["shows"], (oldData: ShowData[] | undefined) => {
                  if (!oldData) return oldData;
                  return oldData.map((show) => (show.showId === data.showId ? data : show));
                });
              },
              onError: (err) => {
                ToastNotification.error(err.message);
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
