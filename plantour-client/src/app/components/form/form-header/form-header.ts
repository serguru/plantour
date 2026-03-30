import { Component, computed, inject, input } from '@angular/core';

import { PopoverModule } from 'primeng/popover';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpService } from '../../../services/help-service';

export interface MenuConfig {
  label: string;
  icon: string;
  action: () => void;
}

export interface HeaderButtonConfig {
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-header',
  imports: [
    PopoverModule
],
  templateUrl: './form-header.html',
  styleUrl: './form-header.scss',
})
export class FormHeader {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly helpContextService = inject(HelpService);

  title = input<string>();
  icon = input<string>();
  headerButtons = input<HeaderButtonConfig[]>([]);
  menuItems = input<MenuConfig[]>([]);
  helpPageId = input<string | null>(null);

  resolvedMenuItems = computed<MenuConfig[]>(() => {
    const items = [...this.menuItems()];
    const componentId = this.helpContextService.resolveComponentId(
      this.route.snapshot.pathFromRoot.map((snapshot) => snapshot.data['componentId'] as string | null | undefined)
    );
    const pageId = this.helpContextService.resolvePageId(this.router.url, this.helpPageId(), componentId);
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
