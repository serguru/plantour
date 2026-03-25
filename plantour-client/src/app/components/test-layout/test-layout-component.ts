import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './test-layout-component.html',
  styleUrl: './test-layout-component.scss'
})
export class TestLayoutComponent {}
