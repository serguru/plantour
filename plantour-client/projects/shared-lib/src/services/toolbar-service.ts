import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToolbarButton {
  icon: string;
  label?: string;
  tooltip?: string;
  command: () => void;
  disabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private buttonsSubject = new BehaviorSubject<ToolbarButton[]>([]);
  public buttons$: Observable<ToolbarButton[]> = this.buttonsSubject.asObservable();

  constructor() {}

  setButtons(buttons: ToolbarButton[]): void {
    this.buttonsSubject.next(buttons);
  }

  clearButtons(): void {
    this.buttonsSubject.next([]);
  }

  getButtons(): ToolbarButton[] {
    return this.buttonsSubject.value;
  }
}
