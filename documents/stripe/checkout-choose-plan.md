# Complete Stripe Integration Solution

Here's a comprehensive implementation of the subscription flow where users select a plan, pay with Stripe Checkout, and then complete registration.

## 1. Backend: StripeController (C#/.NET)

```csharp
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

[Route("api/[controller]")]
[ApiController]
public class StripeController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly IConfiguration _config;

    public StripeController(IStripeService stripeService, IConfiguration config)
    {
        _stripeService = stripeService;
        _config = config;
    }

    // Create checkout session for subscription
    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession()
    {
        try {
            var session = await _stripeService.CreateCheckoutSession();
            return Ok(new { sessionId = session.Id, url = session.Url });
        }
        catch (Exception ex) {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Webhook handler
    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        try {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _config["Stripe:WebhookSecret"]
            );

            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                await _stripeService.HandleCompletedCheckout(session);
            }

            return Ok();
        }
        catch (Exception ex) {
            return BadRequest(ex.Message);
        }
    }

    // Check registration status
    [HttpGet("registration-status/{token}")]
    public async Task<IActionResult> CheckRegistrationStatus(string token)
    {
        var status = await _stripeService.CheckRegistrationStatus(token);
        return Ok(new { status });
    }

    // Complete user registration
    [HttpPost("complete-registration")]
    public async Task<IActionResult> CompleteRegistration([FromBody] UserRegistrationDto model)
    {
        try {
            await _stripeService.CompleteRegistration(model);
            return Ok(new { success = true });
        }
        catch (Exception ex) {
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

## 2. Backend: StripeService

```csharp
public interface IStripeService
{
    Task<Session> CreateCheckoutSession();
    Task HandleCompletedCheckout(Session session);
    Task<string> CheckRegistrationStatus(string token);
    Task CompleteRegistration(UserRegistrationDto model);
}

public class StripeService : IStripeService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _dbContext;
    private readonly IEmailService _emailService;

    public StripeService(IConfiguration config, AppDbContext dbContext, IEmailService emailService)
    {
        _config = config;
        _dbContext = dbContext;
        _emailService = emailService;
        StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
    }

    public async Task<Session> CreateCheckoutSession()
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = _config["Stripe:BasicPlanPriceId"],
                    Quantity = 1,
                },
                new SessionLineItemOptions
                {
                    Price = _config["Stripe:PremiumPlanPriceId"],
                    Quantity = 1,
                }
            },
            SuccessUrl = _config["Stripe:SuccessUrl"] + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = _config["Stripe:CancelUrl"],
            AllowPromotionCodes = true
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);
        return session;
    }

    public async Task HandleCompletedCheckout(Session session)
    {
        // Generate registration token
        var registrationToken = Guid.NewGuid().ToString();
        
        // Create pending user record
        var pendingUser = new PendingUser
        {
            Email = session.CustomerDetails.Email,
            StripeCustomerId = session.CustomerId,
            StripeSubscriptionId = session.SubscriptionId,
            RegistrationToken = registrationToken,
            CreatedAt = DateTime.UtcNow,
            IsRegistered = false
        };
        
        _dbContext.PendingUsers.Add(pendingUser);
        await _dbContext.SaveChangesAsync();
        
        // Send registration email
        await _emailService.SendRegistrationEmail(
            session.CustomerDetails.Email, 
            registrationToken
        );
    }

    public async Task<string> CheckRegistrationStatus(string token)
    {
        var pendingUser = await _dbContext.PendingUsers
            .FirstOrDefaultAsync(u => u.RegistrationToken == token);
            
        if (pendingUser == null)
            return "invalid";
            
        return pendingUser.IsRegistered ? "completed" : "pending";
    }

    public async Task CompleteRegistration(UserRegistrationDto model)
    {
        var pendingUser = await _dbContext.PendingUsers
            .FirstOrDefaultAsync(u => u.RegistrationToken == model.Token);
            
        if (pendingUser == null)
            throw new Exception("Invalid registration token");
            
        if (pendingUser.IsRegistered)
            throw new Exception("User has already completed registration");
            
        // Create actual user account
        var user = new User
        {
            Username = model.Username,
            Email = pendingUser.Email,
            PasswordHash = HashPassword(model.Password),
            StripeCustomerId = pendingUser.StripeCustomerId,
            StripeSubscriptionId = pendingUser.StripeSubscriptionId,
            CreatedAt = DateTime.UtcNow
        };
        
        _dbContext.Users.Add(user);
        
        // Mark pending user as registered
        pendingUser.IsRegistered = true;
        
        await _dbContext.SaveChangesAsync();
    }
    
    private string HashPassword(string password)
    {
        // Use your preferred password hashing method
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}

public class UserRegistrationDto
{
    public string Token { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}
```

## 3. Angular Frontend Service

```typescript
// stripe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = environment.apiUrl + '/api/stripe';

  constructor(private http: HttpClient) { }

  createCheckoutSession(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-checkout-session`, {});
  }

  checkRegistrationStatus(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/registration-status/${token}`);
  }

  completeRegistration(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complete-registration`, userData);
  }
}
```

## 4. Angular Component: Join Button

```typescript
// join.component.ts
import { Component } from '@angular/core';
import { StripeService } from '../../services/stripe.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-join',
  template: `
    <button 
      [disabled]="isLoading" 
      (click)="redirectToCheckout()" 
      class="join-btn">
      {{ isLoading ? 'Processing...' : 'Join Plantour' }}
    </button>
  `,
  styles: [`
    .join-btn {
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .join-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class JoinComponent {
  isLoading = false;

  constructor(
    private stripeService: StripeService,
    private loadingService: LoadingService
  ) {}

  redirectToCheckout() {
    this.isLoading = true;
    
    this.stripeService.createCheckoutSession().subscribe({
      next: (response) => {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Error creating checkout session:', error);
        this.isLoading = false;
        alert('Unable to process your request. Please try again later.');
      }
    });
  }
}
```

## 5. Angular Component: Registration Completion

```typescript
// complete-registration.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.scss']
})
export class CompleteRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  token: string;
  isLoading = true;
  isValid = false;
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {}
  
  ngOnInit() {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
    
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        // In real app, verify session and get token from your backend
        this.checkRegistrationSession(sessionId);
      } else {
        this.token = this.route.snapshot.paramMap.get('token');
        this.validateToken();
      }
    });
  }
  
  validateToken() {
    if (!this.token) {
      this.isValid = false;
      this.errorMessage = 'Invalid registration link';
      this.isLoading = false;
      return;
    }
    
    this.stripeService.checkRegistrationStatus(this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.status === 'invalid') {
          this.isValid = false;
          this.errorMessage = 'This registration link is invalid or has expired';
        } else if (response.status === 'completed') {
          this.isValid = false;
          this.errorMessage = 'Your registration has already been completed';
        } else {
          this.isValid = true;
        }
      },
      error: () => {
        this.isLoading = false;
        this.isValid = false;
        this.errorMessage = 'Unable to verify registration. Please try again later.';
      }
    });
  }
  
  checkRegistrationSession(sessionId: string) {
    // In a real application, you would validate the checkout session
    // and retrieve the registration token from your backend
    // For demo, we'll simulate this
    this.isLoading = true;
    
    // Simulating backend call to validate session and get token
    setTimeout(() => {
      this.token = 'simulated-token-for-' + sessionId;
      this.isValid = true;
      this.isLoading = false;
    }, 1000);
  }
  
  checkPasswords(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('confirmPassword').value;
    return password === confirmPassword ? null : { notMatching: true };
  }
  
  onSubmit() {
    if (this.registrationForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const userData = {
      token: this.token,
      username: this.registrationForm.value.username,
      password: this.registrationForm.value.password
    };
    
    this.stripeService.completeRegistration(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/registration-success']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
```

## 6. Complete Registration HTML Template

```html
<!-- complete-registration.component.html -->
<div class="registration-container">
  <h2>Complete Your Plantour Registration</h2>
  
  <div *ngIf="isLoading" class="loading">
    <p>Loading...</p>
  </div>
  
  <div *ngIf="!isLoading && !isValid" class="error-message">
    <p>{{ errorMessage }}</p>
    <a routerLink="/contact">Need help? Contact support</a>
  </div>
  
  <form *ngIf="!isLoading && isValid" [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="username">Username</label>
      <input 
        type="text" 
        id="username" 
        formControlName="username" 
        autocomplete="username">
      <div *ngIf="registrationForm.get('username').invalid && registrationForm.get('username').touched" class="error">
        Username is required and must be at least 4 characters.
      </div>
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        formControlName="password" 
        autocomplete="new-password">
      <div *ngIf="registrationForm.get('password').invalid && registrationForm.get('password').touched" class="error">
        Password is required and must be at least 8 characters.
      </div>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input 
        type="password" 
        id="confirmPassword" 
        formControlName="confirmPassword" 
        autocomplete="new-password">
      <div *ngIf="registrationForm.hasError('notMatching') && registrationForm.get('confirmPassword').touched" class="error">
        Passwords do not match.
      </div>
    </div>
    
    <button 
      type="submit" 
      [disabled]="registrationForm.invalid || isLoading" 
      class="submit-btn">
      Complete Registration
    </button>
  </form>
</div>
```

## Step-by-step flow:

1. **User Clicks "Join" Button:**
   - The JoinComponent triggers a call to `stripeService.createCheckoutSession()`
   - The backend creates a Stripe Checkout session with multiple subscription options
   - The frontend redirects the user to the Stripe Checkout URL

2. **User Makes Payment:**
   - User selects a subscription plan on Stripe Checkout
   - User enters their payment details and completes payment
   - Stripe creates a customer and subscription automatically
   - Stripe redirects user back to your success URL with session_id parameter

3. **Webhook Processing:**
   - Stripe sends a webhook event `checkout.session.completed` to your backend
   - Your webhook handler extracts customer and subscription information
   - It creates a pending user record with a registration token
   - It sends an email with a link to complete registration

4. **User Completes Registration:**
   - User clicks the link in the email or is redirected from Checkout success page
   - CompleteRegistrationComponent validates the token/session
   - User fills in username and password to complete their account
   - The form submission calls `stripeService.completeRegistration()`
   - Backend creates a permanent user record linked to the Stripe customer

5. **Subscription Management:**
   - For future subscription management, you can implement a customer portal
   - The user is now registered and can access your application

This implementation handles both the payment and user registration process while ensuring that users have access to their subscriptions once they've completed registration.



===========================================================================


You're absolutely right. Let me provide a corrected implementation that offers two plans (Basic and Premium), each with both monthly and yearly pricing options:

## 1. Backend: StripeService (Updated)

```csharp
public async Task<Session> CreateCheckoutSession()
{
    // Define price IDs for each plan and billing interval
    var options = new SessionCreateOptions
    {
        PaymentMethodTypes = new List<string> { "card" },
        Mode = "subscription",
        LineItems = new List<SessionLineItemOptions>
        {
            // Basic Plan - Monthly
            new SessionLineItemOptions
            {
                Price = _config["Stripe:BasicPlanMonthlyPriceId"],
                Quantity = 1,
            },
            // Basic Plan - Yearly
            new SessionLineItemOptions
            {
                Price = _config["Stripe:BasicPlanYearlyPriceId"],
                Quantity = 1,
            },
            // Premium Plan - Monthly
            new SessionLineItemOptions
            {
                Price = _config["Stripe:PremiumPlanMonthlyPriceId"],
                Quantity = 1,
            },
            // Premium Plan - Yearly
            new SessionLineItemOptions
            {
                Price = _config["Stripe:PremiumPlanYearlyPriceId"],
                Quantity = 1,
            }
        },
        SuccessUrl = _config["Stripe:SuccessUrl"] + "?session_id={CHECKOUT_SESSION_ID}",
        CancelUrl = _config["Stripe:CancelUrl"],
        AllowPromotionCodes = true
    };

    var service = new SessionService();
    var session = await service.CreateAsync(options);
    return session;
}
```

## 2. Setting Up the Prices in Stripe Dashboard

Before implementing the code, you'll need to create two products with their respective prices in the Stripe Dashboard:

1. Create a "Basic" product:
   - Create a monthly price (e.g., $9.99/month)
   - Create a yearly price (e.g., $99/year)

2. Create a "Premium" product:
   - Create a monthly price (e.g., $19.99/month)
   - Create a yearly price (e.g., $199/year)

3. Store the price IDs in your application configuration:
```json
{
  "Stripe": {
    "SecretKey": "sk_test_123",
    "PublicKey": "pk_test_123",
    "WebhookSecret": "whsec_123",
    "BasicPlanMonthlyPriceId": "price_basic_monthly",
    "BasicPlanYearlyPriceId": "price_basic_yearly",
    "PremiumPlanMonthlyPriceId": "price_premium_monthly", 
    "PremiumPlanYearlyPriceId": "price_premium_yearly",
    "SuccessUrl": "https://yourdomain.com/complete-registration",
    "CancelUrl": "https://yourdomain.com/plans"
  }
}
```

## 3. Implementing Subscription Upsells (Optional Enhancement)

For a better user experience, you might want to set up subscription upsells in the Stripe Dashboard to encourage yearly subscriptions. For each monthly price, set the yearly price of the same plan as an upsell. This will display savings to the customer when they select the yearly option.

## 4. Angular Service (Same as before)

The Angular service remains the same as in my previous response.

## 5. Step-by-step flow:

1. **User Clicks "Join" Button:**
   - The join button triggers the creation of a Checkout session
   - The backend creates a session with all four price options (Basic Monthly, Basic Yearly, Premium Monthly, Premium Yearly)

2. **User Selects Plan in Checkout:**
   - User is presented with four options in the Checkout page
   - They select one plan and billing interval (e.g., Premium Monthly)
   - They complete payment with their chosen plan

3. **Webhook Processing & Registration:**
   - Same as before - webhook creates a pending user linked to the Stripe customer and subscription
   - User receives email to complete registration
   - User completes profile with username and password

This implementation gives users full flexibility to choose both their plan level (Basic vs Premium) and billing interval (Monthly vs Yearly) directly in the Stripe Checkout interface.

Would you like me to provide any additional details about implementing this approach, such as how to use Stripe's subscription upsells feature to encourage yearly subscriptions?