import { useState } from "react";
import type { Trainer } from "../../../../types/user";
import TextInput from "../../../../components/ui/TextInput";
import Dropdown from "../../../../components/ui/Dropdown";
import type { Department } from "../../../../types/department";
import Button from "../../../../components/ui/Button";
import { isValidEmail } from "../../../../utils";
import ToastNotification from "../../../../utils/toastNotification";

const EditTrainer = ({ trainer, departments }: { trainer: Trainer; departments: Department[] }) => {
  const [trainerData, setTrainerData] = useState({
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    email: trainer.email,
    group: trainer.department?.departmentId,
  });
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; group?: string }>();

  const groupOptions = (departments ?? [])
    .filter((department) => !department.trainerId || !department.trainerName)
    .map((department) => ({ label: department.name, value: department.departmentId }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrainerData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (trainerData.firstName.trim().length < 1 || !trainerData.firstName.trim()) {
      newErrors.firstName = "First Name should have value";
      isValid = false;
    }

    if (trainerData.lastName.trim().length < 1 || !trainerData.lastName.trim()) {
      newErrors.lastName = "Last Name should have value";
      isValid = false;
    }

    if (trainerData.email.trim().length < 1 || !trainerData.email.trim()) {
      newErrors.email = "Email should have value";
      isValid = false;
    }

    if (!isValidEmail(trainerData.email.trim())) {
      newErrors.email = "Invalid Email Format";
      isValid = false;
    }

    if (!trainerData.group) {
      newErrors.group = "Please Select a Group to assign this trainer";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const hasChanges =
      trainerData.firstName.trim() !== trainer.firstName.trim() ||
      trainerData.lastName.trim() !== trainer.lastName.trim() ||
      trainerData.email.trim() !== trainer.email.trim() ||
      trainerData.group !== trainer.department?.departmentId;

    if (!hasChanges) {
      ToastNotification.info("No Changes Detected");
      return;
    }
  };
  return (
    <div>
      <div className="border border-lightGrey rounded-md p-5 mt-5">
        <h1 className="text-lg">Basic Information</h1>

        <div className="mt-5 flex flex-col gap-5">
          <div className="flex gap-5">
            <TextInput
              isError={!!errors?.firstName}
              errorMessage={errors?.firstName}
              placeholder="eg. Juan"
              name="firstName"
              label="First Name"
              value={trainerData.firstName}
              onChange={handleInputChange}
            />
            <TextInput
              isError={!!errors?.lastName}
              errorMessage={errors?.lastName}
              placeholder="eg. Dela Cruz"
              name="lastName"
              label="Last Name"
              value={trainerData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-5">
            <TextInput
              isError={!!errors?.email}
              errorMessage={errors?.email}
              type="email"
              placeholder="eg. trainer@slu.edu.ph"
              name="email"
              label="SLU Email"
              value={trainerData.email}
              onChange={handleInputChange}
            />
            <Dropdown
              isError={!!errors?.group}
              errorMessage={errors?.group}
              className="w-full"
              options={groupOptions}
              value={trainerData.group as string}
              label="Performing Group"
              onChange={(value) => setTrainerData((prev) => ({ ...prev, group: value }))}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-5 gap-2">
        <Button onClick={handleSubmit} className="!bg-green">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditTrainer;
