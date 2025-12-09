import { Component } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { ControlsWrapper } from "../page-wrapper/controls-wrapper/controls-wrapper";

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [ContentLayoutComponent, ControlsWrapper],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss',
})
export abstract class BaseListComponent<T, TA, TU> {

  entities: T[] = [];
  selected: T | null = null;

constructor(
    protected service: CrudService<T, TA, TU>,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  get entitiesJson() {
    return this.entities.map(x => JSON.stringify(x));
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
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
    this.service.delete(id).subscribe(() => this.reload());
  }



}
