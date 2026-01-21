import { inject, Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { ComponentService } from "../services/component-service";

@Injectable({ providedIn: 'root' })
export class CleanupResolver implements Resolve<void> {

    private componentService = inject(ComponentService);

    resolve(): void {
       this.componentService.reset();
    }
}