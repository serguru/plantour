dotnet ef dbcontext scaffold "Host=aws-1-us-east-2.pooler.supabase.com;Database=postgres;Username=postgres.xfjlavbbexrjpdxelogw;Password=u6ktXro6ccbvb6D7;SSL Mode=Require;Trust Server Certificate=true" Npgsql.EntityFrameworkCore.PostgreSQL --context PlantourContext --output-dir Models --schema plantour --data-annotations --no-onconfiguring --force

dotnet ef dbcontext scaffold "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=Binary_09;SSL Mode=Disable" Npgsql.EntityFrameworkCore.PostgreSQL --context PlantourContext --output-dir Models --schema plantour --data-annotations --no-onconfiguring --force





dotnet ef dbcontext scaffold "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=Binary_09;SSL Mode=Disable" Npgsql.EntityFrameworkCore.PostgreSQL --context PlantourContext --output-dir DbModels --schema plantour --data-annotations --no-onconfiguring --force
