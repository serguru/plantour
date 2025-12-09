import { Component } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    ContentLayoutComponent,
    FormsModule,
    ListboxModule
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss',
})
export abstract class BaseListComponent<T, TA, TU> {

  entities: T[] | null = null;
  selected: T | null = null;
  title: string | null = null;
  entityIcon: string = "pi-box";
  listToolsShown: boolean = false;

  constructor(
    protected service: CrudService<T, TA, TU>,
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

  get processedEntities(): T[] {
    return this.entities || [];
  }

  get listNotEmpty(): boolean {
    return (this.entities?.length ?? 0) > 0;
  }

}