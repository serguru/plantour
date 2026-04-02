This file contains instructions on how to create a Postgres pgAdmin server connection with a new read only user

- Have already registered server created using the provider instructions
- Right click on Login/Group roles and enter app_reader/xxx
- A new server app_reader user is created
Neon app_reader/Binary_0909
- Right click on the db, select Properties/Security/+ and add app_reader with "connect"
- Right click on the schema, select Properties/Security/+ and add app_reader with "usage"
- default privileges - for future tables
- Right click on the schema, select Grant Wizard, enter search "Table", select all, "Next" Privileges - app_reader - "select" Next Finish


Password for app_reader in Render Postgres Binary_0909

New
gemini-3-flash-preview

Old
gemini-3.1-flash-lite-preview




