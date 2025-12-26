import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './components/toolbar/toolbar-component';
import { ToastContainerComponent } from './components/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog-component';
import { AppService } from './services/app-service';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, ToastContainerComponent, ModalDialogComponent],
  templateUrl: './app-component.html',
  styleUrl: './app-component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.appService.updateDeviceMode(window.innerWidth);
      });
  }

  appService = inject(AppService);

  onActivate($componentRef: any) {
    this.appService.routeActivated$.next($componentRef);
  }

  onDeactivate($componentRef) {
    this.appService.routeDeActivated$.next($componentRef);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
