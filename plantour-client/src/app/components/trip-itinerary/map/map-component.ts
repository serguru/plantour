import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EntitiesHeader, HeaderButtonConfig } from '../../entities/entities-header-component/entities-header-component';
import { formatDate } from '../../../helpers/utils';
import { ComponentService } from '../../../services/component-service';
import { ItineraryPartDto, ItineraryService, ItineraryTodoDto } from '../../../services/itinerary-service';
import { MessagesService } from '../../../services/messages-service';


interface ResolvedLocation {
  latitude: number;
  longitude: number;
  source: 'coordinates' | 'address';
}

interface ResolvedPartPoint {
  part: ItineraryPartDto;
  location: ResolvedLocation;
}

interface ResolvedTodoPoint {
  todo: ItineraryTodoDto;
  location: ResolvedLocation;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, EntitiesHeader],
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.scss'],
})
export class MapComponent {
}
