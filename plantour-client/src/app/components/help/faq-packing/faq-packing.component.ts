import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-packing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-packing.component.html',
  styleUrl: './faq-packing.component.scss'
})
export class FaqPackingComponent {
  faqs: FAQItem[] = [
    {
      question: 'How do I start packing for a trip?',
      answer: 'First, create or select your trip as the current trip. Then add items either from your Items Dictionary, from templates, or create new items. Assign items to travelers and bags. Finally, check off items as you pack them.'
    },
    {
      question: 'What\'s the difference between items, travelers, and bags?',
      answer: 'Items are things you need to pack (clothes, electronics, etc.). Travelers are people going on the trip. Bags are luggage containers (suitcases, backpacks). You assign items to travelers, who pack them into bags for the journey.'
    },
    {
      question: 'Can I pack the same item for multiple people?',
      answer: 'Yes! Create separate item entries for each person, or use shared items. For example, create "Passport - John" and "Passport - Sarah" as individual items, or create one "Tent" as a shared item assigned to multiple participants.'
    },
    {
      question: 'How do categories help with packing?',
      answer: 'Categories (Clothing, Electronics, Toiletries, etc.) organize items into logical groups. You can filter items by category to see all clothing items together, ensuring you don\'t forget essentials in each category.'
    },
    {
      question: 'What are templates and how do they help?',
      answer: 'Templates are pre-built item lists for common trip types (beach vacation, hiking, business travel). Instead of creating items from scratch, import templates matching your trip type and customize them for your needs.'
    },
    {
      question: 'Can I reuse packing lists from previous trips?',
      answer: 'Yes! Add items from completed trips to your Items Dictionary, then import them to new trips. Alternatively, use your previous trip as a template and copy its structure to a new trip.'
    },
    {
      question: 'How do I track which items are packed?',
      answer: 'Each item has a checkbox. As you pack items into bags, check them off. The trip view shows your packing progress as a percentage. You can also see which items are still unpacked at a glance.'
    },
    {
      question: 'Can I assign items to specific bags?',
      answer: 'Yes! When viewing trip items, you can assign each item to a specific bag (e.g., "Backpack", "Suitcase #1"). This helps you remember where you packed each item during your trip.'
    },
    {
      question: 'What if I need to pack items for different weather conditions?',
      answer: 'Use item templates filtered by temperature range, or manually add items for various conditions. You can add notes to items (e.g., "Pack if rain forecasted") and use categories like "Warm Weather" or "Cold Weather".'
    },
    {
      question: 'How do I handle items I buy during the trip?',
      answer: 'Add new items to your trip anytime, even during travel. Mark them as "acquired during trip" in notes. When you pack them for the return journey, assign them to bags just like pre-trip items.'
    },
    {
      question: 'Can I download or print my packing list?',
      answer: 'Yes! With the Expedition plan, you can download packing lists as PDF files. This is useful for printing checklists or sharing with participants who don\'t have Plantour access.'
    },
    {
      question: 'What happens to items when I delete a bag?',
      answer: 'Deleting a bag from your Bags module only removes the bag definition - it doesn\'t delete items. If items were assigned to that bag in a trip, they become unassigned and you can reassign them to other bags.'
    },
    {
      question: 'Can I set quantities for items?',
      answer: 'Yes! Each item has a quantity field. For example, "Socks - 5 pairs" or "T-shirts - 3". This helps ensure you pack the right number of each item and track what you have.'
    },
    {
      question: 'How do I handle items needed by multiple people?',
      answer: 'Use shared items! Create one item (e.g., "First Aid Kit") and assign it to multiple participants. One person is responsible for packing it, but everyone knows it\'s included in the trip.'
    },
    {
      question: 'Can I add notes or descriptions to items?',
      answer: 'Yes! Each item has a description/notes field. Use it to add details like "Black hiking boots, size 10" or "Remember phone charger cable is in the car". Notes help you find and pack the exact item you need.'
    }
  ];
}
