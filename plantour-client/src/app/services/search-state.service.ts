import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private _pendingEntityId: string | null = null;

  setPendingScroll(entityId: string): void {
    this._pendingEntityId = entityId;
  }

  consumePendingScroll(): string | null {
    const id = this._pendingEntityId;
    this._pendingEntityId = null;
    return id;
  }
}
