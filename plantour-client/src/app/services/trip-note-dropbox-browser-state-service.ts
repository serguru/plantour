import { Injectable } from '@angular/core';
import { DropboxBrowseEntryDto } from './dropbox-service';

export interface TripNoteDropboxBrowserDraft {
  returnUrl: string;
  title: string;
  tripActivityId: string | null;
  contentJson: string | null;
  pendingSelection: DropboxBrowseEntryDto | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripNoteDropboxBrowserStateService {
  private readonly drafts = new Map<string, TripNoteDropboxBrowserDraft>();

  saveDraft(contextId: string, draft: TripNoteDropboxBrowserDraft): void {
    this.drafts.set(contextId, draft);
  }

  hasDraft(contextId: string | null): boolean {
    return !!contextId && this.drafts.has(contextId);
  }

  takeDraft(contextId: string | null): TripNoteDropboxBrowserDraft | null {
    if (!contextId) {
      return null;
    }

    const draft = this.drafts.get(contextId) ?? null;
    if (draft) {
      this.drafts.delete(contextId);
    }

    return draft;
  }

  updatePendingSelection(contextId: string | null, entry: DropboxBrowseEntryDto): void {
    if (!contextId) {
      return;
    }

    const draft = this.drafts.get(contextId);
    if (!draft) {
      return;
    }

    this.drafts.set(contextId, {
      ...draft,
      pendingSelection: entry,
    });
  }

  clearDraft(contextId: string | null): void {
    if (!contextId) {
      return;
    }

    this.drafts.delete(contextId);
  }
}