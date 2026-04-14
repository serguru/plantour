export interface SettingRowDto {
  key: string;
  value: string;
  valueType: SettingValueType;
  notes: string | null;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  value: string;
  valueType: SettingValueType;
  notes: string | null;
}

export type SettingValueType = 'string' | 'integer' | 'boolean';