import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    if (!this.el || !this.el.nativeElement) {
      return;
    }
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 0);
  }
}