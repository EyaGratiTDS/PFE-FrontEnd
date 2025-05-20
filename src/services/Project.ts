export interface Project {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    color: string;
    status: 'active' | 'archived' | 'pending';
    userId: number;
    isDisabled?: boolean;
    createdAt?: Date; 
    updatedAt?: Date;
  }