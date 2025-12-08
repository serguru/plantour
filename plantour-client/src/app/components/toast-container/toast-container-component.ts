import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast-container',
   imports: [CommonModule, ToastModule],
  templateUrl: './toast-container-component.html',
  styleUrl: './toast-container-component.scss',
})
export class ToastContainerComponent {

}
