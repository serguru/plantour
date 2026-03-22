import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog-component';
import { LoadingComponent } from './components/loading/loading-component';
import { AppService } from './services/app-service';
import { debounceTime, filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { Toolbar } from './components/toolbar/toolbar-component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, ToastContainerComponent, ModalDialogComponent, LoadingComponent],
  templateUrl: './app-component.html',
  styleUrl: './app-component.scss'
})
export class AppComponent implements OnInit {
  router = inject(Router);
  environmentName = environment.environment;
  showNonProductionBanner = this.environmentName !== 'production';

  ngOnInit(): void {
  }

  appService = inject(AppService);

  onActivate($componentRef: any) {
    this.appService.routeActivated.next($componentRef);
  }

  onDeactivate($componentRef) {
    this.appService.routeDeActivated.next($componentRef);
  }



}
