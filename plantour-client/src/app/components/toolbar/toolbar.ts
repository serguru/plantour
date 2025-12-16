import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { ToolbarService, ToolbarButton } from '../../services/toolbar-service';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, MenuModule, ButtonModule, TooltipModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private toolbarService = inject(ToolbarService);
  private elementRef = inject(ElementRef);
 
  private destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;
  
  dynamicButtons: ToolbarButton[] = [];
  buttonRows: ToolbarButton[][] = [];

  @HostListener('window:resize')
  onWindowResize() {
    this.calculateButtonLayout();
  }

  get menuItems(): MenuItem[] {
    return [
      {
        label: this.usersService.currentUserText,
        icon: 'pi pi-user',
        command: () => this.navigateTo('/profile')
      },
      {
        label: 'Help',
        icon: 'pi pi-question-circle',
        command: () => this.navigateTo('/help')
      },
      {
        label: 'Terms of Usage',
        icon: 'pi pi-file',
        command: () => this.navigateTo('/terms')
      },
      {
        label: 'Privacy Policy',
        icon: 'pi pi-shield',
        command: () => this.navigateTo('/privacy')
      },
      {
        label: 'Contact Us',
        icon: 'pi pi-envelope',
        command: () => this.navigateTo('/contact')
      },
      {
        label: 'Sign Up',
        // icon: 'pi pi-user-plus',
        icon: 'pi pi-sign-up',
        command: () => this.navigateTo('/sign-up')
      },
      {
        separator: true
      },
      {
        label: 'Sign In',
        icon: 'pi pi-sign-in',
        command: () => this.navigateTo('/sign-in')
      },
    ];
  }

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.buttons$
      .pipe(takeUntil(this.destroy$))
      .subscribe(buttons => {
        this.dynamicButtons = buttons;
        this.calculateButtonLayout();
      });
    
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateButtonLayout();
      });
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }
  }

  private calculateButtonLayout(): void {
    if (!this.dynamicButtons || this.dynamicButtons.length === 0) {
      this.buttonRows = [];
      return;
    }

    // Get available width for buttons
    const toolbarWidth = this.elementRef.nativeElement.offsetWidth;
    const leftSectionWidth = 200; // Approximate width for logo section
    const rightSectionWidth = 50; // Approximate width for menu button
    const availableWidth = toolbarWidth - leftSectionWidth - rightSectionWidth - 32; // 32px for padding

    // Estimate button width (icon + optional label + padding)
    const estimatedButtonWidth = 48; // Approximate width per button
    
    const buttonsPerRow = Math.max(1, Math.floor(availableWidth / estimatedButtonWidth));
    
    if (buttonsPerRow >= this.dynamicButtons.length) {
      // All buttons fit in one row
      this.buttonRows = [this.dynamicButtons];
    } else {
      // Distribute buttons across multiple rows evenly
      const totalButtons = this.dynamicButtons.length;
      const rowCount = Math.ceil(totalButtons / buttonsPerRow);
      const buttonsPerRowOptimal = Math.ceil(totalButtons / rowCount);
      
      this.buttonRows = [];
      for (let i = 0; i < totalButtons; i += buttonsPerRowOptimal) {
        this.buttonRows.push(this.dynamicButtons.slice(i, i + buttonsPerRowOptimal));
      }
    }
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }

  private navigateTo(path: string): void {
    console.log(`Navigate to: ${path}`);
    this.router.navigate([path]);
  }



}
