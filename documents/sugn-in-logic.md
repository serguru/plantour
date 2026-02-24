## User sign in logic ##


## Methods used ##

1. SignInByEmail(string email, string password): boolean

Check a user's email/password hash. If correct, return true. If not, return false.

2. SignInByProvider(string token): boolean

Get a response from Google/Facebook. If positive check if the email exists in the database. If not, create a new user with that email with no password and Starter plan. Return true. If negative return false.


3. GetPlanPriceBySubscriptionId

Send a request to Paddle. If negative - return null. If positive return PlanPrice.


Access rules:

Not signed in users cannot:
- have access to the not public parts of the app


Signed in users

Participants cannot:
- add/edit/delete travelers;
- add/edit/delete shared items;
- add/edit/delete trips;

Admins cannot:
- have a list of trip items if they are not included into a list of trip participants
- have a list of trip bags if they are not included into a list of trip participants

Any user cannot:
- see another traveler's list of dictionary items
- see another traveler's list of dictionary bags
- see another traveler's list of trip items
- see another traveler's list of trip bags

- add a dictionary item over a limit set for their subscription
- add a trip item over a limit set for their subscription
- add more travelers to a dictionary than the limit set for their subscription
- add more travelers to a trip than the limit set for their subscription
- send more than a certain number of regular prompts to the AI assistant per the period, depending on their subscription
- send more than a certain number of extended prompts to the AI assistant per the period, depending on their subscription

- downgrade or cancel their current subscription until the end of the current billing period
- have authorized access to the app if they signed up with email/password and did not verify their email within a certain period after signing up
- have authorized access to the app if their token is expaired or invalid, they should be redirected to the sign-in page
- accept shared items assigned to other travelers
- refuse shared items assigned to other travelers
- finish shared items assigned to other travelers

Guests cannot:
- have access to the app for more than a certain period of time without signing in





