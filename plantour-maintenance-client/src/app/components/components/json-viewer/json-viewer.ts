import { Component, Input, computed, signal, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface JsonNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  expanded: boolean;
  depth: number;
  path: string;
  children?: JsonNode[];
  parent?: JsonNode;
  searchMatch: boolean;
}

@Component({
  selector: 'app-json-viewer',
  imports: [CommonModule, FormsModule],
  templateUrl: './json-viewer.html',
  styleUrl: './json-viewer.css',
})
export class JsonViewer implements OnChanges {
  @Input() jsonData: string | null = '';
  @Input() searchTerm: string = '';

  private parsedData = signal<any>(null);
  private treeNodes = signal<JsonNode[]>([]);
  private allExpanded = signal<boolean>(false);
  private isLoading = signal<boolean>(false);
  
  protected searchInput = signal<string>('');
  protected summary = computed(() => this.calculateSummary());
  protected hasSummary = computed(() => {
    const s = this.summary();
    return s && Object.keys(s).length > 0;
  });
  protected summaryEntries = computed(() => {
    const s = this.summary();
    if (!s) return [];
    return Object.entries(s).map(([key, value]) => ({ key, value }));
  });
  
  protected readonly nodes = computed(() => this.treeNodes());
  protected readonly isAllExpanded = computed(() => this.allExpanded());
  protected readonly isProcessing = computed(() => this.isLoading());

  constructor() {
    effect(() => {
      const search = this.searchInput();
      if (search) {
        this.applySearch(search);
      } else {
        this.clearSearch();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jsonData']) {
      // Use setTimeout to defer processing and prevent UI blocking
      setTimeout(() => {
        this.parseJsonData();
      }, 0);
    }
    if (changes['searchTerm']) {
      this.searchInput.set(this.searchTerm);
    }
  }

  private parseJsonData(): void {
    try {
      if (!this.jsonData) {
        this.parsedData.set(null);
        this.treeNodes.set([]);
        this.isLoading.set(false);
        return;
      }
      
      console.log('Starting JSON parsing...');
      const startTime = performance.now();
      this.isLoading.set(true);
      
      const parsed = JSON.parse(this.jsonData);
      this.parsedData.set(parsed);
      
      // Build tree asynchronously to prevent UI blocking
      setTimeout(() => {
        try {
          const treeStartTime = performance.now();
          const tree = this.buildTree('root', parsed, 0);
          const treeEndTime = performance.now();
          
          console.log(`Tree built in ${treeEndTime - treeStartTime}ms`);
          this.treeNodes.set(tree);
          this.allExpanded.set(false);
          
          const endTime = performance.now();
          console.log(`Total JSON processing time: ${endTime - startTime}ms`);
        } catch (treeError) {
          console.error('Error building tree:', treeError);
          this.treeNodes.set([]);
        } finally {
          this.isLoading.set(false);
        }
      }, 0);
      
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      this.parsedData.set(null);
      this.treeNodes.set([]);
      this.isLoading.set(false);
    }
  }

  private buildTree(key: string, value: any, depth: number, parent?: JsonNode): JsonNode[] {
    const nodes: JsonNode[] = [];
    
    if (value === null || value === undefined) {
      nodes.push({
        key,
        value: null,
        type: 'null',
        expanded: false,
        depth,
        path: parent ? `${parent.path}.${key}` : key,
        parent,
        searchMatch: false
      });
    } else if (Array.isArray(value)) {
      // For large arrays, only create children for first few items initially
      const node: JsonNode = {
        key,
        value: value,
        type: 'array',
        expanded: false,
        depth,
        path: parent ? `${parent.path}.${key}` : key,
        parent,
        searchMatch: false,
        children: []
      };
      
      // Limit initial children to prevent performance issues
      const maxInitialChildren = 50;
      const totalItems = value.length;
      
      if (totalItems <= maxInitialChildren) {
        value.forEach((item, index) => {
          const childNodes = this.buildTree(`[${index}]`, item, depth + 1, node);
          node.children!.push(...childNodes);
        });
      } else {
        // For large arrays, create placeholder nodes
        for (let i = 0; i < Math.min(5, totalItems); i++) {
          const childNodes = this.buildTree(`[${i}]`, value[i], depth + 1, node);
          node.children!.push(...childNodes);
        }
        
        // Add a placeholder for remaining items
        node.children!.push({
          key: `[${5}...${totalItems - 1}]`,
          value: `... ${totalItems - 5} more items`,
          type: 'string',
          expanded: false,
          depth: depth + 1,
          path: `${node.path}.[remaining]`,
          parent: node,
          searchMatch: false
        });
      }
      
      nodes.push(node);
    } else if (typeof value === 'object') {
      const node: JsonNode = {
        key,
        value: value,
        type: 'object',
        expanded: false,
        depth,
        path: parent ? `${parent.path}.${key}` : key,
        parent,
        searchMatch: false,
        children: []
      };
      
      // Limit initial object properties to prevent performance issues
      const entries = Object.entries(value);
      const maxInitialProperties = 100;
      
      if (entries.length <= maxInitialProperties) {
        entries.forEach(([childKey, childValue]) => {
          const childNodes = this.buildTree(childKey, childValue, depth + 1, node);
          node.children!.push(...childNodes);
        });
      } else {
        // For large objects, only show first few properties
        entries.slice(0, 20).forEach(([childKey, childValue]) => {
          const childNodes = this.buildTree(childKey, childValue, depth + 1, node);
          node.children!.push(...childNodes);
        });
        
        // Add a placeholder for remaining properties
        node.children!.push({
          key: `...`,
          value: `${entries.length - 20} more properties`,
          type: 'string',
          expanded: false,
          depth: depth + 1,
          path: `${node.path}.remaining`,
          parent: node,
          searchMatch: false
        });
      }
      
      nodes.push(node);
    } else {
      nodes.push({
        key,
        value: value,
        type: typeof value as 'string' | 'number' | 'boolean',
        expanded: false,
        depth,
        path: parent ? `${parent.path}.${key}` : key,
        parent,
        searchMatch: false
      });
    }
    
    return nodes;
  }

  protected toggleNode(node: JsonNode): void {
    if (node.type === 'object' || node.type === 'array') {
      node.expanded = !node.expanded;
      this.treeNodes.update(nodes => [...nodes]);
    }
  }

  protected expandAll(): void {
    this.setAllExpanded(true);
    this.allExpanded.set(true);
  }

  protected collapseAll(): void {
    this.setAllExpanded(false);
    this.allExpanded.set(false);
  }

  private setAllExpanded(expanded: boolean): void {
    const updateNode = (node: JsonNode) => {
      if (node.type === 'object' || node.type === 'array') {
        node.expanded = expanded;
        if (node.children) {
          node.children.forEach(updateNode);
        }
      }
    };
    
    const nodes = this.treeNodes();
    nodes.forEach(updateNode);
    this.treeNodes.update(n => [...n]);
  }

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput.set(input.value);
  }

  private applySearch(search: string): void {
    const searchLower = search.toLowerCase();
    const updateNode = (node: JsonNode) => {
      const keyMatch = node.key.toLowerCase().includes(searchLower);
      const valueMatch = node.type !== 'object' && node.type !== 'array' && 
                        String(node.value).toLowerCase().includes(searchLower);
      node.searchMatch = keyMatch || valueMatch;
      
      if (node.children) {
        node.children.forEach(updateNode);
        
        if (!node.searchMatch) {
          const childHasMatch = node.children.some(child => child.searchMatch);
          if (childHasMatch) {
            node.searchMatch = true;
            node.expanded = true;
          }
        }
      }
    };
    
    const nodes = this.treeNodes();
    nodes.forEach(updateNode);
    this.treeNodes.update(n => [...n]);
  }

  private clearSearch(): void {
    const updateNode = (node: JsonNode) => {
      node.searchMatch = false;
      if (node.children) {
        node.children.forEach(updateNode);
      }
    };
    
    const nodes = this.treeNodes();
    nodes.forEach(updateNode);
    this.treeNodes.update(n => [...n]);
  }

  private calculateSummary(): Record<string, number> {
    const data = this.parsedData();
    if (!data || typeof data !== 'object') {
      return {};
    }
    
    const summary: Record<string, number> = {};
    
    // Track visited objects to avoid infinite recursion with circular references
    const visited = new WeakSet();
    
    const countItems = (obj: any, path: string = '', depth: number = 0): void => {
      // Limit recursion depth to prevent stack overflow
      if (depth > 10) {
        return;
      }
      
      // Skip if already visited (circular reference)
      if (obj && typeof obj === 'object') {
        if (visited.has(obj)) {
          return;
        }
        visited.add(obj);
      }
      
      if (Array.isArray(obj)) {
        const key = path || 'items';
        summary[key] = (summary[key] || 0) + obj.length;
        
        // Only process first few items in large arrays for performance
        const maxItemsToProcess = 100;
        const itemsToProcess = Math.min(obj.length, maxItemsToProcess);
        
        for (let i = 0; i < itemsToProcess; i++) {
          countItems(obj[i], `${path}[${i}]`, depth + 1);
        }
        
        if (obj.length > maxItemsToProcess) {
          summary[`${key}_total`] = obj.length;
        }
      } else if (obj && typeof obj === 'object') {
        const entries = Object.entries(obj);
        
        // Only process first few properties in large objects for performance
        const maxPropertiesToProcess = 50;
        const propertiesToProcess = Math.min(entries.length, maxPropertiesToProcess);
        
        for (let i = 0; i < propertiesToProcess; i++) {
          const [key, value] = entries[i];
          const newPath = path ? `${path}.${key}` : key;
          
          if (Array.isArray(value)) {
            summary[key] = (summary[key] || 0) + value.length;
          }
          
          countItems(value, newPath, depth + 1);
        }
        
        if (entries.length > maxPropertiesToProcess) {
          summary[`${path}_total_properties`] = entries.length;
        }
      }
    };
    
    try {
      countItems(data);
    } catch (error) {
      console.warn('Error calculating JSON summary:', error);
      // Return partial summary if there was an error
    }
    
    return summary;
  }

  protected getTypeLabel(node: JsonNode): string {
    if (node.type === 'array') {
      return `Array[${node.children?.length || 0}]`;
    } else if (node.type === 'object') {
      return `Object{${node.children?.length || 0}}`;
    }
    return node.type;
  }

  protected getValueDisplay(node: JsonNode): string {
    if (node.type === 'string') {
      return `"${node.value}"`;
    } else if (node.type === 'null') {
      return 'null';
    }
    return String(node.value);
  }

  protected getNodeClass(node: JsonNode): string {
    const classes = [`depth-${node.depth}`];
    if (node.type === 'object' || node.type === 'array') {
      classes.push('expandable');
    }
    if (node.searchMatch) {
      classes.push('search-match');
    }
    return classes.join(' ');
  }
}
