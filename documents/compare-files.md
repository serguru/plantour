git show dev:"plantour-server/DB/Scripts/1 plantour-tables.sql" > "$env:TEMP\plantour-v1.sql"
git show v2/dev:"plantour-server/DB/Scripts/1 plantour-tables.sql" > "$env:TEMP\plantour-v2.sql"
code -d "$env:TEMP\plantour-v1.sql" "$env:TEMP\plantour-v2.sql"

