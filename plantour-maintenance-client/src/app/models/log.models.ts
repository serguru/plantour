export interface LogRowDto {
  id: string;
  createdAt: string;
  severity: string;
  category: string;
  message: string;
  userId?: string | null;
  properties: string;
}