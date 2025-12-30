import { User } from "./user.model";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}