import type { Department } from "./department";

export type UserRole = "distributor" | "head" | "trainer";

export interface DistributorTypes {
  name: string;
  id: number;
  haveCommision: boolean;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  createdAt: Date;
  isArchived: boolean;
  isDefaultPassword: boolean;
  department?: Department;
}

export interface Distributor extends User {
  role: ["distributor"];
  password: string;
  distributor: {
    contactNumber: string;
    department?: {
      departmentId: string;
      name: string;
    };
    distributorType: DistributorTypes;
  };
}
