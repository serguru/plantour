import { Component, computed, DestroyRef, inject } from '@angular/core';
import { EntitiesComponent } from '../entities/entities-component';
import { ComponentService } from '../../services/component-service';
import { TripItemCommentComponent } from './trip-item-comment/trip-item-comment-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { Condition, DynamicQueryService } from '../../services/dynamic-query-service';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { switchMap, tap } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { TripCommentService } from '../../services/trip-comment-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AppButton } from '../button/button-component';

// TODO: fix the message's date and time, it should be local
// TODO: reverse the order of the messages, the most recent should be at the bottom, and the scroll should be at the bottom by default

@Component({
  selector: 'app-trip-comments',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
    InputText,
    FormsModule,
    AppButton
  ],
  templateUrl: './trip-comments-component.html',
  styleUrl: './trip-comments-component.scss',
})
export class TripCommentsComponent {
  componentId: string = 'trip-comments';
  tripItemCommentComponent = TripItemCommentComponent;

  componentService = inject(ComponentService);

  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);

  tripCommentService = inject(TripCommentService);


  currentTripService = inject(CurrentTripService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private destroyRef = inject(DestroyRef);

  private tripId: string | null = null;

  inputText: string | null = null;

  conditions: Condition[] =
    [
      {
        kind: 'filter',
        property: 'comment',
        label: 'Filter by Comment',
        filterText: '',
        comparisonType: 'contains',
        icon: 'filter'
      }
    ];

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          this.router.navigate(['/help/trip-comments/comments-intro']);
        }
      }
    ];
  }
  );

  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }
    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }


  ngOnInit(): void {

    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');

    // The checkTripIdGuard should ensure this never happens
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.initConditions(this.componentId);

    this.initSavedFeatures();

    this.tripCommentService.getAll(this.tripId!).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tripComments =>
      this.componentService.updateEntities(tripComments || [])
    );
  }

  initSavedFeatures() {
    const v = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(v);

    const id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.componentService.updateSelectedId(id);
  }


  deleteTripComment(id: string): void {
    this.tripCommentService.delete(id, this.tripId!).pipe(
      switchMap(_ =>
        this.tripCommentService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripComments) => {
      this.componentService.updateEntities(tripComments);
    });
  }

  addTripComment(comment: string): void {
    this.tripCommentService.add({
      tripId: this.tripId!,
      comment: comment
    }).pipe(
      switchMap(_ =>
        this.tripCommentService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripComments) => {
      this.componentService.updateEntities(tripComments);
    });
  }


  updateTripComment(id: string, comment: string): void {
    this.tripCommentService.update({
      id: id,
      comment: comment
    }).pipe(
      switchMap(_ =>
        this.tripCommentService.getAll(this.tripId!)
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((tripComments) => {
      this.componentService.updateEntities(tripComments);
    });
  }

  onAddMessageClick(): void {
    if (!this.inputText || this.inputText.trim() === '') {
      return;
    }
    this.addTripComment(this.inputText.trim());
    this.inputText = null;  
  }

  get addMessageButtonDisabled(): boolean {
    return !this.inputText || this.inputText.trim() === '';
  } 

}
