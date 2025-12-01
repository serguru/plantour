import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { NavigationService } from '../../services/navigation.service';
import { UserPackageService } from 'shared-lib';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, CardModule, ListboxModule],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.scss'
})
export class PacksComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private userPackageService = inject(UserPackageService);
  
  userPackages: any[] = [];

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
    this.loadUserPackages();
  }

  private loadUserPackages(): void {
    this.userPackageService.getAll().subscribe({
      next: (packages) => {
        this.userPackages = packages;
      },
      error: (error) => {
        console.error('Error loading user packages:', error);
      }
    });
  }
}
