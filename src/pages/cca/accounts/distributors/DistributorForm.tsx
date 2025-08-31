import React, { useState } from "react";
import { isValidEmail } from "../../../../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";

type DistributorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  type: string;
  department: string;
};

type DistributorFormProps = {
  initialValues: DistributorFormValues;
  distributorTypeOptions: { label: string; value: string }[];
  groupOptions: { label: string; value: string }[];
  onSubmit: (values: DistributorFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const DistributorForm = ({ initialValues, distributorTypeOptions, groupOptions, onSubmit, onCancel, isSubmitting }: DistributorFormProps) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof DistributorFormValues, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "contactNumber") {
      newValue = value.replace(/\D/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
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
    if (!formData.contactNumber.trim() || formData.contactNumber.length !== 11) {
      newErrors.contactNumber = "Contact Number should be 11 digits";
      isValid = false;
    }
    if (!formData.type) {
      newErrors.type = "Please Choose Distributor Type";
      isValid = false;
    }
    if (formData.type === "2" && !formData.department) {
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

  return (
    <div className="flex flex-col gap-5">
      <div className="border border-lightGrey rounded-md p-5 mt-5">
        <h1 className="text-lg">Basic Information</h1>
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex gap-5">
            <Input disabled={isSubmitting} placeholder="eg. Juan" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <Input
              disabled={isSubmitting}
              placeholder="eg. Dela Cruz"
              name="lastName"
              // label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-5">
            <Input
              disabled={isSubmitting}
              // isError={!!errors.email}
              // errorMessage={errors.email}
              type="email"
              placeholder={formData.type === "2" ? "eg. member@slu.edu.ph" : "eg. distributor@gmail.com"}
              name="email"
              // label="SLU Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              disabled={isSubmitting}
              // isError={!!errors.contactNumber}
              // errorMessage={errors.contactNumber}
              placeholder="eg. 0928293752"
              name="contactNumber"
              // label="Contact Number"
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-5">
            {/* <Dropdown
              disabled={isSubmitting}
              isError={!!errors.type}
              errorMessage={errors.type}
              className="w-full"
              label="Distributor Type"
              onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              value={formData.type}
              options={distributorTypeOptions}
            /> */}

            {formData.type === "2" && (
              // <Dropdown
              //   disabled={isSubmitting}
              //   isError={!!errors.department}
              //   errorMessage={errors.department}
              //   className="w-full"
              //   label="Performing Group"
              //   onChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
              //   value={formData.department || ""}
              //   options={groupOptions}
              // />
              <p>Show</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-5">
        <Button disabled={isSubmitting} onClick={handleSubmit} className="!bg-green">
          Save
        </Button>
        <Button disabled={isSubmitting} onClick={onCancel} className="!bg-red">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DistributorForm;
