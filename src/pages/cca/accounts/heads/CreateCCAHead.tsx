import { useAddCCARole, useGetTrainers, useNewCCAHead } from "@/_lib/@react-client-query/accounts";
import InputField from "@/components/InputField";
import { MultiSelect } from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isValidEmail } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type CreateCCAHeadProps = {
  closeModal: () => void;
};

const CreateCCAHead = ({ closeModal }: CreateCCAHeadProps) => {
  return (
    <Tabs defaultValue="create">
      <TabsList>
        <TabsTrigger value="create">Create CCA Head</TabsTrigger>
        <TabsTrigger value="add role">Make Trainer CCA Head</TabsTrigger>
      </TabsList>
      <TabsContent value="create">
        <ByCreation closeModal={closeModal} />
      </TabsContent>
      <TabsContent value="add role">
        <ByAddRole closeModal={closeModal} />
      </TabsContent>
    </Tabs>
  );
};

const ByCreation = ({ closeModal }: CreateCCAHeadProps) => {
  const queryClient = useQueryClient();
  const addHead = useNewCCAHead();

  const [form, setForm] = useState({ firstName: "", email: "", lastName: "" });
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; lastName?: string }>({});

  const validate = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (!form.firstName.trim()) {
      isValid = false;
      newErrors.firstName = "Please enter First Name";
    }

    if (!form.lastName.trim()) {
      isValid = false;
      newErrors.lastName = "Please enter Last Name";
    }

    if (!isValidEmail(form.email.trim())) {
      isValid = false;
      newErrors.email = "Invalid Email format";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "email") {
      newValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
    } else {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    if (!validate()) return;

    toast.promise(addHead.mutateAsync(form), {
      position: "top-center",
      loading: "Creating head...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["heads"] });
        setForm({ firstName: "", email: "", lastName: "" });
        closeModal();
        return "CCA Head created";
      },
      error: (err) => err.message || "Failed to create head",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create CCA Head Account</CardTitle>
        <CardDescription>Enter account details and click create</CardDescription>
      </CardHeader>
      <CardContent>
        <InputField
          maxLength={30}
          disabled={addHead.isPending}
          name="firstName"
          label="First Name"
          value={form.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
        />
        <InputField
          maxLength={30}
          disabled={addHead.isPending}
          name="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
        />
        <InputField
          maxLength={50}
          disabled={addHead.isPending}
          name="email"
          label="Email"
          value={form.email}
          onChange={handleInputChange}
          error={errors.email}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button disabled={addHead.isPending} onClick={handleSubmit}>
          Create
        </Button>
      </CardFooter>
    </Card>
  );
};

const ByAddRole = ({ closeModal }: CreateCCAHeadProps) => {
  const queryClient = useQueryClient();
  const addHeadRole = useAddCCARole();
  const { data, isLoading, isError } = useGetTrainers();
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((trainer) => !trainer.isArchived && !trainer.roles.includes("head"));
  }, [data]);

  const trainerOptions = filtered.map((trainer) => ({
    label: `${trainer.firstName} ${trainer.lastName} ${
      trainer.departments.length > 0 ? `(${trainer.departments.map((t) => t.name)} trainer)` : "(No Group)"
    }`,
    value: trainer.userId,
  }));

  const handleSubmit = () => {
    if (selectedTrainers.length == 0) {
      toast("No Trainers Selected", {
        description: "Please Choose atleast one trainer",
        position: "top-center",
      });
      setError("Choose atleast one trainer");
      return;
    }

    toast.promise(addHeadRole.mutateAsync(selectedTrainers), {
      position: "top-center",
      loading: "Adding roles...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["heads"], exact: true });
        closeModal();
        return "Roles added";
      },
      error: (error) => error.message || "Failed to add roles",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Trainer into CCA Head</CardTitle>
        <CardDescription>Choose a Trainer to add a CCA Head Role</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <h1>Loading Trainers</h1>}
        {!data || isError ? (
          <h1>Failed to load trainers.</h1>
        ) : filtered.length == 0 ? (
          <h1>No Exsisting trainer can be made head, reasons: trainers can be archived or all trainers have already CCa head role</h1>
        ) : (
          <div className="flex flex-col gap-3">
            <Label>Select Trainers</Label>
            <MultiSelect
              placeholder="Select Trainers"
              onValueChange={(trainers) => {
                setSelectedTrainers(trainers);
                setError("");
              }}
              options={trainerOptions}
            />
            {error && <p className="text-red text-sm">{error}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">{filtered.length !== 0 && <Button onClick={handleSubmit}>Save</Button>}</CardFooter>
    </Card>
  );
};

export default CreateCCAHead;
