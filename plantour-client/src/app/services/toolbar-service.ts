import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToolbarButton {
  icon: string;
  label?: string;
  tooltip?: string;
  command: () => void;
  disabled?: boolean;
  id?: string; // Unique identifier for the button
}


@Injectable({ providedIn: 'root' })
export class ToolbarService {
  private dynamicMenus = new BehaviorSubject<MenuItem[] | null>(null);
  currentMenus$ = this.dynamicMenus.asObservable();

  setCurrentMenus(items: MenuItem[] | null): void   {
    this.dynamicMenus.next(items);
  }

  private dynamicButtons = new BehaviorSubject<ToolbarButton[] | null>(null);
  currentButtons$ = this.dynamicButtons.asObservable();

  setCurrentButtons(items: ToolbarButton[] | null): void   {
    this.dynamicButtons.next(items);
  }
}