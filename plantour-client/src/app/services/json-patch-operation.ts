export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: any;
}
