import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { FileIcon, FileInputIcon, Loader2, TriangleAlert } from "lucide-react";
import * as XLSX from "xlsx";
import PaginatedTable from "@/components/PaginatedTable";
import { isValidEmail } from "@/utils";
import { useCreateBulkDistributors, useGetEmails } from "@/_lib/@react-client-query/accounts";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DistributorRow {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  isValid?: boolean;
  errorMessages?: string[];
}

type Props = {
  group: string;
};

const BulkDistributorCreation = ({ group }: Props) => {
  const { data: emails } = useGetEmails();
  const queryClient = useQueryClient();
  const bulkCreate = useCreateBulkDistributors();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [parsedData, setParsedData] = useState<DistributorRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    parseFile(selected);
  };

  const validateRows = (rows: DistributorRow[]): DistributorRow[] => {
    const emailSet = new Set<string>();
    const validated: DistributorRow[] = [];

    for (const row of rows) {
      const errors: string[] = [];
      const emailLower = row.email.trim().toLowerCase();
      const contact = row.contactNumber;

      // Validate first/last name
      if (!row.firstName || !row.lastName) errors.push("Missing name");

      // Email validation
      if (!isValidEmail(emailLower)) {
        errors.push("Invalid email format");
      } else if (!emailLower.endsWith("@slu.edu.ph")) {
        errors.push("Email must end with @slu.edu.ph");
      }

      // Duplicate email
      if (emailSet.has(emailLower)) {
        errors.push("Duplicate email");
      } else {
        emailSet.add(emailLower);
      }

      // Contact number validation (must start with 9 and be 11 digits)
      if (!/^09\d{9}$/.test(contact)) {
        errors.push("Invalid contact number format");
      }

      if (emails && emails.filter((email) => email == emailLower).length > 0) {
        errors.push("This  email already exists on the database");
      }

      validated.push({
        ...row,
        email: emailLower,
        contactNumber: contact,
        isValid: errors.length === 0,
        errorMessages: errors,
      });
    }

    console.log(emails);

    return validated;
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    setParsedData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as DistributorRow[];

      const requiredFields = ["firstName", "lastName", "email", "contactNumber"];
      const hasValidColumns = json.length > 0 && requiredFields.every((col) => col in json[0]);

      if (!hasValidColumns) {
        alert("Invalid file format. Headers must be: firstName, lastName, email, contactNumber");
        setFile(null);
        setParsedData([]);
        return;
      }

      const validated = validateRows(json);
      setParsedData(validated);
    } catch (err) {
      console.error("Error parsing file:", err);
      alert("Failed to parse file. Please upload a valid CSV or Excel file.");
    } finally {
      setIsParsing(false);
    }
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const invalidCount = parsedData.filter((r) => !r.isValid).length;

  const handleSubmit = () => {
    toast.promise(
      bulkCreate.mutateAsync({
        performingGroup: group,
        distributors: parsedData.filter((d) => d.isValid),
      }),
      {
        position: "top-center",
        loading: "Creating Distributors",
        error: (err) => err.message || "Failed to Bulk Create Distributors, please try again later",
        success: (payload) => {
          alert(JSON.stringify(payload.summary));
          queryClient.invalidateQueries({ queryKey: ["distributors"] });
          return payload.message;
        },
      }
    );
  };

  return (
    <>
      {/* File Upload */}
      <div
        className={`border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition ${
          isParsing ? "opacity-60 pointer-events-none" : ""
        }`}
        onClick={() => (!isParsing || !bulkCreate.isPending) && fileInputRef.current?.click()}
      >
        <Input
          disabled={isParsing || bulkCreate.isPending}
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
        />

        {isParsing ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Parsing file, please wait...</span>
          </div>
        ) : file ? (
          <p className="flex items-center justify-center gap-2 text-foreground font-medium">
            <FileIcon className="w-4" />
            {file.name}
          </p>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileInputIcon className="w-4" />
            Click to upload a CSV or Excel file
          </p>
        )}
      </div>

      {/* Preview Parsed Data */}
      {parsedData.length > 0 && !isParsing && (
        <div className="mt-6 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Preview ({parsedData.length} records)</h3>
            <div className="text-sm text-muted-foreground">
              Valid: <span className="font-medium text-green-600">{validCount}</span> | Invalid:
              <span className="font-medium text-red-600">{invalidCount}</span>
            </div>
          </div>

          {invalidCount > 0 && (
            <div className="flex items-center gap-2 mb-3 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <TriangleAlert className="w-4 h-4" />
              Some rows contain invalid data and will be <b>skipped</b> during creation.
            </div>
          )}

          <PaginatedTable
            data={parsedData}
            columns={[
              {
                key: "firstName",
                header: "First Name",
                render: (data) => <span className={!data.isValid ? "text-red" : ""}>{data.firstName}</span>,
              },
              {
                key: "lastName",
                header: "Last Name",
                render: (data) => <span className={!data.isValid ? "text-red" : ""}>{data.lastName}</span>,
              },
              {
                key: "email",
                header: "Email",
                render: (data) => (
                  <div className={!data.isValid ? "text-red" : ""}>
                    {data.email}
                    {data.errorMessages?.includes("Duplicate email") && <p className="text-xs text-red">Duplicate email</p>}
                  </div>
                ),
              },
              {
                key: "contactNumber",
                header: "Contact Number",
                render: (data) => <span className={!data.isValid ? "text-red" : ""}>{data.contactNumber}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (data) =>
                  data.isValid ? (
                    <span className="text-green text-sm font-medium">Valid</span>
                  ) : (
                    <span className="text-red text-sm font-medium">{data.errorMessages?.join(", ")}</span>
                  ),
              },
            ]}
          />
        </div>
      )}

      {parsedData.some((data) => data.isValid) && (
        <Button onClick={handleSubmit} disabled={isParsing || bulkCreate.isPending}>
          Create Account
        </Button>
      )}
    </>
  );
};

export default BulkDistributorCreation;
