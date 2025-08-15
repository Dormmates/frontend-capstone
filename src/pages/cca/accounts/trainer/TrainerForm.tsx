import { useState } from "react";
import TextInput from "../../../../components/ui/TextInput";
import Dropdown from "../../../../components/ui/Dropdown";
import Button from "../../../../components/ui/Button";
import { isValidEmail } from "../../../../utils";
import InputLabel from "../../../../components/ui/InputLabel";

type TrainerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  group: string;
  assignDepartment: boolean;
};

type TrainerFormProps = {
  initalValues: TrainerFormValues;
  groupOptions: { label: string; value: string }[];
  isSubmitting: boolean;
  onSubmit: (payload: TrainerFormValues) => void;
  close: () => void;
};

const TrainerForm = ({ initalValues, groupOptions, onSubmit, close, isSubmitting }: TrainerFormProps) => {
  const [trainerData, setTrainerData] = useState(initalValues);

  const [errors, setErrors] = useState<Partial<Record<keyof TrainerFormValues, string>>>();

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

    if (trainerData.assignDepartment && groupOptions.length !== 0 && !trainerData.group) {
      newErrors.group = "Please Select a Group to assign this trainer";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(trainerData);
  };

  return (
    <div>
      <div className="border border-lightGrey rounded-md p-5 mt-5">
        <h1 className="text-lg">Basic Information</h1>

        <div className="mt-5 flex flex-col gap-5">
          <div className="flex gap-5">
            <TextInput
              disabled={isSubmitting}
              isError={!!errors?.firstName}
              errorMessage={errors?.firstName}
              placeholder="eg. Juan"
              name="firstName"
              label="First Name"
              value={trainerData.firstName}
              onChange={handleInputChange}
            />
            <TextInput
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              isError={!!errors?.email}
              errorMessage={errors?.email}
              type="email"
              placeholder="eg. trainer@slu.edu.ph"
              name="email"
              label="SLU Email"
              value={trainerData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <input
                disabled={isSubmitting}
                type="checkbox"
                onChange={(e) =>
                  setTrainerData((prev) => {
                    const { checked } = e.target;
                    return {
                      ...prev,
                      assignDepartment: checked,
                      ...(checked ? {} : { group: initalValues.group }),
                    };
                  })
                }
              />

              <InputLabel className="!m-0" label={initalValues.group ? "Change Performing Group?" : "Assign Performing Group?"} />
            </div>
            {trainerData.assignDepartment &&
              (groupOptions.length !== 0 ? (
                <Dropdown
                  isError={!!errors?.group}
                  errorMessage={errors?.group}
                  disabled={isSubmitting}
                  onChange={(value) => setTrainerData((prev) => ({ ...prev, group: value }))}
                  className="mt-5 w-full"
                  options={groupOptions}
                  value={trainerData.group as string}
                  label="Performing Group"
                />
              ) : (
                <h1 className="text-center mt-2 font-medium">All performing groups have respective trainers already</h1>
              ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-5 gap-2">
        <Button disabled={isSubmitting} onClick={handleSubmit} className="!bg-green">
          {initalValues.firstName ? "Save Changes" : "Add Trainer"}
        </Button>
        <Button disabled={isSubmitting} onClick={close} className="!bg-red">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TrainerForm;
