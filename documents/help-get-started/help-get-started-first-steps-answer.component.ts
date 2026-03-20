import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-help-get-started-first-steps-answer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="help-section">
      <p class="help-list-caption">Temporary users follow (regular users see after) these steps:</p>
      <ol class="help-list-item">
        <li>Click the "Trip" button with the "compass" icon on the toolbar</li>
        <li>Select the "Trips" menu item. A list of trips open.</li>
        <li>This list will contain two trips: "Weekend in Las Vegas" and "Week in Europe". Select "Weekend in Las Vegas". It should be highlighted.</li>
        <li>Click the "Trip", then select "Items". The "Trip Items" page open.</li>
        <li>This list contains pre filled for your testing items</li>
        <li>Click "Phone charger"</li>
        <li>Make sure the drop-down list with bags is visible on the right. If not, click the three-dot button in the page header and select "Show Bags." A drop-down list with bags will appear.</li>
        <li>Click the drop-down menu of bags and select "Backpack." Your "Phone Charger" is now packed into the "Backpack."</li>
        <li>Download a packing list for "Backpack". To do this click on the toolbar "Trip" button with the "compass" icon.  </li>
        <li>Select the "Bags" menu item. A list of trip bags open.</li>
        <li>Click on "Backpack". It should be highlighted.</li>
        <li>Download a packing list as a PDF file. To do this click the three-dot button in the page header and select "Download packing list PDF". Confirm download.</li>        
        <li>Print out the downloaded packing list and put it in the "Backpack".</li>
        <li>Use the printed packing list when traveling.</li>
      </ol>
    </section>

    <section>
      <p class="help-list-caption">Regular users follow these steps:</p>
      <ol class="help-list-item">
        <li>Click the "Trip" button with the "compass" icon on the toolbar</li>
        <li>Select the "Trips" menu item. A list of trips open.</li>
        <li>Create a new trip. To do this, click the "Add" button with the plus icon. The "Add Trip" form will open. Enter the trip name "Las Vegas Weekend" and the dates. Click "Submit." You will return to the trip list. Your new trip will be highlighted. If not, click it. It should be highlighted.</li>
        <li>Click the "Trip" button with the "compass" icon on the toolbar, then select "Items". The "Trip Items" page open.</li>
        <li>Create a new trip item. To do this, click the "Add" button with the plus icon. The "Add Trip Item" form will open. Enter the trip item name "Phone charger". Click "Submit." You will return to the trip items list. Make sure the "Phone charger" is in the list</li>
        <li>Now you will need a bag to pack your "Phone charger" into. To create one click the "Trip" button with the "compass" icon on the toolbar, then select "Bags".  A list of trip bags open.</li>
        <li>Click the "Add" button with the plus icon. The "Add Trip Bag" form will open. Enter the bag name "Backpack". Click "Submit." You will return to the trip bags list. Make sure the "Backpack" is in the list</li>
        <li>Move to the trip items list. To do this click the "Trip" button with the "compass" icon on the toolbar, then select "Items". The "Trip Items" page open.</li>
        <li>Click "Phone charger"</li>
        <li>Make sure the drop-down list with bags is visible on the right. If not, click the three-dot button in the page header and select "Show Bags." A drop-down list with bags will appear.</li>
        <li>Click the drop-down menu of bags and select "Backpack." Your "Phone Charger" is now packed into the "Backpack."</li>
        <li>Download a packing list for "Backpack". To do this click on the toolbar "Trip" button with the "compass" icon.  </li>
        <li>Select the "Bags" menu item. A list of trip bags open.</li>
        <li>Click on "Backpack". It has to be highlighted.</li>
        <li>Download a packing list as a PDF file. To do this click the three-dot button in the page header and select "Download packing list PDF". Confirm download.</li>        
        <li>Print out the downloaded packing list and put it in the "Backpack".</li>
        <li>Use the printed packing list when traveling.</li>
      </ol>
    </section>
        
  `,
  styleUrl: '../../help-component.scss'
})
export class HelpGetStartedFirstStepsAnswerComponent {}