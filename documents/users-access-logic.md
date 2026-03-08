
# Sign-up with email and password

- A user signs-up with email and password.
- If a user with this email already exists the app raises an exception.
- The app creates a new user in pending access mode.
- The app tries to send a confirmation email. 
    - If failed - removes that newly created user and raises an exception.  
    - If succeeded - shows an invitation to go to the email sent and click a link.

I do not want to use third party services like Clerk. Describe in details how the passwordless auth management system should work? I need all the possible cases explained. What data is stored in the DB? How the app processes the user registering and logging? How are public login providers used? What are possible user's identification methods? What is the best way to build that system in .Net API / PostgreSQL / Angular app? Give me all the possible scenarios like Scenario 1 -> 1) User opens the registration form 2) User enters their email 3) The app validates that email ... 4) .... ; Scenario 2 -> 1)...