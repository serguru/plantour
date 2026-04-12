export interface LogRowDto {
  id: number;
  timeStamp: string;
  level?: string | null;
  eventType?: string | null;
  subtype?: string | null;
  messageTemplate?: string | null;
  exception?: string | null;
}