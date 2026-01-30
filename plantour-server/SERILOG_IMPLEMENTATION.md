# Serilog Logging Implementation Summary

## Overview
Comprehensive logging has been added to the Plantour Server project using Serilog with PostgreSQL as the primary storage backend.

## What Was Done

### 1. SQL Database Schema
**File**: `DB/Scripts/5_serilog-logging-tables.sql`
- Created `plantour.logs` table with proper column structure:
  - `id`: Auto-incrementing primary key
  - `message_template`: Log message template
  - `level`: Log level (Verbose, Debug, Information, Warning, Error, Fatal)
  - `time_stamp`: When the log was recorded
  - `exception`: Exception details if applicable
  - `log_event`: Complete log event as JSON
  - `properties`: Structured properties as JSONB (includes enrichers and context data)
- Created performance indexes on `timestamp`, `level`, and `message_template`
- Created `plantour.recent_logs` view (1000 most recent logs)
- Created `plantour.error_logs` view (500 most recent error/fatal logs)

**Setup**: Execute this script before running the application:
```bash
psql -U postgres -d postgres -f DB/Scripts/5_serilog-logging-tables.sql
```

### 2. Serilog Configuration
**Files**: 
- `appsettings.json` (Production settings)
- `appsettings.Development.json` (Development settings)

**Development Configuration**:
- Minimum level: Debug (detailed diagnostics)
- Two sinks: PostgreSQL + Console
- Rich console formatting for development
- Connection string uses local dev database

**Production Configuration**:
- Minimum level: Information (less verbose)
- Only PostgreSQL sink (for performance)
- SSL-enabled database connection
- Requires configuration of actual connection string

**Enrichers Used**:
- `FromLogContext`: Adds properties pushed via LogContext.PushProperty()
- `WithEnvironmentUserName`: Adds the current user name
- `WithMachineName`: Adds the machine name
- `WithProcessId`: Adds the process ID
- `WithThreadId`: Adds the thread ID

### 3. Program.cs Initialization
**File**: `Program.cs`
- Added Serilog imports and initialization
- Configured logging using Serilog before ASP.NET Core configuration
- Added try-catch-finally for proper application startup/shutdown logging
- Logs "Starting Plantour API application" on startup
- Logs "Application terminated unexpectedly" on fatal errors
- Calls `Log.CloseAndFlush()` to ensure all logs are written to database

### 4. GlobalExceptionHandler Enhancement
**File**: `Middleware/GlobalExceptionHandler.cs`
- Enhanced with structured logging that captures:
  - Request method and path
  - Query string
  - Remote IP address
  - User ID and email
  - User role
- Distinguishes between business exceptions and unexpected errors
- Logs appropriate severity (Warning for business errors, Error for unexpected)
- Includes full exception stack trace for debugging
- Uses Serilog's `LogContext` for contextual logging

### 5. CurrentUserMiddleware Enhancement
**File**: `Middleware/CurrentUserMiddleware.cs`
- Added logging for user authentication events
- Logs successful user authentication with user ID and email
- Logs warnings when user is not found in database
- Logs different authentication types (admin vs participant)
- Adds UserId, UserEmail, and UserRole to Serilog context for all subsequent logs in the request
- Logs public user requests (unauthenticated)

### 6. Documentation
**File**: `LOGGING_GUIDE.md`
- Comprehensive guide for using the logging system
- Setup instructions
- Configuration details for development and production
- Code examples for:
  - Basic logging
  - Structured logging with context
  - Exception logging
  - Adding logging to controllers, services, and repositories
- SQL queries for analyzing logs
- Troubleshooting guide
- Best practices for logging

## Key Features

### Structured Logging
All logs are stored as structured data in PostgreSQL, making them:
- Searchable by any field
- Analyzable for patterns
- Exportable for analysis
- Maintainable long-term

### Context Propagation
The middleware automatically adds user context to all logs:
```
UserId: <guid>
UserEmail: <email>
UserRole: Admin|Participant|Public
```

### Exception Tracking
Full exception details are captured:
- Exception message
- Exception type
- Stack trace
- Inner exceptions

### Performance
- Development: Both Console and PostgreSQL sinks for real-time visibility
- Production: Only PostgreSQL to avoid I/O overhead
- Async writing to prevent blocking

## Usage

### Building the Project
The project builds successfully with all Serilog packages:
```bash
dotnet build plantour-server.csproj
```

### Creating the Database Tables
Before running the application, execute the SQL script:
```bash
psql -U postgres -d postgres -f DB/Scripts/5_serilog-logging-tables.sql
```

### Using Logging in Code
```csharp
// Inject ILogger<T> in your service
public class MyService
{
    private readonly ILogger<MyService> _logger;
    
    public MyService(ILogger<MyService> logger)
    {
        _logger = logger;
    }
    
    public void DoWork(string userId)
    {
        _logger.LogInformation("Starting work for user {UserId}", userId);
        
        try
        {
            // Work...
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Work failed for user {UserId}", userId);
        }
    }
}
```

### Querying Logs
```sql
-- Get recent logs
SELECT * FROM logging.recent_logs LIMIT 100;

-- Get error logs
SELECT * FROM logging.error_logs;

-- Get logs for specific user
SELECT * FROM logging.logs 
WHERE properties::text LIKE '%user-id%'
ORDER BY time_stamp DESC;
```

## Next Steps

### Recommended Additional Logging

1. **Authentication Service** (`Services/TokenService.cs`, etc.)
   ```csharp
   _logger.LogInformation("Token generated for user {UserId}", userId);
   _logger.LogWarning("Token validation failed for user {UserId}", userId);
   ```

2. **CRUD Operations** (Service layer)
   ```csharp
   _logger.LogInformation("Created new {Entity} with ID {EntityId}", entityType, id);
   _logger.LogError(ex, "Failed to delete {Entity} with ID {EntityId}", entityType, id);
   ```

3. **Email Service** (`Services/BrevoEmailClient.cs`)
   ```csharp
   _logger.LogInformation("Sending email to {Email}", recipient);
   _logger.LogError(ex, "Failed to send email to {Email}", recipient);
   ```

4. **Business Logic** (Complex services like TripService)
   ```csharp
   _logger.LogInformation("Trip {TripId} status changed from {OldStatus} to {NewStatus}", tripId, oldStatus, newStatus);
   ```

### Production Deployment

1. Update `appsettings.json` with production database connection string
2. Ensure PostgreSQL `logging` schema exists in production
3. Monitor log table size and implement cleanup policy if needed
4. Adjust `MinimumLevel` based on your monitoring needs

## Database Views for Monitoring

The following views are available for easy log monitoring:

```sql
-- View recent logs
SELECT * FROM logging.recent_logs;

-- View errors
SELECT * FROM logging.error_logs;

-- Create custom views as needed
CREATE VIEW logging.auth_logs AS
SELECT time_stamp, level, message_template, properties->>'UserId' as user_id
FROM logging.logs
WHERE message_template LIKE '%authentication%'
ORDER BY time_stamp DESC;
```

## Troubleshooting

If logs are not appearing:
1. Verify PostgreSQL connection string
2. Ensure `logging` schema exists
3. Check that the `logging.logs` table was created
4. Review console output for Serilog initialization errors
5. Verify log level is not filtering your logs

## Files Modified

- `Program.cs` - Added Serilog initialization
- `appsettings.json` - Added Serilog configuration
- `appsettings.Development.json` - Added development Serilog configuration
- `Middleware/GlobalExceptionHandler.cs` - Enhanced exception logging
- `Middleware/CurrentUserMiddleware.cs` - Added user authentication logging

## Files Created

- `DB/Scripts/5_serilog-logging-tables.sql` - Database schema for logs
- `LOGGING_GUIDE.md` - Comprehensive logging documentation
