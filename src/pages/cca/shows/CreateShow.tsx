import React, { useState } from "react";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import TextInput, { TextArea } from "../../../components/ui/TextInput";
import Dropdown from "../../../components/ui/Dropdown";
import Button from "../../../components/ui/Button";
import InputLabel from "../../../components/ui/InputLabel";
import { useAuthContext } from "../../../context/AuthContext";
import { useCreateShow } from "../../../_lib/@react-client-query/show";
import Modal from "../../../components/ui/Modal";

import ToastNotification from "../../../utils/toastNotification";
import { useGetDepartments } from "../../../_lib/@react-client-query/department";
import { useNavigate } from "react-router-dom";
import { useGetGenres } from "../../../_lib/@react-client-query/genre";
import { useQueryClient } from "@tanstack/react-query";
import type { ShowData } from "../../../types/show";

const productionType = [
  { label: "Showcase", value: "showCase" },
  { label: "Major Concert", value: "majorConcert" },
];

const CreateShow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { data: groups, isLoading: loadingDepartments, error: errorDepartment } = useGetDepartments();
  const navigate = useNavigate();
  const { data: genres, isLoading: loadingGenres, error: errorGenres } = useGetGenres();

  const createShow = useCreateShow();
  const [errors, setErrors] = useState<{
    title?: string;
    productionType?: string;
    description?: string;
    genre?: string;
    imageCover?: string;
    group?: string;
  }>({});

  const [showData, setShowData] = useState({
    title: "",
    group: user?.department?.departmentId || "",
    productionType: "",
    description: "",
    genre: [] as string[],
    showImagePreview: "",
    image: null as File | null,
  });

  const [showCreationSummary, setShowCreationSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!showData.title) {
      newErrors.title = "Please input title";
    } else if (showData.title.length < 5) {
      newErrors.title = "Length must be greater than 5 characters";
    }

    if (!showData.productionType) {
      newErrors.productionType = "Please choose Production Type";
    }

    if (!showData.description) {
      newErrors.description = "Please add a description";
    } else if (showData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (showData.genre.length === 0) {
      newErrors.genre = "Please add at least one genre";
    } else if (showData.genre.some((item) => !item)) {
      newErrors.genre = "Please choose a genre for each field";
    }

    if (!showData.group && user?.role === "head" && !!user?.department) {
      newErrors.group = "Please choose Performing Group";
    }

    if (!showData.image) {
      newErrors.imageCover = "Please add an image cover";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (index: number, value: string | number) => {
    const updatedGenres = [...showData.genre];
    updatedGenres[index] = String(value);
    setShowData((prev) => ({ ...prev, genre: updatedGenres }));
  };

  const addGenre = () => {
    setShowData((prev) => ({
      ...prev,
      genre: [...prev.genre, ""],
    }));
  };

  const removeGenre = (index: number) => {
    const newGenre = showData.genre.filter((_, i) => i !== index);
    setShowData((prev) => ({
      ...prev,
      genre: newGenre,
    }));
  };

  const handleSumbit = () => {
    if (!validate()) return;
    setShowCreationSummary(true);
  };

  const confirmShowCreation = () => {
    setIsUploading(true);

    if (!user?.userId || !showData.productionType || !showData.image) {
      alert("Missing required fields");
      return;
    }

    const stringedGenre = showData.genre.join(", ");

    createShow.mutate(
      {
        showTitle: showData.title,
        description: showData.description,
        department: showData.group,
        genre: stringedGenre,
        createdBy: user?.userId,
        showType: showData.productionType,
        image: showData.image,
      },
      {
        onSuccess: (data) => {
          setIsUploading(false);
          setShowData({
            title: "",
            group: user?.department?.departmentId || "",
            productionType: "",
            description: "",
            genre: [] as string[],
            showImagePreview: "",
            image: null as File | null,
          });

          queryClient.setQueryData<ShowData>(["show", data.showId], data);
          queryClient.setQueryData(["shows"], (oldData: ShowData[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((show) => (show.showId === data.showId ? data : show));
          });
          navigate(`/shows/add/schedule/${data.showId}`);
          ToastNotification.success("Show created");
          ToastNotification.info("Please add a schedule for the created show", 5000);
        },
        onError: (err) => {
          ToastNotification.error(err.message);
          setIsUploading(false);
        },
      }
    );
  };

  if (loadingDepartments || loadingGenres) {
    return <h1>Loading...</h1>;
  }

  if (errorDepartment || !groups || errorGenres || !genres) {
    return <h1>Server Error</h1>;
  }

  const groupOptions = (groups ?? []).map((dept) => ({
    label: dept.name,
    value: dept.departmentId,
  }));

  const genreValues = (genres ?? []).map((genre) => ({
    label: genre.name,
    value: genre.name,
  }));

  return (
    <ContentWrapper className="lg:!p-20 flex flex-col">
      <BreadCrumb backLink="/shows" items={[{ name: "Return", path: "" }]} />
      <h1 className="text-3xl mt-10">Create New Show</h1>

      <ContentWrapper className="border border-lightGrey rounded-md mt-10">
        <h1 className="text-xl">Show Details</h1>

        <div className="flex mt-5 flex-col gap-5 lg:flex-row">
          <div className="flex gap-5 flex-col w-full">
            <TextInput
              disabled={isUploading}
              isError={!!errors.title}
              errorMessage={errors.title}
              label="Show Title"
              value={showData.title}
              onChange={handleInputChange}
              name="title"
            />

            <div className="flex gap-10 lg:flex-col lg:gap-5 xl:flex-row xl:gap-10">
              <Dropdown
                isError={!!errors.group}
                errorMessage={errors.group}
                disabled={user?.role !== "head" || isUploading || showData.productionType == "majorProduction"}
                className="w-full"
                label="Performing Group"
                options={showData.productionType == "majorProduction" ? [{ label: "All Department", value: "all" }] : groupOptions}
                value={showData.productionType == "majorProduction" ? "all" : showData.group}
                onChange={(value) => setShowData((prev) => ({ ...prev, group: value }))}
              />
              <Dropdown
                disabled={isUploading}
                isError={!!errors.productionType}
                errorMessage={errors.productionType}
                className="w-full"
                label="Production Type"
                options={user?.role === "head" ? [...productionType, { label: "Major Production", value: "majorProduction" }] : productionType}
                value={showData.productionType}
                onChange={(value) => setShowData((prev) => ({ ...prev, productionType: value }))}
              />
            </div>

            <TextArea
              disabled={isUploading}
              label="Description"
              name="description"
              value={showData.description}
              onChange={handleTextAreaChange}
              isError={!!errors.description}
              errorMessage={errors.description}
            />

            <div className="flex flex-col">
              <InputLabel label="Genres" />
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex gap-3 flex-wrap">
                  {showData.genre.map((genre, index) => {
                    const availableGenres = genreValues.filter((g) => !showData.genre.includes(g.value) || g.value === genre);

                    return (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          className="text-sm text-red mt-1 absolute -top-3 -right-1 font-bold z-10"
                          onClick={() => removeGenre(index)}
                        >
                          X
                        </button>
                        <Dropdown
                          disabled={isUploading}
                          isError={!showData.genre[index]}
                          className="w-full"
                          options={availableGenres}
                          value={genre}
                          onChange={(value) => handleGenreChange(index, value)}
                        />
                      </div>
                    );
                  })}
                </div>
                <Button
                  disabled={isUploading}
                  type="button"
                  className={`flex items-center w-5 h-5 !p-3 justify-center ${genres.length === showData.genre.length && "hidden"}`}
                  onClick={addGenre}
                >
                  +
                </Button>
              </div>
              {errors.genre && <p className="text-sm text-red mt-1">{errors.genre}</p>}
            </div>
          </div>

          <div className="w-full max-w-[500px]">
            <InputLabel label="Show Image Cover" />
            <div className="flex flex-col gap-2">
              {showData.showImagePreview && (
                <div className="h-full w-full border rounded border-lightGrey p-2">
                  <img src={showData.showImagePreview} alt="Preview" className="object-cover object-center max-h-[500px]" />
                </div>
              )}

              <input
                disabled={isUploading}
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
                    setShowData((prev) => ({
                      ...prev,
                      showImagePreview: imageURL,
                      image: file,
                    }));
                  }
                }}
              />
              {errors.imageCover && <p className="text-sm text-red mt-1">{errors.imageCover}</p>}
            </div>
          </div>
        </div>
      </ContentWrapper>

      <Button disabled={isUploading} loading={isUploading} loadingMessage="Creating Show" onClick={handleSumbit} className="mt-10 self-end">
        Create Show
      </Button>

      {showCreationSummary && (
        <Modal title="Show Creation Summary" isOpen={showCreationSummary} onClose={() => setShowCreationSummary(false)}>
          <ContentWrapper className="flex flex-col gap-10">
            <div className="flex gap-10">
              <div className="w-[200px] flex items-center justify-center">
                <img className="object-cover min-w-[200px]" src={showData.showImagePreview} alt="Show Cover" />
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-[150px_auto] gap-2">
                  <p className="text-lightGrey">Show Title</p>
                  <p className="font-medium">{showData.title}</p>
                </div>
                <div className="grid grid-cols-[150px_auto] gap-2">
                  <p className="text-lightGrey">Performing Group</p>
                  <p className="font-medium">{groupOptions.find((item) => item.value == showData.group)?.label}</p>
                </div>
                <div className="grid grid-cols-[150px_auto] gap-2">
                  <p className="text-lightGrey">Show Type</p>
                  <p className="font-medium">{productionType.find((item) => item.value == showData.productionType)?.label}</p>
                </div>
                <div className="grid grid-cols-[150px_auto] gap-2">
                  <p className="text-lightGrey">Description</p>
                  <p className="font-medium line-clamp-3 max-w-[300px]">{showData.description}</p>
                </div>

                <div className="grid grid-cols-[150px_auto] gap-2">
                  <p className="text-lightGrey">Genre</p>
                  <p className="font-medium">{showData.genre.join(", ")}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-5 self-end">
              <Button
                className="!bg-green"
                onClick={() => {
                  setShowCreationSummary(false);
                  confirmShowCreation();
                }}
              >
                Confirm
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowData({
                    title: "",
                    group: user?.department?.departmentId || "",
                    productionType: "",
                    description: "",
                    genre: [] as string[],
                    showImagePreview: "",
                    image: null as File | null,
                  });
                  setShowCreationSummary(false);
                  ToastNotification.info("Show Creation Canceled");
                }}
              >
                Cancel
              </Button>
            </div>
          </ContentWrapper>
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default CreateShow;
