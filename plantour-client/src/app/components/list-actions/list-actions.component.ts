import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CapitalizeFirstPipe } from '../../pipes/capitalize-first.pipe';
import { InputGroupModule } from 'primeng/inputgroup';

export type SortType = 'string' | 'number' | 'none';

export interface ListActionsPropertyConfig {
  filter?: boolean;
  sorting?: SortType;
  lookupIcon?: string;
}

export interface ListActionsConfigItem {
  property: string;
  label: string;
  config: ListActionsPropertyConfig;
}

type ModeType = 'lookup' | 'filter' | 'sort';

interface ModeOption {
  type: ModeType;
  label: string;
  icon: string;
  property?: string;
}

@Component({
  selector: 'app-list-actions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectModule, InputTextModule, 
    ButtonModule, PanelModule, CapitalizeFirstPipe, InputGroupModule],
  templateUrl: './list-actions.component.html',
  styleUrl: './list-actions.component.scss'
})
export class ListActionsComponent implements OnChanges, OnInit {
  @Input() items: any[] | null = null;
  @Input() config: ListActionsConfigItem[] | null = null;

  /**
   * Emits a new processed list (filtered, sorted, with highlighted matches)
   * every time user changes any condition.
   */
  @Output() listChanged = new EventEmitter<any>();

  modeOptions: ModeOption[] = [];
  selectedMode: ModeOption | null = null;

  /**
   * Active lookup filters: property -> selected value
   */
  lookupValues: Record<string, string | null> = {};

  /**
   * Text filter (applied to all properties with filter = true)
   */
  filterText = '';

  /**
   * Sorting
   */
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' | 'none' = 'none';

  /**
   * Metadata derived from config
   */
  filterableProperties: string[] = [];
  sortableProperties: { label: string; value: string }[] = [];
  sortDirectionOptions = [
    { icon: 'pi pi-sort-up', label: "Ascending", value: 'asc' },
    { icon: 'pi pi-sort-down', label: "Descending", value: 'desc' },
    { icon: 'pi pi-minus', label: "No sorting", value: 'none' }
  ];

  lookupConfigByProp: Record<string, ListActionsPropertyConfig> = {};

  /**
   * Last processed list for local display (e.g. item count)
   */
  currentResult: any[] = [];

  get firstSortingProperty(): string | null {
    const sortProp = this.config?.find(c => c.config.sorting && c.config.sorting !== 'none');
    return sortProp ? sortProp.property : null;
  }

  ngOnInit(): void {
    this.sortField = this.firstSortingProperty;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.normalizeConfig();
      this.buildMetadata();
      this.buildModeOptions();
    }

    if (changes['items']) {
      // always work from latest @Input items
    }

    this.applyAll();
  }

  /**
   * Normalizes configuration:
   * - converts 'true'/'false' to booleans
   * - converts 'text' to 'string'
   * - parses lookup-list from string to array if needed
   */
  private normalizeConfig(): void {
    this.config = (this.config || []).map(c => {
      const normalized: ListActionsConfigItem = {
        property: c.property,
        label: c.label,
        config: { ...(c.config || {}) }
      };

      // normalize filter
      const rawFilter: any = (c.config as any)?.filter;
      if (rawFilter !== undefined) {
        if (typeof rawFilter === 'string') {
          normalized.config.filter = rawFilter.toLowerCase() === 'true';
        } else {
          normalized.config.filter = !!rawFilter;
        }
      }

      // normalize sorting
      const rawSorting: any = (c.config as any)?.sorting;
      if (rawSorting) {
        const v = String(rawSorting).toLowerCase();
        if (v === 'text' || v === 'string') {
          normalized.config.sorting = 'string';
        } else if (v === 'number') {
          normalized.config.sorting = 'number';
        } else {
          normalized.config.sorting = 'none';
        }
      } else {
        normalized.config.sorting = 'none';
      }

      // normalize lookup icon (may come as 'lookup-icon')
      const rawLookupIcon: any = (c.config as any)['lookup-icon'] ?? (c.config as any)?.lookupIcon;
      if (rawLookupIcon) {
        normalized.config.lookupIcon = String(rawLookupIcon);
      }

      return normalized;
    });
  }

  private buildMetadata(): void {
    if (!this.config) {
      this.filterableProperties = [];
      this.sortableProperties = [];
    }
    this.filterableProperties = this.config!
      .filter(c => !!c.config.filter)
      .map(c => c.property);

    this.sortableProperties = this.config!
      .filter(c => c.config.sorting && c.config.sorting !== 'none')
      .map(c => ({ label: c.label, value: c.property }));

    this.lookupConfigByProp = {};
    this.lookupValues = {};

    this.config!.forEach(c => {
      this.lookupConfigByProp[c.property] = c.config;
      // if (c.config.lookupList && c.config.lookupList.length) {
      //   this.lookupValues[c.property] = null;
      // }
    });
  }

  private buildModeOptions(): void {
    const options: ModeOption[] = [];

    // 1. lookup icons first
    this.config?.forEach(c => {
      //      if (c.config.lookupList && c.config.lookupList.length && c.config.lookupIcon) {
      if (c.config.lookupIcon) {
        options.push({
          type: 'lookup',
          label: c.label,
          property: c.property,
          icon: `pi pi-${c.config.lookupIcon}`
        });
      }
    });

    // 2. filter icon (if at least one filterable property)
    if (this.filterableProperties.length) {
      options.push({
        type: 'filter',
        label: 'Filter',
        icon: 'pi pi-filter'
      });
    }

    // 3. sort icon (if at least one sortable property)
    if (this.sortableProperties.length) {
      options.push({
        type: 'sort',
        label: 'Sort',
        icon: 'pi pi-sort-alt'
      });
    }

    this.modeOptions = options;
    if (!this.selectedMode && this.modeOptions.length) {
      this.selectedMode = this.modeOptions[0];
    }
  }


  getLookupValues(property: string): string[] | null {
    const strings = this.items?.map((x => (x[property] || '').toString()));
    if (!strings) {
      return null;
    }
    const unique = Array.from(new Set(strings));
    if (!unique) {
      return null;
    }
    const sorted = unique.sort((a, b) => a.localeCompare(b));
    return sorted;
  }


  getLookupOptions(property: string) {
    const conf = this.lookupConfigByProp[property];
    //    if (!conf?.lookupList) {
    const list = this.getLookupValues(property);
    if (!list) {
      return [];
    }
    return list.map((v) => ({ label: v, value: v }));
  }

  onLookupChange(property: string): void {
    this.applyAll();
  }

  onFilterTextChange(): void {
    this.applyAll();
  }

  onSortChange(): void {
    this.applyAll();
  }


  get isSortingActive(): boolean {
    const isSortingActive = this.sortField !== null && this.sortDirection !== 'none';
    return isSortingActive;
  }

  get isFilterActive(): boolean {
    const isTextFilterActive = this.filterText?.trim().length ? true : false;
    return isTextFilterActive;
  }


  isFeatureActive(option: ModeOption): boolean {
    switch (option.type) {
      case 'lookup':
        const lookupValue = this.lookupValues[option.property!];
        return lookupValue !== null && lookupValue !== undefined && lookupValue !== '';
      case 'filter':
        return this.isFilterActive;
      case 'sort':
        return this.isSortingActive;
      default:
        return false;
    }
  }

  get isAnyFeatureActive(): boolean {
    if (this.isFilterActive || this.isSortingActive) {
      return true;
    }

    const result: boolean = this.lookupValues && Object.values(this.lookupValues).find(x => x !== null && x !== undefined && x !== '') !== undefined;
    return result;

  }

  resetAll(): void {
    Object.keys(this.lookupValues).forEach((prop) => {
      this.lookupValues[prop] = null;
    });
    this.filterText = '';
    this.sortField = this.firstSortingProperty;
    this.sortDirection = 'none';
    this.applyAll();
  }

  private applyAll(): void {
    if (!this.items || !Array.isArray(this.items)) {
      this.currentResult = [];
      this.listChanged.emit(
        {
          "processedEntities": [],
          isAnyFeatureActive: this.isAnyFeatureActive
        }
      );
      return;
    }

    // 1. filtering (lookup + text)
    let working = this.items.filter(
      (item) => this.matchesLookup(item) && this.matchesTextFilter(item)
    );

    // 2. sorting
    working = this.sortItems(working);

    // 3. highlight matches in filterable properties
    const projected = this.highlightResults(working);

    this.currentResult = projected;
    this.listChanged.emit(
      {
        "processedEntities": projected,
        isAnyFeatureActive: this.isAnyFeatureActive
      }
    );
  }

  private matchesLookup(item: any): boolean {
    for (const prop of Object.keys(this.lookupValues)) {
      const expected = this.lookupValues[prop];
      const actual = item?.[prop];
      if (expected !== null && expected !== undefined && expected !== '') {
        if (String(actual) !== String(expected)) {
          return false;
        }
      } else {
        if (!(!actual && !expected)) {
          return false;
        }
      }
    }
    return true;
  }

  private matchesTextFilter(item: any): boolean {
    const query = this.filterText?.trim();
    if (!query) {
      return true;
    }
    const lowerQuery = query.toLowerCase();

    // "OR" across filterable properties, but combined with lookup by AND (via applyAll)
    return this.filterableProperties.some((prop) => {
      const value = item?.[prop];
      if (value === null || value === undefined) {
        return false;
      }
      const text = String(value).toLowerCase();
      return text.includes(lowerQuery);
    });
  }

  private sortItems(items: any[]): any[] {
    if (!this.sortField || this.sortDirection === 'none') {
      return [...items];
    }

    const configItem = this.config?.find(c => c.property === this.sortField);
    const sortType: SortType = configItem?.config.sorting || 'string';
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      const va = a?.[this.sortField!];
      const vb = b?.[this.sortField!];

      if (sortType === 'number') {
        const na = parseFloat(va);
        const nb = parseFloat(vb);
        if (isNaN(na) && isNaN(nb)) {
          return 0;
        }
        if (isNaN(na)) {
          return -1 * direction;
        }
        if (isNaN(nb)) {
          return 1 * direction;
        }
        return (na - nb) * direction;
      }

      const sa = (va ?? '').toString().toLowerCase();
      const sb = (vb ?? '').toString().toLowerCase();
      return sa.localeCompare(sb) * direction;
    });
  }

  private highlightResults(items: any[]): any[] {
    const query = this.filterText?.trim();
    if (!query) {
      return items.map((i) => ({ ...i }));
    }

    return items.map((item) => {
      const clone: any = { ...item };
      this.filterableProperties.forEach((prop) => {
        const value = item?.[prop];
        if (value === null || value === undefined) {
          return;
        }
        const asString = String(value);
        clone[prop] = this.highlightMatch(asString, query);
      });
      return clone;
    });
  }

  private highlightMatch(value: string, query: string): string {
    if (!query) {
      return value;
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    return value.replace(regex, (match) => `<mark>${match}</mark>`);
  }
}
