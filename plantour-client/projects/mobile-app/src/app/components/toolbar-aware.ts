import { Directive, OnDestroy, inject } from '@angular/core';
import { ToolbarService, ToolbarButton } from 'shared-lib';

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
}
