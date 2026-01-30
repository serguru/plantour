# Serilog Logging Guide for Plantour Server

## Overview

This project uses **Serilog** for structured logging with PostgreSQL as the primary sink. Serilog provides a powerful, flexible logging framework that captures structured data, making logs searchable and analyzable.

## Setup

### Prerequisites

- Serilog NuGet packages (already installed):
  - `Serilog.AspNetCore`
  - `Serilog.Sinks.PostgreSQL`
  - `Serilog.Settings.Configuration`
  - `Serilog.Enrichers.Environment`
  - `Serilog.Enrichers.Process`

### Database Setup

Before running the application, execute the SQL script to create the logging tables:

```bash
psql -U postgres -d postgres -f DB/Scripts/5_serilog-logging-tables.sql
```

This creates:
- `plantour.logs` table - stores all log entries
- `plantour.recent_logs` view - shows the 1000 most recent logs
- `plantour.error_logs` view - shows the 500 most recent error/fatal logs

## Configuration

### appsettings.json (Production)

```json
"Serilog": {
  "Using": ["Serilog.Sinks.PostgreSQL", "Serilog.Enrichers.Environment", "Serilog.Enrichers.Process"],
  "MinimumLevel": "Information",
  "WriteTo": [
    {
      "Name": "PostgreSQL",
      "Args": {
        "connectionString": "Host=yourdomain;Port=5432;Database=plantour;Username=plantour_user;Password=YOUR_PASSWORD;SSL Mode=Require",
        "tableName": "plantour.logs",
        "schemaName": "plantour",
        "needAutoCreateTable": true,
        "needAutoCreateSchema": true,
        "failureCallback": "(exception) => Console.WriteLine($'PostgreSQL sink error: {exception}')"
      }
    }
  ],
  "Enrich": ["FromLogContext", "WithEnvironmentUserName", "WithMachineName", "WithProcessId", "WithThreadId"],
  "Properties": {
    "Application": "PlantourServer",
    "Environment": "Production"
  }
}
```

### appsettings.Development.json (Development)

```json
"Serilog": {
  "Using": ["Serilog.Sinks.PostgreSQL", "Serilog.Enrichers.Environment", "Serilog.Enrichers.Process"],
  "MinimumLevel": "Debug",
  "WriteTo": [
    {
      "Name": "PostgreSQL",
      "Args": {
        "connectionString": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=Binary_09;SSL Mode=Disable",
        "tableName": "plantour.logs",
        "schemaName": "plantour",
        "needAutoCreateTable": true,
        "needAutoCreateSchema": true,
        "failureCallback": "(exception) => Console.WriteLine($'PostgreSQL sink error: {exception}')"
      }
    },
    {
      "Name": "Console",
      "Args": {
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
      }
    }
  ],
  "Enrich": ["FromLogContext", "WithEnvironmentUserName", "WithMachineName", "WithProcessId", "WithThreadId"],
  "Properties": {
    "Application": "PlantourServer",
    "Environment": "Development"
  }
}
```

## Log Levels

- **Verbose**: Very detailed diagnostic information (rarely needed in production)
- **Debug**: Diagnostic information useful for development (e.g., database queries, authentication details)
- **Information**: General informational messages about application flow (e.g., user login, application start)
- **Warning**: Warning messages for potentially problematic situations (e.g., user not found, deprecated API usage)
- **Error**: Error messages for recoverable errors (e.g., failed business logic)
- **Fatal**: Critical errors that may cause application shutdown

## Using Logging in Code

### Basic Logging

```csharp
using Microsoft.Extensions.Logging;

public class MyService
{
    private readonly ILogger<MyService> _logger;

    public MyService(ILogger<MyService> logger)
    {
        _logger = logger;
    }

    public void DoSomething(string userId)
    {
        _logger.LogInformation("Starting operation for user {UserId}", userId);
        
        try
        {
            // Do work...
            _logger.LogDebug("Operation completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Operation failed for user {UserId}", userId);
            throw;
        }
    }
}
```

### Structured Logging with Context

Use Serilog's `LogContext` to add contextual information that will be included in all logs within a scope:

```csharp
using Serilog.Context;

public async Task ProcessRequest(Guid userId, string email)
{
    using (LogContext.PushProperty("UserId", userId))
    using (LogContext.PushProperty("Email", email))
    {
        _logger.LogInformation("Processing request");
        // All logs within this scope will include UserId and Email
        await DoWork();
    }
}
```

### Exception Logging

Always pass the exception as the first parameter after the message template:

```csharp
try
{
    // Risky operation
}
catch (Exception ex)
{
    // BAD - exception details may be lost
    _logger.LogError("Operation failed: {Message}", ex.Message);
    
    // GOOD - full exception details are logged
    _logger.LogError(ex, "Operation failed for user {UserId}", userId);
}
```

## Where Logging is Currently Used

### 1. **GlobalExceptionHandler** (`Middleware/GlobalExceptionHandler.cs`)
   - Logs all unhandled exceptions with full context
   - Includes request method, path, query string, remote IP, user ID, and user role
   - Distinguishes between business exceptions (BaseApiException) and unexpected errors
   - Logs appropriate severity (Warning for business errors, Error for unexpected)

### 2. **CurrentUserMiddleware** (`Middleware/CurrentUserMiddleware.cs`)
   - Logs successful user authentication
   - Logs when user is not found in database
   - Logs admin and participant user authentications
   - Adds UserId, UserEmail, and UserRole to the log context for all subsequent logs in the request

## Examples of Where to Add Logging

### Controllers
```csharp
[HttpPost("login")]
public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
{
    _logger.LogInformation("Login attempt for email: {Email}", request.Email);
    
    var result = await _authService.LoginAsync(request.Email, request.Password);
    
    if (result.Success)
    {
        _logger.LogInformation("Login successful for email: {Email}", request.Email);
    }
    else
    {
        _logger.LogWarning("Login failed for email: {Email}. Reason: {Reason}", 
            request.Email, result.ErrorMessage);
    }
    
    return Ok(result);
}
```

### Services
```csharp
public async Task<Trip> CreateTripAsync(CreateTripDto dto, Guid adminId)
{
    _logger.LogInformation("Creating new trip for admin {AdminId}. Trip name: {TripName}", 
        adminId, dto.Name);
    
    try
    {
        var trip = new Trip { /* ... */ };
        await _repository.AddAsync(trip);
        
        _logger.LogInformation("Trip created successfully. TripId: {TripId}", trip.Id);
        return trip;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to create trip for admin {AdminId}", adminId);
        throw;
    }
}
```

### Repository Operations
```csharp
public async Task<User?> GetByEmailAsync(string email)
{
    _logger.LogDebug("Querying user by email: {Email}", email);
    
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    
    if (user == null)
    {
        _logger.LogDebug("User not found for email: {Email}", email);
    }
    
    return user;
}
```

## Querying Logs

### Using PostgreSQL

Connect to the database and query logs:

```sql
-- Get the 100 most recent logs
SELECT * FROM plantour.recent_logs LIMIT 100;

-- Get error logs for the last hour
SELECT * FROM plantour.error_logs 
WHERE time_stamp > NOW() - INTERVAL '1 hour';

-- Get logs for a specific user
SELECT * FROM plantour.logs 
WHERE properties::text LIKE '%"UserId": "user-id-here"%' 
ORDER BY time_stamp DESC 
LIMIT 100;

-- Get logs by level
SELECT * FROM plantour.logs 
WHERE level = 'Error' 
ORDER BY time_stamp DESC 
LIMIT 50;

-- Get logs with exceptions
SELECT * FROM plantour.logs 
WHERE exception IS NOT NULL 
ORDER BY time_stamp DESC 
LIMIT 50;
```

### Viewing JSON Properties

The `properties` column contains structured data as JSONB:

```sql
-- Extract specific properties
SELECT 
    time_stamp,
    level,
    message_template,
    properties->>'UserId' as user_id,
    properties->>'UserEmail' as user_email,
    properties->>'RequestPath' as request_path
FROM plantour.logs 
WHERE time_stamp > NOW() - INTERVAL '1 hour'
ORDER BY time_stamp DESC;
```

## Log Data Structure

Each log entry in the database contains:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-incrementing primary key |
| message_template | TEXT | The log message template (e.g., "User {UserId} logged in") |
| level | VARCHAR | Log level (Verbose, Debug, Information, Warning, Error, Fatal) |
| time_stamp | TIMESTAMP | When the log was recorded |
| exception | TEXT | Exception details (if applicable) |
| log_event | TEXT | Complete log event as JSON |
| properties | JSONB | Structured properties including enrichers and context data |

## Enrichers

Serilog enrichers automatically add contextual information to all logs:

- **FromLogContext**: Adds properties pushed via `LogContext.PushProperty()`
- **WithEnvironmentUserName**: Adds the Windows/Unix user name
- **WithMachineName**: Adds the machine name
- **WithProcessId**: Adds the process ID
- **WithThreadId**: Adds the thread ID

## Performance Considerations

### Development
- `MinimumLevel` is set to `Debug` for detailed diagnostics
- Both Console and PostgreSQL sinks are enabled
- Use this for development and debugging

### Production
- `MinimumLevel` is set to `Information` to reduce log volume
- Only PostgreSQL sink is enabled
- Verbose and Debug logs are filtered out
- Update log levels in appsettings.json as needed based on monitoring

### Database Maintenance
Monitor the `plantour.logs` table size. Consider:

1. **Regular cleanup** - Archive or delete logs older than X days:
```sql
DELETE FROM plantour.logs 
WHERE time_stamp < NOW() - INTERVAL '30 days';
```

2. **Partitioning** - For high-volume logging, consider table partitioning by date

3. **Indexes** - Existing indexes help with common queries:
   - `idx_logs_timestamp` - For time-based queries
   - `idx_logs_level` - For filtering by log level
   - `idx_logs_message_template` - For finding specific message types

## Troubleshooting

### PostgreSQL Sink Not Writing Logs
1. Check the PostgreSQL connection string in appsettings
2. Ensure the `plantour` schema exists
3. Verify the `plantour.logs` table exists
4. Check that the database user has CREATE TABLE permissions (for `needAutoCreateTable: true`)
5. Check console output for PostgreSQL sink errors

### Logs Not Appearing
1. Check that `MinimumLevel` is set appropriately
2. Verify the log level in your code matches the minimum level
3. For development, check both Console and PostgreSQL sinks
4. Check application logs for any initialization errors

### Large Log Table
1. Review query performance - ensure indexes are being used
2. Consider archiving old logs to a separate table
3. Implement log retention policy
4. Consider increasing PostgreSQL maintenance settings

## Best Practices

1. **Use structured logging**: Always pass contextual data as parameters:
   ```csharp
   // Good
   _logger.LogInformation("User {UserId} logged in", userId);
   
   // Bad
   _logger.LogInformation($"User {userId} logged in");
   ```

2. **Log at appropriate levels**:
   - Debug: Development diagnostics
   - Information: Significant application events
   - Warning: Potentially problematic situations
   - Error: Errors that don't stop the application
   - Fatal: Errors that may cause shutdown

3. **Include context**: Add relevant IDs, names, and other context:
   ```csharp
   _logger.LogInformation("Trip created. TripId: {TripId}, AdminId: {AdminId}, TripName: {TripName}",
       trip.Id, adminId, trip.Name);
   ```

4. **Don't log sensitive data**: Avoid logging passwords, tokens, or sensitive personal information

5. **Handle exceptions properly**: Always pass the exception object to the logger:
   ```csharp
   _logger.LogError(ex, "Operation failed");
   ```

6. **Use LogContext for correlation**: Add correlation IDs or request IDs to trace requests:
   ```csharp
   var requestId = context.TraceIdentifier;
   using (LogContext.PushProperty("RequestId", requestId))
   {
       // All logs in this scope include RequestId
   }
   ```

## Additional Resources

- [Serilog Documentation](https://serilog.net/)
- [Serilog PostgreSQL Sink](https://github.com/b00ts/serilog-sinks-postgresql)
- [Structured Logging](https://en.wikipedia.org/wiki/Structured_logging)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
