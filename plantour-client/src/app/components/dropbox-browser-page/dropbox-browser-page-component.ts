import { Component, DestroyRef, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter } from 'rxjs';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { EntitiesHeader, HeaderButtonConfig, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { Condition } from '../../services/dynamic-query-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';
import { DropboxBrowseEntryDto, DropboxBrowseResultDto, DropboxService } from '../../services/dropbox-service';
import { DropboxBrowserItemComponent } from './dropbox-browser-item/dropbox-browser-item-component';
import { TripNoteDropboxBrowserStateService } from '../../services/trip-note-dropbox-browser-state-service';
import { getMessageFromError } from '../../helpers/utils';

@Component({
  selector: 'app-dropbox-browser-page',
  standalone: true,
  imports: [EntitiesComponent, EntitiesActionsComponent, EntitiesHeader, RouterLink],
  templateUrl: './dropbox-browser-page-component.html',
  styleUrl: './dropbox-browser-page-component.scss',
})
export class DropboxBrowserPageComponent implements OnInit {
  private static readonly missingDropboxKeyPrefix = "Active 'dropbox' key not found.";

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly componentService = inject(ComponentService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dropboxService = inject(DropboxService);
  private readonly messagesService = inject(MessagesService);
  private readonly stateService = inject(TripNoteDropboxBrowserStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly componentId = 'dropbox-browser';
  readonly itemComponent = DropboxBrowserItemComponent;

  browseResult: DropboxBrowseResultDto | null = null;
  loadError = '';
  missingDropboxKey = false;

  private readonly previewUrls = new Map<string, string>();
  private readonly previewLoadingIds = new Set<string>();
  private readonly previewErrorTexts = new Map<string, string>();
  private readonly previewVisibleIds = new Set<string>();
  private previewGeneration = 0;

  currentPath = '';
  returnUrl = '';
  contextId = '';

  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Name',
      icon: 'sort-alt',
      property: 'name',
      sortType: 'text',
      direction: 'none',
    },
    {
      kind: 'filter',
      label: 'Filter by Name',
      icon: 'filter',
      property: 'name',
      filterText: '',
      comparisonType: 'contains',
    },
    {
      kind: 'filter',
      label: 'Filter by Path',
      icon: 'filter',
      property: 'pathDisplay',
      filterText: '',
      comparisonType: 'contains',
    },
  ];

  menuItems = computed<MenuConfig[]>(() => []);
  headerButtons = computed<HeaderButtonConfig[]>(() => {
    const buttons: HeaderButtonConfig[] = [];

    if (this.canReturnToNote) {
      buttons.push({
        label: 'To Note',
        icon: 'arrow-left',
        action: () => this.returnToNote(),
        disabled: false,
      });
    }

    buttons.push(
      {
        label: 'Up',
        icon: 'arrow-up',
        action: () => this.goToParent(),
        disabled: !this.browseResult?.parentPath,
      },
      {
        label: 'Refresh',
        icon: 'refresh',
        action: () => this.refresh(),
        disabled: false,
      }
    );

    return buttons;
  });

  itemMetaData = {
    openFolder: (entity: DropboxBrowseEntryDto) => this.openFolder(entity),
    isPreviewVisible: (id: string) => this.previewVisibleIds.has(id),
    getPreviewUrl: (id: string) => this.previewUrls.get(id) ?? '',
    isPreviewLoading: (id: string) => this.previewLoadingIds.has(id),
    getPreviewError: (id: string) => this.previewErrorTexts.get(id) ?? '',
    isSubmitVisible: (entity: DropboxBrowseEntryDto) => this.isSubmitVisible(entity),
    submit: (entity: DropboxBrowseEntryDto) => this.submit(entity),
  };

  get canReturnToNote(): boolean {
    return !!this.returnUrl && !!this.contextId && this.stateService.hasDraft(this.contextId);
  }

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);
    this.initConditions();
    this.initSavedFeatures([]);

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.returnUrl = params.get('returnUrl') ?? '';
      this.contextId = params.get('contextId') ?? '';
      this.load(params.get('path'));
    });

    combineLatest([this.componentService.selectedId$, this.componentService.entities$])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(([selectedId]) => !!selectedId),
      )
      .subscribe(([selectedId, entities]) => {
        const entity = (entities ?? []).find((item) => item?.id === selectedId) as DropboxBrowseEntryDto | undefined;
        if (entity?.type === 'file') {
          void this.ensurePreview(entity);
        }
      });
  }

  goToParent(): void {
    const parentPath = this.browseResult?.parentPath ?? null;
    this.navigateToPath(parentPath);
  }

  refresh(): void {
    this.load(this.currentPath || null);
  }

  openFolder(entry: DropboxBrowseEntryDto): void {
    this.navigateToPath(entry.pathDisplay ?? null);
  }

  private navigateToPath(path: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        path: path || null,
        returnUrl: this.returnUrl || null,
        contextId: this.contextId || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private load(path: string | null): void {
    this.clearPreviewState();
    this.loadError = '';
    this.missingDropboxKey = false;
    const currentGeneration = ++this.previewGeneration;

    this.dropboxService.browse(path).subscribe({
      next: (result) => {
        if (currentGeneration !== this.previewGeneration) {
          return;
        }

        this.browseResult = result;
        this.currentPath = result.currentPath ?? '';
        this.componentService.updateEntities(result.entries ?? []);
        this.initSavedFeatures(result.entries ?? []);
      },
      error: (error) => {
        if (currentGeneration !== this.previewGeneration) {
          return;
        }

        this.browseResult = null;
        this.componentService.updateEntities([]);
        const errorMessage = getMessageFromError(error, 'Unable to load Dropbox images.');
        this.missingDropboxKey = this.isMissingDropboxKeyError(errorMessage);
        this.loadError = this.missingDropboxKey
          ? 'To add images from Dropbox, add an active dropbox key in your Keys first.'
          : errorMessage;
        this.messagesService.showError('Dropbox', this.loadError);
      },
    });
  }

  private isMissingDropboxKeyError(message: string): boolean {
    return message.startsWith(DropboxBrowserPageComponent.missingDropboxKeyPrefix);
  }

  private async ensurePreview(entity: DropboxBrowseEntryDto): Promise<void> {
    if (!entity.id || entity.type !== 'file') {
      return;
    }

    this.previewVisibleIds.add(entity.id);
    if (this.previewUrls.has(entity.id) || this.previewLoadingIds.has(entity.id) || this.previewErrorTexts.has(entity.id)) {
      return;
    }

    const source = entity.source?.trim() ?? '';
    if (!source) {
      this.previewErrorTexts.set(entity.id, 'This Dropbox image cannot be selected.');
      return;
    }

    const currentGeneration = this.previewGeneration;
    this.previewLoadingIds.add(entity.id);
    this.dropboxService.getImage(source).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        if (currentGeneration !== this.previewGeneration) {
          return;
        }

        this.previewLoadingIds.delete(entity.id!);
        this.previewErrorTexts.delete(entity.id!);
        this.previewUrls.set(entity.id!, URL.createObjectURL(blob));
      },
      error: (error) => {
        if (currentGeneration !== this.previewGeneration) {
          return;
        }

        this.previewLoadingIds.delete(entity.id!);
        this.previewErrorTexts.set(entity.id!, getMessageFromError(error, 'Unable to load Dropbox image preview.'));
      },
    });
  }

  private isSubmitVisible(entity: DropboxBrowseEntryDto): boolean {
    return this.canReturnToNote
      && entity.type === 'file'
      && !!entity.id
      && this.selectedId() === entity.id
      && this.previewUrls.has(entity.id)
      && !this.previewLoadingIds.has(entity.id)
      && !this.previewErrorTexts.has(entity.id);
  }

  submit(entity: DropboxBrowseEntryDto): void {
    if (!this.canReturnToNote) {
      return;
    }

    this.stateService.updatePendingSelection(this.contextId, entity);
    void this.navigateBackToNote();
  }

  returnToNote(): void {
    if (!this.canReturnToNote) {
      return;
    }

    void this.navigateBackToNote();
  }

  private initConditions(): void {
    const savedConditions = this.localStorageService.getComponentKeyObject(this.componentId, 'conditions') || [];
    const initialConditions = this.componentService.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  private initSavedFeatures(items: DropboxBrowseEntryDto[]): void {
    const entitiesActionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(entitiesActionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items.find((x) => x.id === id)) {
      id = null;
    }

    this.componentService.updateSelectedId(id);
  }

  private clearPreviewState(): void {
    ++this.previewGeneration;
    this.previewLoadingIds.clear();
    this.previewErrorTexts.clear();
    this.previewVisibleIds.clear();
    for (const url of this.previewUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.previewUrls.clear();
  }

  private navigateBackToNote(): Promise<boolean> {
    const separator = this.returnUrl.includes('?') ? '&' : '?';
    return this.router.navigateByUrl(`${this.returnUrl}${separator}dropboxContextId=${encodeURIComponent(this.contextId)}`);
  }
}