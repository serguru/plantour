import { Injectable } from '@angular/core';
import { compare, Operation } from 'fast-json-patch';

/**
 * DTO compatible with your .NET API.
 */
export interface JsonPatchOperation {
  op: string;
  path: string;
  value?: any;
}

@Injectable({
  providedIn: 'root'
})
export class JsonPatchService {

  /**
   * Builds RFC 6902 JSON Patch operations for the server.
   */
  public buildPatch(original: any, updated: any): JsonPatchOperation[] {

    const patches: Operation[] = compare(original, updated);

    return patches.map(p => {
      // Every JSON Patch operation must have "op" and "path"
      const op: JsonPatchOperation = {
        op: p.op,
        path: p.path
      };

      // Only certain operations include a "value" property
      if ('value' in p) {
        op.value = (p as any).value;
      }

      return op;
    });
  }
}
