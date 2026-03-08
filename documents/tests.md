How to test user signup, signin, and email confirmation flows:

# Tested
- Delete all users from DB
- Make sure a user sechevan@gmail.com does not exist in Paddle
- Sign up with email
- See the email confirmation needed message
- Go to email and click
- See the Welcome message 
- Get redirected to the Dashboard
- Go to Profile and see Starter Free plan
- Click Choose plan
- See the 4 upgrades available

Test
- Delete all users from DB
- Make sure a user sechevan@gmail.com does not exist in Paddle
- Sign up with email
- See the email confirmation needed message
- Ensure user panding and not confirmed email row exists in DB
- Manually update confirmation row to be expired
- Go to email and click
- See the error message asking to re-signup
- Ensure user is not panding and no confirmation email row exists in DB
- Sign up again with the same email
- See the email confirmation needed message
- Go to email and click
- See the Welcome message 
- Get redirected to the Dashboard
- Go to Profile and see Starter Free plan
- Click Choose plan
- See the 4 upgrades available







