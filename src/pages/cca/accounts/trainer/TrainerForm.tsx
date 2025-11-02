import { useState } from "react";
import { isValidEmail } from "@/utils";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import ResetPasswordButton from "@/components/ResetPasswordButton";

type TrainerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
};

type TrainerFormProps = {
  initalValues: TrainerFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: TrainerFormValues) => void;
  close: () => void;
};

const TrainerForm = ({ initalValues, onSubmit, close, isSubmitting }: TrainerFormProps) => {
  const [trainerData, setTrainerData] = useState(initalValues);

  const [errors, setErrors] = useState<Partial<Record<keyof TrainerFormValues, string>>>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      if (/^[a-zA-Z0-9@._-]*$/.test(value)) {
        setTrainerData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setTrainerData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
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
            <InputField
              disabled={isSubmitting}
              error={errors?.firstName}
              placeholder="eg. Juan"
              name="firstName"
              label="First Name"
              value={trainerData.firstName}
              onChange={handleInputChange}
            />
            <InputField
              disabled={isSubmitting}
              error={errors?.lastName}
              placeholder="eg. Dela Cruz"
              name="lastName"
              label="Last Name"
              value={trainerData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-5">
            <InputField
              disabled={isSubmitting}
              error={errors?.email}
              type="email"
              placeholder="eg. trainer@slu.edu.ph"
              name="email"
              label="SLU Email"
              value={trainerData.email}
              onChange={handleInputChange}
            />
          </div>
          {trainerData.userId && (
            <ResetPasswordButton userId={trainerData.userId} firstName={trainerData.firstName} lastName={trainerData.lastName} />
          )}
        </div>
      </div>
      <div className="flex justify-end mt-5 gap-2">
        <Button disabled={isSubmitting} onClick={close} variant="outline">
          Cancel
        </Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {initalValues.firstName ? "Save Changes" : "Add Trainer"}
        </Button>
      </div>
    </div>
  );
};

export default TrainerForm;
