import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog-component';
import { LoadingComponent } from './components/loading/loading-component';
import { AppService } from './services/app-service';
import { filter } from 'rxjs';
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
  appService = inject(AppService);
  environmentName = environment.environment;
  showNonProductionBanner = this.environmentName !== 'production';
  currentUrl = signal(this.router.url);
  showShellChrome = computed(() => this.currentUrl() !== '/' || this.appService.rootLandingReady());

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationStart | NavigationEnd => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      const nextUrl = event.url.split('?')[0] || '/';
      this.currentUrl.set(nextUrl);

      if (event instanceof NavigationStart && nextUrl === '/') {
        this.appService.setRootLandingReady(false);
      }
    });
  }

  onActivate($componentRef: any) {
    this.appService.routeActivated.next($componentRef);
  }

  onDeactivate($componentRef) {
    this.appService.routeDeActivated.next($componentRef);
  }



}
