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



Я почти закончил разработку нового проекта Plantour. Сейчас тествая версия QA публично доступна для тестирования по адресу https://plantour-client-qa.onrender.com. Хочу в ближайшее время развернуть production версию. Но мне отчаянно не хватает тестеров! Не могли бы вы с Максимом сделать мне одолжение и потестировать его? Кроме того, ты же ведь популярный блогер! Если посчитаешь это возможным и опубликуешь в своём блоге объявление о том, что нужны тестеры, возможно, кто-то и поможет. В качестве благодарности я предлагаю 50% скидку для тех, кто реально поможет.
P.S. Имейте в виду, что QA развернута под холодным стартом. Это означает, что страница https://plantour-client-qa.onrender.com может в течение минуты показывать черный служебный экран прежде чем откроется Plantour.
