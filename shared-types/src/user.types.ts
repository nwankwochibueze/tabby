export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}