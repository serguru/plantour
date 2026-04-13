dotnet ef dbcontext scaffold "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=Binary_09;SSL Mode=Disable" Npgsql.EntityFrameworkCore.PostgreSQL --context PlantourContext --output-dir DbModels --schema plantour --data-annotations --no-onconfiguring --force




dotnet publish -c Release -o C:\inetpub\wwwroot\plantour-maintenance-server


.angular, node_modules, dist, documents