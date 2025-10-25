export interface Department {
  name: string;
  logoUrl: string;
  departmentId: string;
  totalShows: number;
  totalMembers: number;
  trainers: {
    trainerId: string;
    trainerName: string;
  }[];
}
