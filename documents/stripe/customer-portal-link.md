## Adding a Stripe Customer Portal Link to Your Plantour Web App

To provide your customers with access to their Stripe Customer Portal, you'll need to add the following to your Angular application:

### Backend Implementation (.NET)

1. **Create an API endpoint to generate portal sessions**:

```csharp
[HttpGet]
[Authorize]
[Route("api/stripe/create-portal-session")]
public async Task<ActionResult<PortalSessionResponse>> CreatePortalSession()
{
    // Get the current user's ID
    var userId = User.GetUserId();
    
    // Get the Stripe customer ID from your database
    var stripeCustomerId = await _dbContext.StripeCustomers
        .Where(c => c.UserId == userId)
        .Select(c => c.StripeCustomerId)
        .FirstOrDefaultAsync();
    
    if (string.IsNullOrEmpty(stripeCustomerId))
    {
        return NotFound("No Stripe customer found for this user");
    }
    
    // Create the portal session
    var options = new Stripe.BillingPortal.SessionCreateOptions
    {
        Customer = stripeCustomerId,
        ReturnUrl = $"{_configuration["AppUrl"]}/account/billing"
    };
    
    var service = new Stripe.BillingPortal.SessionService();
    var session = await service.CreateAsync(options);
    
    return Ok(new PortalSessionResponse { Url = session.Url });
}
```

### Frontend Implementation (Angular)

1. **Create a service to call your API endpoint**:

```typescript
// stripe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  constructor(private http: HttpClient) {}
  
  createPortalSession(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>('/api/stripe/create-portal-session');
  }
}
```

2. **Add a "Manage Subscription" button to your account page**:

```typescript
// account.component.ts
import { Component } from '@angular/core';
import { StripeService } from '../services/stripe.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html'
})
export class AccountComponent {
  isLoading = false;
  
  constructor(private stripeService: StripeService) {}
  
  openCustomerPortal(): void {
    this.isLoading = true;
    
    this.stripeService.createPortalSession().subscribe({
      next: (response) => {
        // Redirect to the Stripe portal
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Error creating portal session', error);
        this.isLoading = false;
        // Handle error (show message to user)
      }
    });
  }
}
```

```html
<!-- account.component.html -->
<button 
  class="btn btn-primary" 
  (click)="openCustomerPortal()" 
  [disabled]="isLoading">
  {{ isLoading ? 'Loading...' : 'Manage Subscription' }}
</button>
```

3. **Add the button to appropriate locations in your UI**:
   - Account/billing section
   - Subscription details page
   - User profile dropdown

### Additional Considerations

1. **Only show the button to users with active subscriptions**:
   - Check if the user has a Stripe customer ID before showing the button
   - Alternative: show the button but handle the error case gracefully

2. **Style the button to match your UI**:
   - Consider using an icon like a gear or pencil next to "Manage Subscription"
   - Make it clear what the button does with appropriate labeling

3. **Add proper error handling**:
   - Show meaningful error messages if the portal session creation fails
   - Provide alternative support options if the portal is unavailable

4. **Consider adding contextual guidance**:
   - Add a tooltip explaining what the portal allows users to do
   - Example: "Update payment methods, view invoices, and manage your subscription"

5. **Tracking portal usage (optional)**:
   - Add analytics to track how often users access the portal
   - Log portal session creations for troubleshooting

6. **Add session caching (optional performance enhancement)**:
   - Cache portal session URLs briefly to avoid redundant API calls
   - Remember that portal sessions expire after 5 minutes of inactivity

By implementing these components, your customers will have self-service access to manage their subscriptions, update payment methods, and view invoices directly through the Stripe Customer Portal.