
import { Component, Input, ViewChild, TemplateRef, ViewContainerRef, Output, EventEmitter } from '@angular/core';

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [],
  templateUrl: './popover-component.html',
  styleUrl: './popover-component.scss',
})
export class PopoverComponent {
  @ViewChild('contentTemplate') templateRef!: TemplateRef<any>;
  private overlayRef: OverlayRef | null = null;

  @Input() panelClass = '';
  @Input() matchWidth = false;
  panelMinWidth: number | null = null;

  @Output() onShow = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();


  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

  toggle(event: MouseEvent) {
    this.overlayRef ? this.hide() : this.show(event.currentTarget as HTMLElement);
  }

  show(origin: HTMLElement) {
    this.panelMinWidth = this.matchWidth ? origin.getBoundingClientRect().width : null;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    this.overlayRef.backdropClick().subscribe(() => this.hide());

    const portal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.onShow.emit();
  }

  hide() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
      this.panelMinWidth = null;
      this.onHide.emit();
    }
  }

  isOpen() {
    return !!this.overlayRef;
  }
}