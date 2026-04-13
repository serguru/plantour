export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
}
