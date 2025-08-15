import type { Department } from "./department";

export type UserRole = "distributor" | "head" | "trainer";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  distributor?: {
    contactNumber: string;
    department: { name: string; departmentId: string };
    distributortypes: { id: number; name: string };
  };
  department?: Department;
}

export interface Trainer {
  department?: {
    departmentId: string;
    name: string;
  };
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  isArchived: boolean;
  isLocked: boolean;
  role: "trainer";
}

export interface DistributorTypes {
  name: string;
  id: number;
  haveCommision: boolean;
}

export interface Distributor {
  distributor: {
    department?: {
      departmentId: string;
      name: string;
    };
    distributortypes: DistributorTypes;
    contactNumber: string;
  };
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt: Date;
  isArchived: boolean;
  isLocked: boolean;
  role: "distributor";
}
