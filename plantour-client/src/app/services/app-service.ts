import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DeviceMode } from './enums';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  routeActivated$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  routeActivated: Observable<any> = this.routeActivated$.asObservable();

  routeDeActivated$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  routeDeActivated: Observable<any> = this.routeActivated$.asObservable();

  deviceMode$: BehaviorSubject<DeviceMode> = new BehaviorSubject<DeviceMode>(DeviceMode.Unknown);
  deviceMode: Observable<DeviceMode> = this.deviceMode$.asObservable();

  updateDeviceMode(windowWidth: number): void { 
    let mode: DeviceMode;
    if (windowWidth >= 992) {
      mode = DeviceMode.Desktop;
    } else if (windowWidth >= 768) {
      mode = DeviceMode.Tablet;
    } else {
      mode = DeviceMode.Mobile;
    } 
    this.deviceMode$.next(mode);
  }
}
