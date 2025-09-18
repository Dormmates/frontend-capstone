import { useGetTallyData, useUpdateTallyData } from "@/_lib/@react-client-query/schedule";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const ScheduleTallyData = () => {
  const { scheduleId } = useParams();
  const queryClient = useQueryClient();
  const updateTallyData = useUpdateTallyData();
  const { data: tallyData, isLoading, isError } = useGetTallyData(scheduleId as string);

  const [formData, setFormData] = useState({
    femaleCount: 0,
    maleCount: 0,
  });

  const [errors, setErrors] = useState<{ femaleCount?: string; maleCount?: string }>({});

  useEffect(() => {
    if (tallyData) {
      setFormData({
        femaleCount: tallyData.femaleCount ?? 0,
        maleCount: tallyData.maleCount ?? 0,
      });
    }
  }, [tallyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.femaleCount) {
      newErrors.femaleCount = "Please add a valid value";
      isValid = false;
    }

    if (!formData.maleCount) {
      newErrors.maleCount = "Please add a valid value";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    toast.promise(
      updateTallyData.mutateAsync({
        femaleCount: formData.femaleCount as number,
        maleCount: formData.maleCount as number,
        scheduleId: scheduleId as string,
      }),
      {
        position: "top-center",
        loading: "Updating tally data...",
        success: () => {
          queryClient.setQueryData(["schedule", "tally", scheduleId], (oldData: typeof tallyData | undefined) => ({
            ...(oldData ?? {}),
            ...formData,
          }));
          return "Tally Data Updated";
        },
        error: "Failed to update tally data",
      }
    );
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError || !tallyData) {
    return <h1>Error loading data</h1>;
  }

  console.log(tallyData);

  return (
    <div className="flex justify-center w-full mt-10">
      <div className="flex flex-col items-center w-full  gap-4">
        <InputField
          disabled={updateTallyData.isPending}
          type="number"
          label="Male Count"
          value={formData.maleCount}
          onChange={handleInputChange}
          name="maleCount"
          error={errors.maleCount}
          className="w-full"
        />
        <InputField
          disabled={updateTallyData.isPending}
          type="number"
          label="Female Count"
          value={formData.femaleCount}
          onChange={handleInputChange}
          name="femaleCount"
          error={errors.femaleCount}
          className="w-full"
        />
        <Button onClick={handleSubmit} disabled={updateTallyData.isPending} className="self-start">
          Save
        </Button>
      </div>
    </div>
  );
};

export default ScheduleTallyData;
