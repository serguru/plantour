Blue green strategy

There are two stacks, green and blue.
Both are used the same DB.

# Green
- branch - main
- green.client
- green.server

# Blue
- branch - pred-prod
- blue.client
- blue.server

There are 2 more environments, dev in the local computer and qa free on Render/Neon.

Normally the green environment is used and the blue environment is in pause.

The blue services are connected to the prep-prod branch and the green services are connected to the main branch. No pred-prod settings. Only Production settings are used for both.

All the initial changes are merged to the qa branch from the dev branch and tested in the qa environment. Once everything is ok the changes are merged to the pred-prod branch from the qa.

The blue services are unpaused. They will read the latest pred-prod commit and deploy.
Switch custom domains plantour.app and api.plantour.app from the green services to the blue services. Pause green services. The users will work with a new app version via the blue services. If a small issue found - merge dev -> qa -> pred-prod -> blue services. Wait for a few days. If everything ok - merge changes to the main branch from the pred-prod branch, unpause the green branches and switch custom domains plantour.app and api.plantour.app from the blue services back to the green services. If something went wrong - switch back to blue services.

The above workflow does not take the DB into account. If changes are made in the DB there should be 2 scripts: do changes and rollback changes. If something went wrong the changes must be rolled back using the second script.

This strategy allows making any, even havy, changes in the project because one pair of services are everything up and running. If the DB changes are destructive it is necessary to make a db backup and restore that backup if rolling changes back.







