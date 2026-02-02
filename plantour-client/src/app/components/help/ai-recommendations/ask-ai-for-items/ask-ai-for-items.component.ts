import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

@Component({
  selector: 'app-ask-ai-for-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ask-ai-for-items.component.html',
  styleUrls: ['./ask-ai-for-items.component.scss']
})
export class AskAiForItemsComponent {
  mainHeading = 'How to Ask AI for Item Recommendations';
  intro = 'Plantour includes an AI-powered recommendation system that suggests items based on your trip description. Simply tell the AI about your trip - where you\'re going, what you\'re doing, and how long you\'ll be there - and it will generate a personalized list of recommended items. This is a quick way to build a comprehensive packing list without starting from scratch.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the AI Recommendations Feature',
      description: 'Access the AI item recommendation tool from the main navigation or dashboard.',
      details: [
        'Look for an "AI Templates" or "AI Recommendations" option in your navigation menu or sidebar',
        'You may also find it under the Items module or Trip management area',
        'The button often has an AI icon or says something like "Get AI Suggestions"'
      ]
    },
    {
      stepNumber: 2,
      title: 'Open the AI Prompt Form',
      description: 'You\'ll see a form where you can describe your trip to the AI.',
      details: [
        'The form typically has a text area for your prompt',
        'There may be fields for trip type, destination, duration, or activity type',
        'Some interfaces offer quick templates or suggestions for common trip types',
        'Select options that match your trip if dropdown menus are available'
      ]
    },
    {
      stepNumber: 3,
      title: 'Describe Your Trip in Detail',
      description: 'Write a clear description of your trip. The more detail you provide, the better the recommendations.',
      details: [
        'Include the destination (e.g., "Beach in Hawaii", "Mountains in Switzerland", "Urban Paris")',
        'Mention the purpose (e.g., "Relaxing vacation", "Hiking expedition", "Business conference")',
        'Specify the duration (e.g., "5 days", "2 weeks", "weekend trip")',
        'Include season or weather conditions (e.g., "Summer", "Winter", "Tropical", "Cold mountain")',
        'Mention specific activities you\'ll do (e.g., "swimming", "hiking", "dining out", "formal events")',
        'Note any special requirements (e.g., "Business casual dress code", "Need formal wear", "Lots of physical activity")'
      ],
      note: 'Example: "7-day beach vacation in Cancun during summer. We\'ll be swimming, snorkeling, and visiting resorts. Expect hot and humid weather."'
    },
    {
      stepNumber: 4,
      title: 'Submit Your Prompt',
      description: 'Click the "Generate" or "Get Recommendations" button to send your prompt to the AI.',
      details: [
        'The button is usually located near the prompt text area',
        'You might see "Generate Items", "Get Suggestions", or "Ask AI"',
        'The AI will process your prompt and generate recommendations',
        'This usually takes a few seconds to complete'
      ]
    },
    {
      stepNumber: 5,
      title: 'Review the AI-Generated List',
      description: 'The AI will return a list of recommended items based on your trip description.',
      details: [
        'Items are typically organized by category (Clothing, Toiletries, Electronics, etc.)',
        'Each item shows a name and may include quantity or description',
        'The list is sorted by relevance or category',
        'All items are in a "recommendation" state - none are added yet',
        'You can now filter, sort, or search within the list'
      ]
    },
    {
      stepNumber: 6,
      title: 'Filter and Organize the List',
      description: 'Narrow down the recommendations to what you actually need.',
      details: [
        'Use the search box to find specific items',
        'Filter by category to focus on clothing, electronics, etc.',
        'Sort the list by name or category for easier browsing',
        'Review each item and determine if it\'s relevant to your trip'
      ]
    },
    {
      stepNumber: 7,
      title: 'Select Items to Keep',
      description: 'Choose which recommended items you want to use.',
      details: [
        'Check the checkbox next to items you want to keep',
        'Uncheck items that don\'t apply to your trip',
        'You can select items individually or use "Select All" if available',
        'Focus on items that match your actual needs and preferences'
      ]
    },
    {
      stepNumber: 8,
      title: 'Add Items to Your Target',
      description: 'Once you\'ve selected the items you want, add them to your chosen destination.',
      details: [
        'Look for an "Add Selected Items" button or similar option',
        'Choose where to add them: your Items dictionary, trip own items, or shared items',
        'You may need to specify the destination before clicking add',
        'The items will be added in bulk - no need to add them one by one'
      ]
    }
  ];

  tips = [
    'Be specific in your description: "Mountain hiking in the Rocky Mountains" is better than just "hiking"',
    'Consider mentioning both indoor and outdoor activities so the AI suggests versatile clothing',
    'If you have special needs (medications, adaptive gear, etc.), mention them in your prompt',
    'Think about evening activities and formal occasions - the AI will suggest appropriate items',
    'You can ask for recommendations multiple times with different prompts if you want to explore options',
    'The AI tends to be conservative, so don\'t be afraid to remove items you won\'t use',
    'Consider the season and climate - the AI will suggest weather-appropriate items'
  ];

  prompts = [
    {
      scenario: 'Beach Vacation',
      example: 'Two-week beach vacation in Mexico during summer. We\'ll be relaxing at the resort, swimming, snorkeling, and attending casual beach dinners. Expect hot, humid weather with some rain.'
    },
    {
      scenario: 'Mountain Hiking',
      example: 'Five-day hiking trip in the Colorado Rockies in early fall. Moderate daily hikes with camping. Weather will be cool days, cold nights. Need warm layers and rain protection.'
    },
    {
      scenario: 'Business Trip',
      example: 'Three-day business conference in New York City in winter. Need business casual to formal attire. Will include meetings, dinners with clients, and evening networking events.'
    },
    {
      scenario: 'Family Road Trip',
      example: 'Two-week road trip across the western US in summer. Visiting national parks, cities, and staying in hotels/lodges. Will do lots of driving, hiking, and some formal dinners.'
    },
    {
      scenario: 'Winter Ski Vacation',
      example: 'Seven-day ski vacation in Colorado. Will ski and snowboard daily with après-ski activities. Need extreme cold-weather gear, waterproof protection, and thermal layers.'
    }
  ];

  commonIssues = [
    {
      problem: 'The AI recommendations don\'t match my trip',
      solution: 'Try being more specific in your description. Include climate, activities, duration, and dress code. The more details, the more accurate the recommendations.'
    },
    {
      problem: 'There are too many items in the list',
      solution: 'Use the filter and search features to narrow down the list. Remove items that don\'t apply to your trip. You can also select specific items instead of taking everything.'
    },
    {
      problem: 'An important item is missing',
      solution: 'The AI might not have suggested it based on your description. You can manually add it to your items dictionary after the AI recommendations are complete.'
    },
    {
      problem: 'The AI suggested items I already have',
      solution: 'That\'s normal. Uncheck items you already have in your dictionary. When you add them, duplicates may be handled by the system, or you can remove them afterward.'
    },
    {
      problem: 'The recommendation didn\'t load or timed out',
      solution: 'Check your internet connection and try again. If the issue persists, refresh the page or use a simpler prompt description.'
    }
  ];
}
