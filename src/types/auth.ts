export interface LoginPayload {
  email: string;
  password: string;
  expectedRole: "cca" | "distributor";
}
