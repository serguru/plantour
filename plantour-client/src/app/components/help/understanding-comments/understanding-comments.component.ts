import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CommentFeature {
  icon: string;
  title: string;
  description: string;
}

interface CommentBenefit {
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-comments.component.html',
  styleUrl: './understanding-comments.component.scss'
})
export class UnderstandingCommentsComponent {
  features: CommentFeature[] = [
    {
      icon: 'pi pi-comments',
      title: 'Trip-Wide Comments',
      description: 'Leave comments visible to all trip participants for collaborative discussion.'
    },
    {
      icon: 'pi pi-user',
      title: 'Author Identification',
      description: 'Each comment shows who wrote it and when, ensuring clear communication attribution.'
    },
    {
      icon: 'pi pi-calendar',
      title: 'Timestamped Discussion',
      description: 'Comments are timestamped, allowing you to track the conversation timeline.'
    },
    {
      icon: 'pi pi-pencil',
      title: 'Editable Comments',
      description: 'Modify your own comments if you need to clarify or correct information.'
    }
  ];

  benefits: CommentBenefit[] = [
    {
      title: 'Better Communication',
      description: 'Discuss trip details, plans, and coordination without email or external chat.'
    },
    {
      title: 'Centralized Information',
      description: 'Keep all trip-related discussions in one place alongside your planning data.'
    },
    {
      title: 'Transparency',
      description: 'All participants see the same conversation, avoiding miscommunication.'
    },
    {
      title: 'Quick Coordination',
      description: 'Resolve questions and make decisions faster with integrated commenting.'
    }
  ];

  useCases: string[] = [
    'Asking questions about trip logistics or shared items',
    'Discussing packing strategies and recommendations',
    'Coordinating transportation and meeting points',
    'Sharing important information with all participants',
    'Celebrating and confirming trip planning progress',
    'Addressing changes or adjustments to the trip'
  ];

  keyPoints: string[] = [
    'Comments are shared with all trip participants - they are not private messages',
    'You can only edit or delete your own comments',
    'Comments have timestamps to show when they were posted',
    'Comments appear chronologically in the discussion',
    'Admins can manage comments to maintain a respectful environment',
    'Comments help keep all communication in one place'
  ];
}
