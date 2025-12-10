import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListActionsComponent, PropertyConfig } from '../list-actions/list-actions.component';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    ContentLayoutComponent,
    FormsModule,
    ListboxModule,
    CommonModule,
    ListActionsComponent
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss'
})
export class BaseListComponent<T, TA, TU> implements OnInit {

  @Input() service!: CrudService<T, TA, TU>;
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() title: string | null = null;
  @Input() entityIcon: string | null = null;
  @Input() listActionsConfiguration: PropertyConfig[] = [];

  entities: T[] | null = null;
  selected: T | null = null;
  processedEntities: T[] | null = null;
  private filterText: string | null = null;

  listToolsShown: boolean = false;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getAll();
  }

  getAll() {
    this.service.getAll().subscribe(list => this.entities = list);
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  edit() {
    if (!this.selected) return;
    const id = (this.selected as any).id;
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  delete() {
    if (!this.selected) return;
    const id = (this.selected as any).id;
    this.service.delete(id).subscribe(() => this.getAll());
  }

  get listNotEmpty(): boolean {
    return (this.entities?.length ?? 0) > 0;
  }

  onEntitiesChanged(response: any): void {
    response.data.forEach((x: any) => x.name = this.highlightText((x as any).name));
    this.processedEntities = response.data;
    this.filterText = response.filterText;
  }

  showListActions() {
    this.listToolsShown = true;
  }

  hideListActions() {
    this.listToolsShown = false;
  }

  highlightText(text: string): string {
    if (!this.filterText?.trim() || !text) {
      return text;
    }

    const filterLower = this.filterText.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(filterLower);

    if (index === -1) {
      return text;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + this.filterText.length);
    const after = text.substring(index + this.filterText.length);

    return `${before}<mark>${match}</mark>${after}`;
  }



}