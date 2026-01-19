import { Component, input } from '@angular/core';
@Component({
  selector: 'app-form-header',
  imports: [
    
  ],
  templateUrl: './form-header.html',
  styleUrl: './form-header.scss',
})
export class FormHeader {
  title = input<string>();
  icon = input<string>();
}
