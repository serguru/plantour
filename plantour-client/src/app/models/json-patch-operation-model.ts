export interface JsonPatchOperation {
  op: string;
  path: string;
  value?: any;
}

export interface QueuedPatch {
  id: string;                 // UUID
  endpoint: string;           // API endpoint (example: /api/tours/{id}/patch)
  expectedVersion: number;    // Version for optimistic concurrency
  operations: JsonPatchOperation[];
  createdAt: number;
}
