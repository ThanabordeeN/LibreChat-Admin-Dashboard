export interface User {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
