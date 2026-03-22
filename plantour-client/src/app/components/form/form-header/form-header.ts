import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import { Router } from '@angular/router';
import { HelpService } from '../../../services/help-service';

export interface MenuConfig {
  label: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-form-header',
  imports: [
    CommonModule,
    PopoverModule
  ],
  templateUrl: './form-header.html',
  styleUrl: './form-header.scss',
})
export class FormHeader {
  private readonly router = inject(Router);
  private readonly helpContextService = inject(HelpService);

  title = input<string>();
  icon = input<string>();
  menuItems = input<MenuConfig[]>([]);
  helpPageId = input<string | null>(null);

  resolvedMenuItems = computed<MenuConfig[]>(() => {
    const items = [...this.menuItems()];
    const pageId = this.helpContextService.resolvePageId(this.router.url, this.helpPageId());
    const helpUrl = this.helpContextService.getPageUrl(pageId);

    if (helpUrl) {
      items.push({
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          void this.router.navigateByUrl(helpUrl);
        }
      });
    }

    return items;
  });
}
