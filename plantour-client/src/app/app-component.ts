import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog-component';
import { AppService } from './services/app-service';
import { debounceTime, filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { Toolbar } from './components/toolbar/toolbar-component';
import { ComponentService } from './services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, ToastContainerComponent, ModalDialogComponent],
  templateUrl: './app-component.html',
  styleUrl: './app-component.scss'
})
export class AppComponent implements OnInit {
  router = inject(Router);

  ngOnInit(): void {
  }

  appService = inject(AppService);
  componentService = inject(ComponentService);
  loading = toSignal(this.componentService.loading$, { initialValue: true });

  onActivate($componentRef: any) {
    this.appService.routeActivated.next($componentRef);
  }

  onDeactivate($componentRef) {
    this.appService.routeDeActivated.next($componentRef);
  }



}
