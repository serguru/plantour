# Cloudflare Setup Instructions For Plantour

This file explains exactly what to do to make the Cloudflare-related protection in Plantour work.

It covers two different setups:

1. Turnstile only
2. Full Cloudflare protection with a custom domain

## Important First Note

The code already added to Plantour supports Cloudflare Turnstile.

That current code path will work only after you add Cloudflare Turnstile keys.

The following Plantour files already expect that configuration:

- `plantour-server/appsettings.Development.json`
- `plantour-server/appsettings.QA.json`
- `plantour-server/appsettings.Production.json`
- `plantour-client/src/environments/environment.ts`
- `plantour-client/src/environments/environment.qa.ts`
- `plantour-client/src/environments/environment.prod.ts`

## Part 1. Minimum Setup: Turnstile Only

Use this if you want the current code to start protecting public forms and sign-in flows.

### Step 1. Create a Cloudflare account

1. Go to `https://dash.cloudflare.com/sign-up`
2. Create your Cloudflare account
3. Log in to the Cloudflare dashboard

### Step 2. Open Turnstile

1. In Cloudflare, open the main dashboard
2. Go to `Turnstile`
3. Click `Add widget`

### Step 3. Create a widget for production

1. Enter a widget name such as `Plantour Production`
2. Add your production domain such as `plantour.app`
3. Choose widget mode

Recommended for the current code:

- use an invisible or non-interactive style if available in the dashboard

4. Save the widget

### Step 4. Copy the 2 keys

After saving, Cloudflare will give you:

1. `Site Key`
2. `Secret Key`

Keep them both.

### Step 5. Put the Site Key into the client configuration

Open:

- `plantour-client/src/environments/environment.prod.ts`

Set:

```ts
export const environment = {
  environment: 'production',
  apiUrl: 'https://YOUR_API_DOMAIN',
  clientUrl: 'https://YOUR_CLIENT_DOMAIN',
  googleClientId: '...',
  facebookAppId: '...',
  turnstileSiteKey: 'PASTE_CLOUDFLARE_SITE_KEY_HERE',
  version: '0.0.0'
};
```

### Step 6. Put the Secret Key into the server configuration

Preferred way: Render environment variables.

For the `plantour-server` Render service, add:

```txt
Turnstile__Enabled=true
Turnstile__SecretKey=PASTE_CLOUDFLARE_SECRET_KEY_HERE
```

Explanation:

- `Turnstile__Enabled=true` turns verification on
- `Turnstile__SecretKey=...` gives the backend the private verification secret

### Step 7. Keep secrets out of source control

Do not commit the real secret key into repo files.

Use Render environment variables for the server secret.

The frontend site key is public and can safely be placed in the Angular environment file.

### Step 8. Redeploy both services

1. Redeploy the client
2. Redeploy the server

### Step 9. Test the protected flows

After deploy, manually test:

1. Admin sign-in email request
2. Participant sign-in
3. Google sign-in
4. Facebook sign-in
5. Guest mode temporary user creation
6. Contact form submit

### Step 10. Verify the behavior

Expected result:

1. Normal users should still be able to submit those flows
2. Automated traffic should be harder to execute repeatedly
3. Invalid or missing Turnstile verification should block protected requests

## Part 2. QA Setup With Turnstile Only

Use this if your QA site remains public on Render and you only want to enable the current code protections.

### Step 1. Create a separate QA widget in Cloudflare

1. Go to `Turnstile`
2. Click `Add widget`
3. Enter a name such as `Plantour QA`
4. Add the QA hostname if Cloudflare allows it for your plan and domain setup

Important:

- your current QA URL is `https://plantour-client-qa.onrender.com/`
- full Cloudflare proxy protection does not sit in front of that Render hostname unless you move QA to a custom domain
- Turnstile itself can still be used as a widget-based verification mechanism if the hostname is allowed for the widget

### Step 2. Put the QA site key into Angular QA config

Open:

- `plantour-client/src/environments/environment.qa.ts`

Set:

```ts
turnstileSiteKey: 'PASTE_QA_SITE_KEY_HERE'
```

### Step 3. Put the QA secret into the QA server config

In the QA Render service for the server, add:

```txt
Turnstile__Enabled=true
Turnstile__SecretKey=PASTE_QA_SECRET_KEY_HERE
```

### Step 4. Redeploy QA client and QA server

1. Redeploy QA client
2. Redeploy QA server

### Step 5. Test the same protected flows in QA

1. Admin sign-in email request
2. Participant sign-in
3. Guest mode
4. Contact form

## Part 3. Full Cloudflare Protection For Production

Use this if you want Cloudflare not only for Turnstile, but also for WAF, bot rules, and rate limits.

### Step 1. Add your production domain to Cloudflare

1. In Cloudflare, click `Add a site`
2. Enter your production domain such as `plantour.app`
3. Follow Cloudflare DNS onboarding steps
4. Update your registrar nameservers to the Cloudflare nameservers if required

### Step 2. Point Cloudflare DNS to Render

1. Open your Cloudflare zone for `plantour.app`
2. Open `DNS`
3. Add the records required for your app
4. Point the frontend hostname to Render
5. Point the API hostname to Render if needed

### Step 3. Add the same custom domains in Render

1. Open the Render dashboard
2. Open the Plantour client service
3. Add the custom domain such as `plantour.app`
4. Open the Plantour server service
5. Add the custom API domain if you use one

### Step 4. Wait for certificate and DNS validation

1. Wait until Render confirms the custom domain
2. Wait until Cloudflare DNS is active

### Step 5. Turn on Cloudflare proxy for production hostnames

In Cloudflare DNS, change the records from `DNS only` to `Proxied` where appropriate.

That makes traffic flow through Cloudflare first.

### Step 6. Enable WAF and bot protection

In Cloudflare for the production zone:

1. Open `Security`
2. Open `WAF`
3. Enable managed protections appropriate for your plan
4. Open bot settings
5. Enable `Bot Fight Mode` or `Super Bot Fight Mode` if available

### Step 7. Add rate limiting rules for sensitive endpoints

Create Cloudflare rate-limit rules for these paths:

1. `/api/users/admin/send-signin-email`
2. `/api/users/admin/signin-token`
3. `/api/users/admin/social/signin`
4. `/api/users/participant/signin`
5. `/api/users/create-temporary-user`
6. `/api/users/contact/submit`
7. `/api/users/refresh-token`

Recommended action:

1. Start with `Managed Challenge` or `Block` depending on your confidence
2. Use low thresholds for public anonymous mutation routes

### Step 8. Do not challenge public SEO pages

Do not apply aggressive bot rules to:

1. homepage
2. public crawlable pages
3. `robots.txt`
4. `sitemap.xml`
5. render-critical CSS and JS

## Part 4. Full Cloudflare Protection For QA

This is the best solution if you want to stop unauthorized testing of QA.

### Step 1. Create a QA custom domain

Use a hostname you own, for example:

- `qa.plantour.app`

### Step 2. Add the QA custom domain in Render

1. Open the Render client QA service
2. Add `qa.plantour.app`

If your QA API is separate, also add a QA API hostname.

### Step 3. Add the QA hostname in Cloudflare DNS

1. Open your Cloudflare zone
2. Add a DNS record for `qa.plantour.app`
3. Point it to the Render target
4. Enable `Proxied`

### Step 4. Create a Cloudflare Access application for QA

1. Go to Cloudflare One
2. Open `Access`
3. Open `Applications`
4. Click `Add an application`
5. Choose `Self-hosted`
6. Add the public hostname `qa.plantour.app`

### Step 5. Add an allow policy

Cloudflare Access is deny-by-default.

Create an allow rule for:

1. your email address
2. your team email domain
3. any other explicitly approved testers

### Step 6. Choose authentication method

Choose one of:

1. One-time pin
2. Google login
3. Microsoft login
4. other supported identity provider

### Step 7. Save and test

Expected result:

1. public visitors should not get direct access to QA
2. only approved users can open QA
3. unauthorized bot or testing traffic should be blocked before reaching Render

## Part 5. Local Environment

### Step 1. Keep local Turnstile disabled unless you really want to test it

Open:

- `plantour-server/appsettings.Development.json`
- `plantour-client/src/environments/environment.ts`

Keep these values:

```json
"Turnstile": {
  "Enabled": false,
  "SecretKey": ""
}
```

and

```ts
turnstileSiteKey: ''
```

### Step 2. Optional local Turnstile testing

If you want to test Turnstile locally, you can:

1. use a local hostname allowed by the widget
2. put the dev site key into `environment.ts`
3. put the dev secret into local server config or local environment variables

If you do not need local Turnstile testing, leave it disabled.

## Part 6. Exact Render Variables To Add

For production server:

```txt
Turnstile__Enabled=true
Turnstile__SecretKey=PASTE_PRODUCTION_SECRET_HERE
```

For QA server:

```txt
Turnstile__Enabled=true
Turnstile__SecretKey=PASTE_QA_SECRET_HERE
```

If you want the feature disabled, use:

```txt
Turnstile__Enabled=false
```

## Part 7. Exact Files To Edit

Production frontend:

- `plantour-client/src/environments/environment.prod.ts`

QA frontend:

- `plantour-client/src/environments/environment.qa.ts`

Development frontend:

- `plantour-client/src/environments/environment.ts`

Server config shape:

- `plantour-server/appsettings.Production.json`
- `plantour-server/appsettings.QA.json`
- `plantour-server/appsettings.Development.json`

## Part 8. What To Expect After Setup

Once Turnstile is fully enabled, the following Plantour actions will require successful verification:

1. Admin sign-in email request
2. Participant sign-in
3. Social sign-in
4. Temporary guest user creation
5. Contact form submit

Also, server-side rate limiting remains active as defense in depth.

## Part 9. Fastest Useful Path

If you want the smallest number of steps now, do this:

1. Create a Cloudflare Turnstile widget for production
2. Copy the site key into `plantour-client/src/environments/environment.prod.ts`
3. Copy the secret key into Render server env vars
4. Redeploy client and server
5. Test guest mode, sign-in, and contact form

If your goal is to stop unauthorized QA testing completely, then do this instead:

1. Move QA to `qa.plantour.app`
2. Put that hostname behind Cloudflare
3. Protect it with Cloudflare Access
