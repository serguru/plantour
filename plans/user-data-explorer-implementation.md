# User Data Explorer Implementation Plan

## Overview
Add a right panel to the Maintenance Users page that displays comprehensive JSON data for the currently selected user, with download functionality.

## Requirements
1. Add API endpoint to return comprehensive user data with all foreign key relationships
2. Add right panel to Users page with show/hide functionality
3. Fetch and display JSON data for currently selected user
4. Add download button to save JSON as file

## Technical Design

### 1. Backend Changes

#### 1.1 New DTO: `ComprehensiveUserDto`
```csharp
public class ComprehensiveUserDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Phone { get; init; }
    public string? GoogleSub { get; init; }
    public string? FacebookUserId { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public bool Temporary { get; init; }
    public string? ParticipantCode { get; init; }
    
    // Related entities
    public AccessTypeDto? AccessType { get; init; }
    public CurrencyDto? Currency { get; init; }
    
    // Collections
    public IReadOnlyList<UserSettingDto> UserSettings { get; init; }
    public IReadOnlyList<UserKeyDto> UserKeys { get; init; }
    public IReadOnlyList<UserThingDto> UserThings { get; init; }
    public IReadOnlyList<UserTodoDto> UserTodos { get; init; }
    public IReadOnlyList<UserPackageDto> UserPackages { get; init; }
    public IReadOnlyList<AdminsParticipantDto> AdminsParticipantAdmins { get; init; }
    public IReadOnlyList<AdminsParticipantDto> AdminsParticipantParticipants { get; init; }
    public IReadOnlyList<AiPromptDto> AiPrompts { get; init; }
    public IReadOnlyList<AiTripPlanDto> AiTripPlans { get; init; }
    public IReadOnlyList<RefreshTokenDto> RefreshTokens { get; init; }
    public IReadOnlyList<TripDto> Trips { get; init; }
    public AiPromptCheckDto? AiPromptCheck { get; init; }
    
    // Indirect relationships through AdminsParticipant
    public IReadOnlyList<TripUserDto> TripUsers { get; init; }
    public IReadOnlyList<TripUserThingDto> TripUserThings { get; init; }
    public IReadOnlyList<TripUserTodoDto> TripUserTodos { get; init; }
    public IReadOnlyList<TripUserExpenseDto> TripUserExpenses { get; init; }
    public IReadOnlyList<TripUserPackageDto> TripUserPackages { get; init; }
    
    // Other indirect relationships
    public IReadOnlyList<ApiVisitDto> ApiVisits { get; init; }
    public IReadOnlyList<ContactSubmissionDto> ContactSubmissions { get; init; }
}
```

#### 1.2 Extended Interface: `IPlantourUsersService`
```csharp
public interface IPlantourUsersService
{
    Task<IReadOnlyList<PlantourUserRowDto>> GetAllAsync(
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default);
    
    // New method
    Task<ComprehensiveUserDto> GetComprehensiveDataAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
```

#### 1.3 Service Implementation: `PlantourUsersService`
- Add new method `GetComprehensiveDataAsync`
- Use EF Core `Include`/`ThenInclude` to load all related data
- Map entities to DTOs using AutoMapper
- Handle null/empty collections appropriately

#### 1.4 Controller Endpoint: `UsersController.cs`
```csharp
[HttpGet("{id:guid}/comprehensive")]
public async Task<ActionResult<ComprehensiveUserDto>> GetComprehensiveData(
    Guid id, 
    CancellationToken cancellationToken)
{
    var userData = await _plantourUsersService.GetComprehensiveDataAsync(id, cancellationToken);
    return Ok(userData);
}
```

### 2. Frontend Changes

#### 2.1 New Service Method: `PlantourUsersService`
```typescript
getComprehensiveUserData(userId: string): Observable<ComprehensiveUserDto> {
    return this.http.get<ComprehensiveUserDto>(
        `${this.apiBaseUrl}/users/${userId}/comprehensive`
    );
}
```

#### 2.2 Extended Users Page Component
- Add `selectedUserId` signal to track selected row
- Add `showRightPanel` signal to control panel visibility
- Add `comprehensiveData` signal to store fetched data
- Add `isLoadingData` signal for loading state

#### 2.3 Right Panel Component
Create new component or inline template in users-page.html:
```html
@if (showRightPanel()) {
  <div class="right-panel">
    <div class="right-panel-header">
      <h3>User Data Explorer</h3>
      <button (click)="hideRightPanel()">Close</button>
      <button (click)="downloadJson()" [disabled]="!comprehensiveData()">
        Download JSON
      </button>
    </div>
    
    @if (isLoadingData()) {
      <div class="loading">Loading user data...</div>
    } @else if (comprehensiveData()) {
      <pre class="json-display">{{ comprehensiveData() | json }}</pre>
    } @else {
      <div class="no-data">Select a user to view comprehensive data</div>
    }
  </div>
}
```

#### 2.4 Row Selection
Add click handler to table rows:
```html
<tr hlmTr 
    [attr.data-state]="row.getIsSelected() && 'selected'" 
    [class.results-row--selected]="row.original.id === selectedUserId()"
    (click)="onRowClick(row.original)">
```

#### 2.5 CSS Styling
Add styles for:
- Right panel positioning (fixed/absolute)
- JSON display with monospace font and scroll
- Selected row highlighting
- Panel animations

#### 2.6 Download Functionality
```typescript
downloadJson(): void {
    const data = this.comprehensiveData();
    if (!data) return;
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${data.id}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

### 3. Database Considerations
- The comprehensive query will be heavy; consider performance implications
- Use `AsNoTracking()` for read-only operations
- Consider pagination for large collections if needed
- Add indexes on foreign key columns if not already present

### 4. Testing Strategy

#### 4.1 Backend Tests
- Unit test for `GetComprehensiveDataAsync` method
- Integration test for API endpoint
- Verify all related data is included
- Test with non-existent user ID (should return 404)

#### 4.2 Frontend Tests
- Component test for Users page with right panel
- Service test for comprehensive data fetching
- UI test for row selection and panel visibility
- Download functionality test

#### 4.3 Performance Tests
- Measure API response time with realistic data
- Test with users having many related records
- Consider adding response caching for repeated requests

### 5. Implementation Steps

1. **Create DTOs** for all related entities
2. **Extend service interface** and implementation
3. **Add controller endpoint**
4. **Update client service** with new method
5. **Modify Users page component**:
   - Add signals for panel state
   - Add row selection logic
   - Add data fetching logic
6. **Add right panel HTML/CSS**
7. **Implement download functionality**
8. **Add tests**
9. **Documentation and deployment**

### 6. Potential Issues and Mitigations

| Issue | Mitigation |
|-------|------------|
| Large JSON response | Consider truncation or pagination for collections |
| Performance impact | Add caching, optimize queries, consider async loading |
| Memory usage | Use streaming for large responses, client-side virtualization |
| Security | Ensure proper authorization, don't expose sensitive data |

### 7. Future Enhancements
1. Search/filter within JSON data
2. Expand/collapse sections of JSON
3. Export in different formats (CSV, XML)
4. Compare two users' data
5. Historical data snapshots

## Timeline
The implementation can be broken into 2-3 development sprints:
1. Backend API and service layer
2. Frontend panel and basic functionality
3. Testing, optimization, and polish

## Success Criteria
1. API endpoint returns comprehensive user data with all foreign keys
2. Right panel shows/hides correctly
3. Selected user data loads and displays properly
4. JSON download works with correct filename and content
5. Performance is acceptable with realistic data volumes