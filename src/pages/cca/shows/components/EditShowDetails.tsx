import { useMemo, useState } from "react";
import type { ShowData, ShowType } from "../../../../types/show";
import { ContentWrapper } from "../../../../components/layout/Wrapper";
import TextInput, { TextArea } from "../../../../components/ui/TextInput";
import Dropdown from "../../../../components/ui/Dropdown";
import InputLabel from "../../../../components/ui/InputLabel";
import Button from "../../../../components/ui/Button";
import { useAuthContext } from "../../../../context/AuthContext";
import { useGetDepartments } from "../../../../_lib/@react-client-query/department";
import { useGetGenres } from "../../../../_lib/@react-client-query/genre";
import { useUpdateShow } from "../../../../_lib/@react-client-query/show";
import { getFileId } from "../../../../utils";
import ToastNotification from "../../../../utils/toastNotification";
import { useQueryClient } from "@tanstack/react-query";

const productionType = [
  { label: "Showcase", value: "showCase" },
  { label: "Major Concert", value: "majorConcert" },
];

const EditShowDetails = ({ selectedShow, close }: { selectedShow: ShowData; close: () => void }) => {
  const { user } = useAuthContext();
  const { data: groups, isLoading: loadingDepartments, error: errorDepartment } = useGetDepartments();
  const { data: genres, isLoading: loadingGenres, error: errorGenres } = useGetGenres();
  const [errors, setErrors] = useState<{
    title?: string;
    productionType?: string;
    description?: string;
    genre?: string;
    imageCover?: string;
    group?: string;
  }>({});
  const [showData, setShowData] = useState({
    title: selectedShow?.title,
    group: selectedShow.department.departmentId || user?.department?.departmentId || "",
    productionType: selectedShow?.showType,
    description: selectedShow?.description,
    genre: selectedShow?.genreNames,
    showImagePreview: selectedShow?.showCover,
    image: null as File | null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const updateShow = useUpdateShow();
  const queryClient = useQueryClient();

  const haveChanges = useMemo(() => {
    if (!selectedShow) return false;

    return (
      showData.title.trim() !== selectedShow.title.trim() ||
      showData.group !== (selectedShow.department.departmentId || user?.department?.departmentId || "") ||
      showData.productionType !== selectedShow.showType ||
      showData.description.trim() !== selectedShow.description.trim() ||
      JSON.stringify(showData.genre) !== JSON.stringify(selectedShow.genreNames) ||
      showData.showImagePreview !== selectedShow.showCover ||
      !!showData.image
    );
  }, [showData, selectedShow]);

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
  };

  const confirmShowUpdate = () => {
    if (!validate()) return;
    setIsUploading(true);

    if (!user?.userId || !showData.productionType) {
      alert("Missing required fields");
      return;
    }

    const stringedGenre = showData.genre.join(", ");

    updateShow.mutate(
      {
        showId: selectedShow.showId,
        showTitle: showData.title,
        description: showData.description,
        department: showData.group,
        genre: stringedGenre,
        createdBy: user?.userId,
        showType: showData.productionType,
        image: showData.image as File,
        oldFileId: showData.image ? (getFileId(selectedShow.showCover) as string) : undefined,
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

          queryClient.invalidateQueries({ queryKey: ["shows"], exact: true });
          ToastNotification.success(data.message);
          close();
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

  const groupOptions = (groups.departments ?? []).map((dept) => ({
    label: dept.name,
    value: dept.departmentId,
  }));

  const genreValues = (genres.genres ?? []).map((genre) => ({
    label: genre.name,
    value: genre.name,
  }));

  return (
    <div className="flex flex-col">
      <ContentWrapper className="border border-lightGrey rounded-md mt-5">
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
                disabled={user?.role !== "head" || isUploading}
                className="w-full"
                label="Performing Group"
                options={groupOptions}
                value={showData.group}
                onChange={(value) => setShowData((prev) => ({ ...prev, group: value }))}
              />
              <Dropdown
                disabled={isUploading}
                isError={!!errors.productionType}
                errorMessage={errors.productionType}
                className="w-full"
                label="Production Type"
                options={productionType}
                value={showData.productionType}
                onChange={(value) => setShowData((prev) => ({ ...prev, productionType: value as ShowType }))}
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
                  className={`flex items-center w-5 h-5 !p-3 justify-center ${genres.genres.length === showData.genre.length && "hidden"}`}
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
      <Button onClick={confirmShowUpdate} disabled={!haveChanges || isUploading} className="mt-5 self-end bg-green">
        Save Changes
      </Button>
    </div>
  );
};

export default EditShowDetails;
