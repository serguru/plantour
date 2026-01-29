import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AddCommentStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface CommentTip {
  title: string;
  description: string;
}

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss'
})
export class AddCommentComponent {
  steps: AddCommentStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Comments',
      description: 'Go to your trip and select the Comments or Collaboration section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Find the Comment Section',
      description: 'Scroll to the comment area or input field for adding new comments.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Click the Comment Box',
      description: 'Click on the text input area to start typing your comment.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Type Your Comment',
      description: 'Write a clear, concise message that all participants will see.',
      icon: 'pi pi-file-edit'
    },
    {
      number: 5,
      title: 'Click Send or Post',
      description: 'Click the Send button to post your comment to the trip discussion.',
      icon: 'pi pi-send'
    },
    {
      number: 6,
      title: 'Comment Posted',
      description: 'Your comment appears in the discussion with your name and timestamp.',
      icon: 'pi pi-check'
    }
  ];

  tips: CommentTip[] = [
    {
      title: 'Be Clear and Concise',
      description: 'Write comments that are easy to understand and get to the point quickly.'
    },
    {
      title: 'Stay On Topic',
      description: 'Keep comments related to the trip and planning. Use one comment per topic.'
    },
    {
      title: 'Be Respectful',
      description: 'Use a friendly, respectful tone. Remember, all participants will read your comment.'
    },
    {
      title: 'Ask Questions',
      description: 'Don\'t hesitate to ask questions about shared items, logistics, or responsibilities.'
    },
    {
      title: 'Provide Context',
      description: 'If responding to something earlier, provide enough context for clarity.'
    },
    {
      title: 'Avoid Private Information',
      description: 'Don\'t share personal details - comments are visible to all trip participants.'
    }
  ];

  bestPractices: string[] = [
    'Read existing comments first to avoid duplicating discussions',
    'Use comments to coordinate with your teammates',
    'Respond timely to questions from other participants',
    'Share important updates that affect the whole trip',
    'Use comments for quick decisions that involve multiple people',
    'Include relevant details to help others understand your comment'
  ];

  commentGuidelines: string[] = [
    'Keep comments focused on trip-related topics',
    'Be constructive and supportive in your communication',
    'Use clear language that is easy to understand',
    'Avoid using all capital letters (appears like shouting)',
    'Be mindful of tone - text can be misinterpreted',
    'Feel free to use emojis appropriately to convey sentiment'
  ];
}
