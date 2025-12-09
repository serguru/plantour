import { Component } from '@angular/core';
import { BaseListComponent } from '../base-list/base-list';
import { UserPackageDto, CreateUserPackageRequest, UpdateUserPackageRequest, UserPackageService } from '../../services/user-package-service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [ContentLayoutComponent, ListboxModule, FormsModule],
  templateUrl: '../base-list/base-list.html',
  styleUrl: '../base-list/base-list.scss',
})
export class PacksComponent extends BaseListComponent<UserPackageDto, CreateUserPackageRequest, UpdateUserPackageRequest>{
  
constructor(
    service: UserPackageService,
    router: Router,
    route: ActivatedRoute
  ) {
    super(service, router, route);
    this.title = "Packs";
  }
}
