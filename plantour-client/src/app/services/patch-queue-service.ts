import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { JsonPatchOperation, QueuedPatch } from '../models/json-patch-operation-model';
import { JsonPatchService } from './json-patch-service';

@Injectable({ providedIn: 'root' })
export class PatchQueueService {
  private db!: IDBPDatabase;
  private readonly DB_NAME = 'plantour-sync';
  private readonly STORE = 'patches';
  private syncInProgress = false;

  constructor(
    private http: HttpClient,
    private patchBuilder: JsonPatchService
  ) {
    this.initDB().then(() => this.processQueue());
    this.setupTriggers();
  }

  /** Initialize IndexedDB */
  private async initDB() {
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('patches')) {
          db.createObjectStore('patches', { keyPath: 'id' });
        }
      }
    });
  }

  /** Queue a patch */
  async enqueue(endpoint: string, expectedVersion: number, operations: JsonPatchOperation[]) {
    const patch: QueuedPatch = {
      id: uuidv4(),
      endpoint,
      expectedVersion,
      operations,
      createdAt: Date.now()
    };

    await this.db.put(this.STORE, patch);
    this.processQueue();
  }

  /** Try to process the queue */
  async processQueue() {
    if (this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      const tx = this.db.transaction(this.STORE, 'readwrite');
      const store = tx.store;

      let cursor = await store.openCursor();

      while (cursor) {
        const patch = cursor.value as QueuedPatch;

        try {
          await this.http.post(patch.endpoint, {
            expectedVersion: patch.expectedVersion,
            operations: patch.operations
          }).toPromise();

          await cursor.delete();
        } catch (error) {
          break; // stop processing
        }

        cursor = await cursor.continue();
      }

      await tx.done;
    } finally {
      this.syncInProgress = false;
    }
  }

  /** Create patch and immediately enqueue */
  createAndQueuePatch(
    endpoint: string,
    expectedVersion: number,
    original: any,
    updated: any
  ) {
    const ops = this.patchBuilder.buildPatch(original, updated);
    return this.enqueue(endpoint, expectedVersion, ops);
  }

  /** Set up automatic triggers */
  private setupTriggers() {
    // Retry when connection restored
    window.addEventListener('online', () => this.processQueue());

    // Retry when user returns to the tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.processQueue();
    });

    // Retry every 10 seconds
    setInterval(() => this.processQueue(), 10000);
  }
}
