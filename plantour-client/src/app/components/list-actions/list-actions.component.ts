import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';

export interface PropertyConfig {
  property: string;
  icon?: string;
  config: {
    lookup?: boolean;
    lookupList?: string[];
    filter?: boolean;
    sorting?: 'string' | 'number' | 'none';
  };
}

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-list-actions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    InputTextModule
  ],
  templateUrl: './list-actions.component.html',
  styleUrls: ['./list-actions.component.scss']
})
export class ListActionsComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() configuration: PropertyConfig[] = [];
  @Output() dataChanged = new EventEmitter<any>();

  lookupProperties: PropertyConfig[] = [];
  hasFilterableProperties = false;
  hasSortableProperties = false;
  sortableProperties: SortOption[] = [];

  lookupValues: { [key: string]: any } = {};
  filterText = '';
  sortBy = '';
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  selectedFeature: string = '';
  featureOptions: Array<{ label: string; value: string; icon: string; hasFilter: boolean }> = [];

  sortOrderOptions: SortOption[] = [
    { label: '—', value: 'none' },
    { label: '↑', value: 'asc' },
    { label: '↓', value: 'desc' }
  ];

  ngOnInit(): void {
    this.processConfiguration();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['configuration'] && !changes['configuration'].firstChange) {
      this.processConfiguration();
    }
    if (changes['data'] || changes['configuration']) {
      this.applyFiltersAndSort();
    }
  }

  private processConfiguration(): void {
    this.lookupProperties = this.configuration.filter(
      config => config.config.lookup === true
    );

    this.hasFilterableProperties = this.configuration.some(
      config => config.config.filter === true
    );

    this.hasSortableProperties = this.configuration.some(
      config => config.config.sorting && config.config.sorting !== 'none'
    );

    this.sortableProperties = this.configuration
      .filter(config => config.config.sorting && config.config.sorting !== 'none')
      .map(config => ({
        label: this.capitalizeFirst(config.property),
        value: config.property
      }));

    // Initialize sortBy with first sortable property if not set
    if (this.hasSortableProperties && !this.sortBy && this.sortableProperties.length > 0) {
      this.sortBy = this.sortableProperties[0].value;
    }

    this.lookupProperties.forEach(prop => {
      if (!this.lookupValues[prop.property]) {
        this.lookupValues[prop.property] = null;
      }
    });

    // Build feature options for the select
    this.featureOptions = [];
    
    this.lookupProperties.forEach((prop, index) => {
      this.featureOptions.push({
        label: this.capitalizeFirst(prop.property),
        value: `lookup_${index}`,
        icon: prop.icon || 'pi pi-filter',
        hasFilter: this.isLookupFilterActive(prop.property)
      });
    });

    if (this.hasFilterableProperties) {
      this.featureOptions.push({
        label: 'Filter Text',
        value: 'filter_text',
        icon: 'pi pi-search',
        hasFilter: this.filterText !== null && this.filterText !== ''
      });
    }

    if (this.hasSortableProperties) {
      this.featureOptions.push({
        label: 'Sorting',
        value: 'sorting',
        icon: 'pi pi-sort-alt',
        hasFilter: this.sortOrder !== 'none'
      });
    }

    // Select first feature by default
    if (this.featureOptions.length > 0 && !this.selectedFeature) {
      this.selectedFeature = this.featureOptions[0].value;
    }
  }

  private isLookupFilterActive(property: string): boolean {
    return this.lookupValues[property] !== null && 
           this.lookupValues[property] !== undefined && 
           this.lookupValues[property] !== '';
  }

  updateFeatureFilterStatus(): void {
    this.featureOptions = this.featureOptions.map(option => {
      if (option.value.startsWith('lookup_')) {
        const index = parseInt(option.value.split('_')[1]);
        const prop = this.lookupProperties[index];
        return { ...option, hasFilter: this.isLookupFilterActive(prop.property) };
      } else if (option.value === 'filter_text') {
        return { ...option, hasFilter: this.filterText !== null && this.filterText !== '' };
      } else if (option.value === 'sorting') {
        return { ...option, hasFilter: this.sortOrder !== 'none' };
      }
      return option;
    });
  }

  getSelectedLookupProperty(): PropertyConfig | null {
    if (this.selectedFeature.startsWith('lookup_')) {
      const index = parseInt(this.selectedFeature.split('_')[1]);
      return this.lookupProperties[index];
    }
    return null;
  }

  isFeatureActive(featureValue: string): boolean {
    if (featureValue.startsWith('lookup_')) {
      const index = parseInt(featureValue.split('_')[1]);
      const prop = this.lookupProperties[index];
      return this.isLookupFilterActive(prop.property);
    } else if (featureValue === 'filter_text') {
      return this.filterText !== null && this.filterText !== '';
    } else if (featureValue === 'sorting') {
      return this.sortOrder !== 'none';
    }
    return false;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getLookupOptions(property: string): any[] {
    const config = this.configuration.find(c => c.property === property);
    if (config && config.config['lookup-list']) {
      return config.config['lookup-list'].map(value => ({
        label: value,
        value: value
      }));
    }
    return [];
  }

  onLookupChange(): void {
    this.updateFeatureFilterStatus();
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.updateFeatureFilterStatus();
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.updateFeatureFilterStatus();
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let result = [...this.data];

    // Apply lookup filters
    Object.keys(this.lookupValues).forEach(key => {
      const value = this.lookupValues[key];
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key];
          if (typeof itemValue === 'string' && typeof value === 'string') {
            return itemValue.toLowerCase() === value.toLowerCase();
          }
          return itemValue == value;
        });
      }
    });

    // Apply text filter
    if (this.filterText && this.filterText.trim() !== '') {
      const filterLower = this.filterText.toLowerCase();
      const filterableProps = this.configuration
        .filter(config => config.config.filter === true)
        .map(config => config.property);

      result = result.filter(item => {
        return filterableProps.some(prop => {
          const value = item[prop];
          if (value !== null && value !== undefined) {
            return String(value).toLowerCase().includes(filterLower);
          }
          return false;
        });
      });
    }

    // Apply sorting
    if (this.sortBy && this.sortOrder !== 'none') {
      const sortConfig = this.configuration.find(c => c.property === this.sortBy);
      if (sortConfig) {
        const sortType = sortConfig.config.sorting;
        result.sort((a, b) => {
          const aVal = a[this.sortBy];
          const bVal = b[this.sortBy];

          let comparison = 0;
          
          if (sortType === 'number') {
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            comparison = aNum - bNum;
          } else {
            // string or text
            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();
            comparison = aStr.localeCompare(bStr);
          }

          return this.sortOrder === 'asc' ? comparison : -comparison;
        });
      }
    }

    this.dataChanged.emit({
      "data": JSON.parse(JSON.stringify(result)),
      "filterText": this.filterText
    });
  }

  resetFilters(): void {
    Object.keys(this.lookupValues).forEach(key => {
      this.lookupValues[key] = null;
    });
    this.filterText = '';
    this.sortBy = this.sortableProperties.length > 0 ? this.sortableProperties[0].value : '';
    this.sortOrder = 'none';
    this.selectedFeature = this.featureOptions.length > 0 ? this.featureOptions[0].value : '';
    this.updateFeatureFilterStatus();
    this.applyFiltersAndSort();
  }
}
