import { Directive, OnDestroy, inject } from '@angular/core';
import { ToolbarButton, ToolbarService } from '../services/toolbar-service';

@Directive()
export abstract class ToolbarAware implements OnDestroy {
  protected toolbarService = inject(ToolbarService);

  constructor() {}

  ngOnDestroy(): void {
    this.toolbarService.clearButtons();
  }

  protected setToolbarButtons(buttons: ToolbarButton[]): void {
    this.toolbarService.setButtons(buttons);
  }

  protected clearToolbarButtons(): void {
    this.toolbarService.clearButtons();
  }

  /**
   * Update a specific toolbar button by its ID
   * @param buttonId - The unique identifier of the button
   * @param updates - Partial updates to apply to the button
   */
  protected updateToolbarButton(buttonId: string, updates: Partial<ToolbarButton>): void {
    this.toolbarService.updateButton(buttonId, updates);
  }

  /**
   * Update multiple toolbar buttons at once
   * @param updates - Map of button IDs to their updates
   */
  protected updateToolbarButtons(updates: { [buttonId: string]: Partial<ToolbarButton> }): void {
    this.toolbarService.updateButtons(updates);
  }
}
