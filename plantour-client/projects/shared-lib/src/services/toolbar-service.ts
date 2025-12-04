import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToolbarButton {
  icon: string;
  label?: string;
  tooltip?: string;
  command: () => void;
  disabled?: boolean;
  id?: string; // Unique identifier for the button
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

  /**
   * Update a specific button by its ID
   * @param buttonId - The unique identifier of the button
   * @param updates - Partial updates to apply to the button
   */
  updateButton(buttonId: string, updates: Partial<ToolbarButton>): void {
    const currentButtons = this.buttonsSubject.value;
    const updatedButtons = currentButtons.map(button => 
      button.id === buttonId ? { ...button, ...updates } : button
    );
    this.buttonsSubject.next(updatedButtons);
  }

  /**
   * Update multiple buttons at once
   * @param updates - Map of button IDs to their updates
   */
  updateButtons(updates: { [buttonId: string]: Partial<ToolbarButton> }): void {
    const currentButtons = this.buttonsSubject.value;
    const updatedButtons = currentButtons.map(button => 
      button.id && updates[button.id] ? { ...button, ...updates[button.id] } : button
    );
    this.buttonsSubject.next(updatedButtons);
  }
}
