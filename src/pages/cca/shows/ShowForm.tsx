import React, { useMemo, useState } from "react";

import { useAuthContext } from "@/context/AuthContext.tsx";
import { useGetDepartments } from "@/_lib/@react-client-query/department.ts";
import { useGetGenres } from "@/_lib/@react-client-query/genre.ts";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShowType } from "@/types/show";

const productionType = [
  { name: "Showcase", value: "showCase" },
  { name: "Major Concert", value: "majorConcert" },
];

interface ShowFormProps {
  title: string;
  productionType: ShowType;
  description: string;
  genre: string[];
  imageCover: string;
  group: string;
  showImagePreview: string;
  image: File | null;
}

interface ShowFormInterface {
  showFormValue: ShowFormProps;
  isLoading?: boolean;
  formType: "edit" | "create";
  onSubmit: (data: ShowFormProps) => void;
  showType: "group" | "major";
}

const ShowForm = ({ showFormValue, isLoading, formType, onSubmit, showType }: ShowFormInterface) => {
  const { user } = useAuthContext();
  const { data: groups, isLoading: loadingDepartments, error: errorDepartment } = useGetDepartments();
  const { data: genres, isLoading: loadingGenres, error: errorGenres } = useGetGenres();
  const [showData, setShowData] = useState<ShowFormProps>(showFormValue);
  const [errors, setErrors] = useState<Partial<Record<keyof ShowFormProps, string>>>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!showData.title) {
      newErrors.title = "Please input title";
    } else if (showData.title.length < 5) {
      newErrors.title = "Length must be greater than 5 characters";
    }

    if (!showData.productionType && showType == "group") {
      newErrors.productionType = "Please choose Production Type";
    }

    if (!showData.group && showData.productionType !== "majorProduction" && showType == "group") {
      newErrors.group = "Please choose Performing Group";
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

    if (formType === "create" && !showData.image) {
      newErrors.imageCover = "Please add an image cover";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const haveChanges = useMemo(() => {
    return (
      showData.title.trim() !== showFormValue.title.trim() ||
      showData.group !== (showFormValue.group || user?.department?.departmentId || "") ||
      showData.productionType !== showFormValue.productionType ||
      showData.description.trim() !== showFormValue.description.trim() ||
      JSON.stringify(showData.genre) !== JSON.stringify(showFormValue.genre) ||
      showData.showImagePreview !== showFormValue.imageCover ||
      !!showData.image
    );
  }, [showData]);

  const submit = () => {
    if (!validate()) return;
    onSubmit(showData);
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

  if (loadingDepartments || loadingGenres) {
    return <h1>Loading...</h1>;
  }

  if (errorDepartment || !groups || errorGenres || !genres) {
    return <h1>Server Error</h1>;
  }

  const groupOptions = (groups ?? []).map((dept) => ({
    name: dept.name,
    value: dept.departmentId,
  }));

  const genreValues = (genres ?? []).map((genre) => ({
    name: genre.name,
    value: genre.name,
  }));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Show Details</CardTitle>
        </CardHeader>
        <CardContent className="flex mt-5 flex-col gap-5 lg:flex-row">
          <div className="flex gap-5 flex-col w-full">
            <InputField
              error={errors.title}
              label="Show Title"
              disabled={isLoading}
              value={showData.title}
              onChange={handleInputChange}
              name="title"
            />

            {showType == "group" && (
              <div className="flex flex-col gap-5 lg:flex-row">
                <Dropdown
                  includeHeader={true}
                  error={errors.group}
                  disabled={!user?.roles.includes("head") || isLoading || showData.productionType == "majorProduction"}
                  className="w-full"
                  label="Performing Group"
                  placeholder={!user?.roles.includes("head") ? user?.department?.name : "Select Deparment"}
                  items={showData.productionType == "majorProduction" ? [{ name: "All Department", value: "all" }] : groupOptions}
                  value={showData.productionType == "majorProduction" ? "all" : showData.group}
                  onChange={(value) => setShowData((prev) => ({ ...prev, group: value }))}
                />
                <Dropdown
                  includeHeader={true}
                  disabled={isLoading}
                  error={errors.productionType}
                  className="w-full"
                  label="Production Type"
                  placeholder={"Choose Production Type"}
                  items={user?.roles.includes("head") ? [...productionType, { name: "Major Production", value: "majorProduction" }] : productionType}
                  value={showData.productionType}
                  onChange={(value) => setShowData((prev) => ({ ...prev, productionType: value as ShowType }))}
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Label>Description</Label>
              <Textarea
                className={`${errors.description && "border-red"}`}
                disabled={isLoading}
                name="description"
                value={showData.description}
                onChange={handleTextAreaChange}
              />
              {errors.description && <p className="text-red text-sm -mt-2">{errors.description}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-5">
                <Label> Genres</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={isLoading}
                      type="button"
                      className={`flex items-center w-5 h-5 !p-3 justify-center ${genres.length === showData.genre.length && "hidden"}`}
                      onClick={addGenre}
                    >
                      +
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Genre</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-5 ">
                <div className="flex gap-3 flex-wrap">
                  {showData.genre.map((genre, index) => {
                    const availableGenres = genreValues.filter((g) => !showData.genre.includes(g.value) || g.value === genre);

                    return (
                      <div key={index} className="relative">
                        <Button onClick={() => removeGenre(index)} className="absolute -top-4 -right-5" variant="ghost">
                          <X className="text-red" />
                        </Button>
                        <Dropdown
                          label="Choose Genre"
                          disabled={isLoading}
                          error={!showData.genre[index] ? "Please Choose Genre" : undefined}
                          className="w-full"
                          items={availableGenres}
                          value={genre}
                          onChange={(value) => handleGenreChange(index, value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {errors.genre && <p className="text-sm text-red mt-1">{errors.genre}</p>}
            </div>
          </div>

          <div className="w-full max-w-[700px] gap-3 flex flex-col">
            <Label>Show Image Cover</Label>
            <div className="flex flex-col gap-2">
              {showData.showImagePreview && (
                <div className="h-full w-full border rounded border-lightGrey p-2">
                  <img src={showData.showImagePreview} alt="Preview" className="object-cover object-center max-h-[350px]" />
                </div>
              )}

              <Input
                disabled={isLoading}
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
        </CardContent>
      </Card>

      <div className="flex justify-end mt-5">
        <Button disabled={isLoading || (formType === "edit" && !haveChanges)} onClick={submit}>
          {formType == "create" ? "Create Show" : "Save Changes"}
        </Button>
      </div>
    </>
  );
};

export default ShowForm;
