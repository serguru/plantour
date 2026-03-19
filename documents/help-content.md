# Plantour Help Content Plan

## Purpose

This file defines the proposed page tree for the new Plantour Help system.

Principles used for this structure:

- One top-level Angular route: `/help`
- Every help page has its own URL
- Pages are small enough to read without collapsible sections
- The tree supports SSR, search, table of contents, breadcrumbs, back links, and contextual help links from real UI screens
- The content covers public visitors, temporary users, admins, and participants

## Top-Level Help Tree

### 1. Home

- `/help` - Help home
- `/help/welcome-to-plantour` - Welcome to Plantour
- `/help/how-plantour-works` - What Plantour helps you do
- `/help/choose-how-to-start` - Choose the best way to start
- `/help/roles-and-access` - Admins, participants, and temporary users

### 2. Public Access

- `/help/public` - Public pages overview
- `/help/public/packing-list-generator` - Public packing list generator
- `/help/public/packing-list-generator/how-to-browse-templates` - Browse public templates
- `/help/public/packing-list-generator/how-to-search-and-filter` - Search and filter public templates
- `/help/public/packing-list-generator/template-details` - Open a template and read its item list
- `/help/public/packing-list-generator/how-to-start-from-a-public-template` - Use a public template to begin planning
- `/help/public/guest-access` - Try Plantour with guest access
- `/help/public/guest-access/what-guest-access-includes` - What guest access includes
- `/help/public/guest-access/limits-of-guest-access` - Limits of guest access

### 3. Sign In And Access

- `/help/access` - Sign in and access overview
- `/help/access/admin-sign-in` - Sign in as an admin
- `/help/access/admin-sign-in/how-email-link-sign-in-works` - How the email sign-in link works
- `/help/access/admin-sign-in/what-to-do-if-the-email-does-not-arrive` - Email link did not arrive
- `/help/access/admin-sign-in/what-to-do-if-the-link-expired` - Email link expired
- `/help/access/participant-sign-in` - Sign in as a participant
- `/help/access/participant-sign-in/how-to-use-an-access-code` - Use an access code
- `/help/access/social-sign-in` - Sign in with Google or Facebook
- `/help/access/social-sign-in/google` - Sign in with Google
- `/help/access/social-sign-in/facebook` - Sign in with Facebook
- `/help/access/temporary-user` - Use Plantour as a temporary user
- `/help/access/temporary-user/how-to-start-a-temporary-account` - Start guest access
- `/help/access/temporary-user/how-to-keep-your-data` - Keep your data when moving from guest access to a regular account
- `/help/access/sign-out` - Sign out safely

### 4. Landing, Plans, And Checkout

- `/help/getting-started` - Getting started overview
- `/help/getting-started/landing-page` - Understand the landing page
- `/help/getting-started/choose-a-plan` - Compare Starter, Family, and Expedition
- `/help/getting-started/start-free` - Start with the free plan
- `/help/getting-started/start-paid-plan` - Start a paid plan
- `/help/getting-started/checkout` - Checkout overview
- `/help/getting-started/checkout/enter-your-email` - Enter your email during checkout
- `/help/getting-started/checkout/what-happens-after-payment` - What happens after payment
- `/help/getting-started/checkout/what-to-do-if-payment-fails` - Payment failed
- `/help/getting-started/checkout/temporary-user-checkout` - Upgrade after using guest access

### 5. Dashboard

- `/help/dashboard` - Dashboard overview
- `/help/dashboard/how-to-choose-a-current-trip` - Choose the trip you are working on
- `/help/dashboard/trip-info` - Trip info block
- `/help/dashboard/user-trip-info` - Your trip info block
- `/help/dashboard/all-users-trip-info` - All users trip info block
- `/help/dashboard/how-to-use-the-dashboard-to-decide-what-to-do-next` - Use the dashboard as your starting point

### 6. Profile And Account

- `/help/profile` - Profile overview
- `/help/profile/personal-information` - Update your personal information
- `/help/profile/social-login` - Connect or review social sign-in methods
- `/help/profile/participant-code` - Find or use a participant code
- `/help/profile/temporary-account-email` - Replace a guest email with your real email
- `/help/profile/billing-plan-and-subscription` - Open billing, plan, and subscription tools
- `/help/profile/scheduled-plan-change` - Understand a scheduled plan downgrade

### 7. Trips

- `/help/trips` - Trips overview
- `/help/trips/how-to-create-a-trip` - Create a trip
- `/help/trips/how-to-open-an-existing-trip` - Open an existing trip
- `/help/trips/how-to-edit-a-trip` - Edit a trip
- `/help/trips/how-to-view-a-trip` - View trip details
- `/help/trips/how-to-select-the-right-trip-before-working` - Make sure you are in the right trip
- `/help/trips/how-to-download-a-trip-pdf` - Download a trip PDF

### 8. Travelers

- `/help/travelers` - Travelers overview
- `/help/travelers/personal-travelers-list` - Your travelers list
- `/help/travelers/how-to-add-a-traveler` - Add a traveler
- `/help/travelers/how-to-edit-a-traveler` - Edit a traveler
- `/help/travelers/how-to-view-a-traveler` - View traveler details
- `/help/travelers/how-travelers-connect-to-trips` - How travelers connect to trips

### 9. Trip Participants

- `/help/trip-participants` - Trip participants overview
- `/help/trip-participants/how-to-add-a-person-to-a-trip` - Add a person to a trip
- `/help/trip-participants/how-to-edit-a-trip-participant` - Edit a trip participant
- `/help/trip-participants/how-to-view-a-trip-participant` - View a trip participant
- `/help/trip-participants/admin-view` - What admins can do with trip participants
- `/help/trip-participants/participant-view` - What participants can do with trip participants

### 10. Items Dictionary

- `/help/items` - Items overview
- `/help/items/your-items-dictionary` - What the items dictionary is for
- `/help/items/how-to-add-an-item` - Add an item to your dictionary
- `/help/items/how-to-edit-an-item` - Edit an item in your dictionary
- `/help/items/how-to-keep-items-organized` - Keep items easy to find later

### 11. Trip Own Items

- `/help/trip-items` - Trip own items overview
- `/help/trip-items/how-to-add-an-item-directly-to-a-trip` - Add an item directly to a trip
- `/help/trip-items/how-to-edit-a-trip-item` - Edit a trip item
- `/help/trip-items/how-to-add-items-from-your-dictionary` - Add items from your dictionary
- `/help/trip-items/how-to-read-item-status` - Understand packed and assignment status
- `/help/trip-items/how-to-show-or-hide-assignment-details` - Show or hide assignment details

### 12. Shared Trip Items

- `/help/shared-items` - Shared trip items overview
- `/help/shared-items/how-to-add-a-shared-item` - Add a shared item
- `/help/shared-items/how-to-edit-a-shared-item` - Edit a shared item
- `/help/shared-items/how-to-view-a-shared-item` - View shared item details
- `/help/shared-items/how-to-assign-a-shared-item` - Assign a shared item to someone
- `/help/shared-items/how-to-accept-an-item-assignment` - Accept an item assignment
- `/help/shared-items/how-to-reject-an-item-assignment` - Reject an item assignment
- `/help/shared-items/how-to-finish-an-item-assignment` - Mark an item assignment as finished
- `/help/shared-items/how-admins-track-shared-item-progress` - Track shared item progress as an admin

### 13. To-Do Dictionary

- `/help/todos` - To-do overview
- `/help/todos/your-todo-dictionary` - What your to-do dictionary is for
- `/help/todos/how-to-add-a-todo` - Add a to-do
- `/help/todos/how-to-edit-a-todo` - Edit a to-do
- `/help/todos/how-to-keep-todos-organized` - Keep your to-dos easy to manage

### 14. Trip Own To-Dos

- `/help/trip-todos` - Trip own to-dos overview
- `/help/trip-todos/how-to-add-a-trip-todo` - Add a to-do directly to a trip
- `/help/trip-todos/how-to-edit-a-trip-todo` - Edit a trip to-do
- `/help/trip-todos/how-to-add-todos-from-your-dictionary` - Add to-dos from your dictionary
- `/help/trip-todos/how-to-read-todo-status` - Understand trip to-do status
- `/help/trip-todos/how-to-show-or-hide-assignment-details` - Show or hide assignment details

### 15. Shared Trip To-Dos

- `/help/shared-todos` - Shared trip to-dos overview
- `/help/shared-todos/how-to-add-a-shared-todo` - Add a shared to-do
- `/help/shared-todos/how-to-edit-a-shared-todo` - Edit a shared to-do
- `/help/shared-todos/how-to-view-a-shared-todo` - View shared to-do details
- `/help/shared-todos/how-to-assign-a-shared-todo` - Assign a shared to-do
- `/help/shared-todos/how-to-accept-a-todo-assignment` - Accept a to-do assignment
- `/help/shared-todos/how-to-reject-a-todo-assignment` - Reject a to-do assignment
- `/help/shared-todos/how-to-finish-a-todo-assignment` - Mark a to-do assignment as finished
- `/help/shared-todos/how-admins-track-shared-todo-progress` - Track shared to-do progress as an admin

### 16. Bags And Packing

- `/help/bags` - Bags and packing overview
- `/help/bags/your-bags-list` - Your bags list
- `/help/bags/how-to-add-a-bag` - Add a bag
- `/help/bags/how-to-edit-a-bag` - Edit a bag
- `/help/bags/how-bags-work-with-trip-items` - How bags work with trip items
- `/help/bags/trip-bags` - Trip bags overview
- `/help/bags/trip-bags/how-to-add-a-bag-to-a-trip` - Add a bag to a trip
- `/help/bags/trip-bags/how-to-edit-a-trip-bag` - Edit a trip bag
- `/help/bags/trip-bags/how-to-add-a-bag-from-your-bags-list` - Add bags from your saved list
- `/help/bags/trip-bags/how-to-pack-items-into-bags` - Pack items into bags
- `/help/bags/trip-bags/how-to-see-what-is-not-packed-yet` - See what is still not packed
- `/help/bags/trip-bags/how-to-download-packing-lists` - Download packing lists

### 17. Templates

- `/help/templates` - Templates overview
- `/help/templates/how-to-browse-your-templates` - Browse your templates
- `/help/templates/how-to-use-a-template` - Use a template to start faster
- `/help/templates/how-templates-help-repeat-trips` - Reuse templates for similar trips

### 18. AI Recommendations

- `/help/ai` - AI recommendations overview
- `/help/ai/how-to-describe-your-trip` - Describe your trip so Plantour can help
- `/help/ai/how-to-get-item-suggestions` - Get item suggestions from AI
- `/help/ai/how-to-review-ai-suggestions` - Review AI suggestions before adding them
- `/help/ai/how-to-add-ai-items-to-your-items-dictionary` - Add AI items to your items dictionary
- `/help/ai/how-to-add-ai-items-to-trip-own-items` - Add AI items to your trip own items
- `/help/ai/how-to-add-ai-items-to-trip-shared-items` - Add AI items to your trip shared items
- `/help/ai/how-to-sort-filter-and-search-ai-results` - Sort, filter, and search AI results
- `/help/ai/when-ai-results-need-manual-checking` - When you should double-check AI results

### 19. Comments And Coordination

- `/help/comments` - Trip comments overview
- `/help/comments/how-to-add-a-trip-comment` - Add a trip comment
- `/help/comments/how-to-use-comments-for-coordination` - Keep trip communication clear

### 20. Reports And Downloads

- `/help/reports` - Reports and downloads overview
- `/help/reports/trip-pdf` - Download the trip PDF
- `/help/reports/packing-lists` - Download packing lists for bags
- `/help/reports/when-to-use-each-download` - Choose the right download for your task

### 21. Billing And Plan Changes

- `/help/billing` - Billing overview
- `/help/billing/how-to-upgrade-your-plan` - Upgrade your plan
- `/help/billing/how-to-downgrade-your-plan` - Downgrade your plan
- `/help/billing/when-a-downgrade-takes-effect` - When a downgrade takes effect
- `/help/billing/how-to-open-the-customer-portal` - Open the billing portal
- `/help/billing/what-to-do-if-you-already-have-an-active-plan` - Already have an active plan

### 22. Temporary User Journey

- `/help/temporary-users` - Temporary user overview
- `/help/temporary-users/why-use-guest-access-first` - Why guest access can be useful
- `/help/temporary-users/what-you-can-do-as-a-temporary-user` - What temporary users can do
- `/help/temporary-users/what-you-cannot-do-as-a-temporary-user` - What temporary users cannot do
- `/help/temporary-users/how-to-move-to-a-regular-account` - Move from temporary access to a regular account
- `/help/temporary-users/what-happens-if-you-sign-out` - What happens if you sign out

### 23. Role-Based Guides

- `/help/by-role` - Choose help by role
- `/help/by-role/admin` - Help for admins
- `/help/by-role/admin/first-trip-setup` - First trip setup for admins
- `/help/by-role/admin/manage-people-and-assignments` - Manage people and assignments
- `/help/by-role/admin/manage-billing-and-plan` - Manage billing and plan as an admin
- `/help/by-role/participant` - Help for participants
- `/help/by-role/participant/join-a-trip-and-start-working` - Join a trip and start working
- `/help/by-role/participant/accept-and-finish-assignments` - Accept and finish assignments
- `/help/by-role/participant/pack-your-items` - Pack your items
- `/help/by-role/temporary-user` - Help for temporary users
- `/help/by-role/temporary-user/try-plantour-before-signing-up` - Try Plantour before signing up

### 24. Suggested Task-Based Guides

- `/help/tasks` - Task-based guides overview
- `/help/tasks/create-your-first-trip` - Create your first trip
- `/help/tasks/add-people-to-a-trip` - Add people to a trip
- `/help/tasks/build-a-packing-list` - Build a packing list
- `/help/tasks/build-a-todo-list` - Build a to-do list
- `/help/tasks/assign-shared-responsibilities` - Assign shared responsibilities
- `/help/tasks/pack-items-into-bags` - Pack items into bags
- `/help/tasks/use-a-template` - Start from a template
- `/help/tasks/use-ai-recommendations` - Start from AI recommendations
- `/help/tasks/download-trip-documents` - Download trip documents
- `/help/tasks/move-from-guest-access-to-paid-use` - Move from guest access to paid use

### 25. Common Problems

- `/help/common-problems` - Common problems overview
- `/help/common-problems/cannot-sign-in` - Cannot sign in
- `/help/common-problems/email-link-did-not-arrive` - Sign-in email did not arrive
- `/help/common-problems/access-code-does-not-work` - Access code does not work
- `/help/common-problems/cannot-open-checkout` - Cannot open checkout
- `/help/common-problems/already-have-an-active-plan` - Already have an active plan
- `/help/common-problems/cannot-find-my-trip` - Cannot find my trip
- `/help/common-problems/cannot-add-more-items-or-people` - Reached a plan limit
- `/help/common-problems/guest-account-concerns` - Questions about guest access

## Suggested Search And Navigation Collections

These are not pages by themselves, but the content tree should support them:

- By role: admin, participant, temporary user, public visitor
- By goal: start, sign in, create, add, edit, assign, pack, download, upgrade
- By module: dashboard, trips, travelers, items, to-dos, shared items, shared to-dos, bags, templates, AI, billing, profile
- By access level: public pages, signed-in pages, admin-focused pages

## Contextual Help Targets To Support Later

The page structure above is designed so these screens can later open a matching help page directly:

- Landing page
- Sign-in page
- Checkout page
- Dashboard page
- Profile page
- Travelers list and traveler form
- Items list and item form
- To-do list and to-do form
- Bags list and bag form
- Trips list and trip form
- Trip participants list and form
- Trip own items list and form
- Trip shared items list and form
- Trip own to-dos list and form
- Trip shared to-dos list and form
- Trip bags list and form
- Trip comments page
- Templates page
- AI recommendations page
- Public templates list and template detail page

## Notes

- The final wording of titles can still be adjusted to match the UI language.
- The final implementation can store these pages as structured content data and still expose them through a single Angular route entry for `/help`.
- Some nearby pages may later be merged or split after the actual help text is written, but this list is intentionally granular so each page can stay short and SEO-friendly.