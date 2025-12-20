import React, { useState } from "react";
import { isValidEmail } from "@/utils";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import type { DistributorTypes } from "@/types/user";
import ResetPasswordButton from "@/components/ResetPasswordButton";

type DistributorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  type: DistributorTypes;
  department: string;
  userId: string;
};

type DistributorFormProps = {
  initialValues: DistributorFormValues;
  distributorTypeOptions: { name: string; value: string }[];
  groupOptions: { name: string; value: string }[];
  onSubmit: (values: DistributorFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const DistributorForm = ({ initialValues, distributorTypeOptions, groupOptions, onSubmit, onCancel, isSubmitting }: DistributorFormProps) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof DistributorFormValues, string>>>({});

  const validateField = (name: keyof DistributorFormValues, value: string, formData: DistributorFormValues): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First Name should have value";
        if (value.trim().length < 2) return "First Name must be at least 2 characters";
        return "";

      case "lastName":
        if (!value.trim()) return "Last Name should have value";
        if (value.trim().length < 2) return "Last Name must be at least 2 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email should have value";
        if (!isValidEmail(value.trim())) return "Invalid Email Format";
        return "";

      case "contactNumber":
        if (!/^(09\d{9}|9\d{9})$/.test(value.trim())) return "Invalid contact number";
        return "";

      case "department":
        if (formData.type === "cca" && !value) return "Please Choose Performing Group";
        return "";

      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "contactNumber") {
      newValue = value.replace(/\D/g, "");
    } else if (name === "email") {
      newValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
    } else {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      const errorMessage = validateField(name as keyof DistributorFormValues, newValue, updated);

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMessage || undefined,
      }));

      return updated;
    });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name should have value";
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name should have value";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email should have value";
      isValid = false;
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = "Invalid Email Format";
      isValid = false;
    }

    if (!/^(09\d{9}|9\d{9})$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Invalid contact number";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Please Choose Distributor Type";
      isValid = false;
    }
    if (formData.type === "cca" && !formData.department) {
      newErrors.department = "Please Choose Performing Group";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      contactNumber: formData.contactNumber.trim(),
    });
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="flex flex-col gap-5 -mt-5">
      <div className="border border-lightGrey rounded-md p-5 mt-5">
        <h1 className="text-lg">Basic Information</h1>
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex gap-5">
            <InputField
              maxLength={30}
              error={errors.firstName}
              label="First Name"
              disabled={isSubmitting}
              placeholder="eg. Juan"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <InputField
              maxLength={30}
              error={errors.lastName}
              disabled={isSubmitting}
              placeholder="eg. Dela Cruz"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-5">
            <InputField
              maxLength={50}
              disabled={isSubmitting}
              error={errors.email}
              type="email"
              placeholder={formData.type === "cca" ? "eg. member@slu.edu.ph" : "eg. distributor@gmail.com"}
              name="email"
              label={formData.type === "cca" ? "SLU Email" : "Email"}
              value={formData.email}
              onChange={handleInputChange}
            />
            <InputField
              disabled={isSubmitting}
              error={errors.contactNumber}
              placeholder="eg. 0928293752"
              name="contactNumber"
              label="Contact Number"
              maxLength={11}
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-5">
            <Dropdown
              disabled={isSubmitting}
              error={errors.type}
              className="w-full"
              placeholder="Select Distributor Type"
              label="Distributor Type"
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, type: value as DistributorTypes }));
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              value={formData.type}
              items={distributorTypeOptions}
              includeHeader={true}
            />

            {formData.type === "cca" && (
              <Dropdown
                includeHeader={true}
                disabled={isSubmitting}
                error={errors.department}
                className="w-full"
                label="Performing Group"
                placeholder="Select Performing Group"
                onChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                value={formData.department || ""}
                items={groupOptions}
              />
            )}
          </div>
          {formData.userId && <ResetPasswordButton userId={formData.userId} firstName={formData.firstName} lastName={formData.lastName} />}
        </div>
      </div>

      <div className="flex justify-end gap-5">
        <Button disabled={isSubmitting} onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button disabled={isSubmitting || hasErrors} onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default DistributorForm;
