import type { Department } from "./department";

export type UserRole = "distributor" | "head" | "trainer";

export type DistributorTypes = "cca" | "FOH" | "faculty" | "visitor" | "ticketBooth";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  createdAt: Date;
  isArchived: boolean;
  isDefaultPassword: boolean;
  departments: Department[];
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

export const distributorTypeOptions: { name: string; value: DistributorTypes }[] = [
  { name: "CCA Member", value: "cca" },
  { name: "Front of House", value: "FOH" },
  { name: "Ticket Booth", value: "ticketBooth" },
  { name: "Faculty", value: "faculty" },
  { name: "Visitor", value: "visitor" },
];
