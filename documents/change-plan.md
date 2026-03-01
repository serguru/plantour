## Change plan logic

Rules:

- Only registered users who are admins can change a plan and payment frequency.
- Hierarchy is based on the price: Family Monthly, Expedition monthly, Family Yearly, Expedition Yearly. 
- Downgrade is only possible starting from the next billing period.
- Upgrade is possible immediately.
- Customers cannot downgrade to the free plan. They should go to the customer portal and cancel their subscription. This will automatically set the Starter plan for them. 

UI

- There is a dedicated page for changing the plan. It is accessible from the profile page.
- At the top it shows the current plan and payment frequency. Below there are the available plans and payment frequencies.The current frequency button is disabled. 
- When user clicks to upgrade they see a confirmation "You are upgrading from X to Y. The Y will start immediately." and Ok button
- When user clicks to downgrade they see a confirmation "You are downgrading from X to Y. The Y will start from the next billing period." and Cancel (default) and OK buttons
