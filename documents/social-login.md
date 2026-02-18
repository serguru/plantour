Completed: *Write social-login.md setup guide* (5/6)

**Implemented**
- Added backend social auth endpoint `POST /api/users/admin/social/signin` with provider token verification and account linking in plantour-server/Controllers/UsersController.cs, plantour-server/Services/UsersService.cs, plantour-server/DTOs/SocialSignInRequest.cs, and plantour-server/Services/Interfaces/IAuthService.cs.
- Google flow uses `Google.Apis.Auth` (added in plantour-server/plantour-server.csproj); Facebook flow validates tokens via Graph `debug_token` + `/me`.
- Added social identity persistence (`google_sub`, `facebook_user_id`) in schema/model/repo: plantour-server/DB/Scripts/1 plantour-tables.sql, plantour-server/DbModels/User.cs, plantour-server/Repositories/UsersRepository.cs.
- Added password-switch support for social users (set password without current password if none exists) in plantour-server/DTOs/UpdatePasswordRequest.cs, plantour-server/Services/UsersService.cs, plantour-server/DTOs/UserDto.cs, and profile UI updates in plantour-client/src/app/components/features/profile/profile-component/profile-component.ts.

**Frontend**
- Added Google/Facebook login/register actions on existing pages (no new SCSS classes): plantour-client/src/app/components/sign-in/sign-in.ts, plantour-client/src/app/components/sign-in/sign-in.html, plantour-client/src/app/components/sign-up/sign-up.ts, plantour-client/src/app/components/sign-up/sign-up.html.
- Added SDK loader/service and API call wiring: plantour-client/src/app/services/social-auth-service.ts, plantour-client/src/app/services/users-service.ts, plantour-client/src/environment.token.ts, plantour-client/src/environments/environment.ts, plantour-client/src/environments/environment.qa.ts, plantour-client/src/environments/environment.prod.ts.

**Docs + Validation**
- Added full setup/architecture guide at documents/social-login.md, including official Google/Facebook docs, config steps, DB alter SQL, and test scenarios.
- Validation passed: server `dotnet build` succeeded; client `npm run build:qa` succeeded.


# Plantour Social Login (Google + Facebook)

This document describes:
1. How the added social-login code works in Plantour (backend + frontend + account-linking behavior).
2. Exactly what you need to configure in Google and Meta/Facebook to make it work.

---

## 1) What was added

## Backend (`plantour-server`)

### New API endpoint
- `POST /api/users/admin/social/signin`
- Request DTO: `SocialSignInRequest`
  - `provider`: `google` or `facebook`
  - `googleIdToken` (for Google flow)
  - `facebookAccessToken` (for Facebook flow)

### Token verification strategy
- **Google**:
  - Uses `Google.Apis.Auth` package (`GoogleJsonWebSignature.ValidateAsync`)
  - Validates ID token signature/issuer/expiry and audience against configured `GoogleClientId`
- **Facebook**:
  - Calls Graph API `debug_token` endpoint server-to-server using app access token (`app_id|app_secret`)
  - Verifies token is valid and belongs to configured app (`app_id` match)
  - Loads profile from `/me?fields=id,email,first_name,last_name`

### User/account linking behavior
When social sign-in request arrives:
1. Try to find user by provider identifier:
   - Google: `users.google_sub`
   - Facebook: `users.facebook_user_id`
2. If not found, try to find user by email.
   - If found, link provider ID to that existing user.
   - If user is `Pending`, user is moved to `Active` (social provider already authenticated user).
3. If still not found, create new user:
   - `email`, `first_name`, `last_name`
   - no password hash/salt initially
   - `access_type = Active`, `plan = NoPlan`
   - provider ID saved in the corresponding social column.
4. Generate regular Plantour JWT + refresh token using existing auth pipeline.

### Password switching support (important)
Social-created users initially have no local password.

Changes added:
- `UpdatePasswordRequest.CurrentPassword` is now optional.
- In `UpdatePasswordAsync`:
  - if user already has a password -> current password is required and validated.
  - if user has no password (social-only account) -> user can set a new password directly.

Result: user can register/sign in with Google/Facebook, then later set a local password and use email/password sign-in.

### DB model/schema updates
`users` table now includes:
- `google_sub text unique`
- `facebook_user_id text unique`

Updated files include:
- `DB/Scripts/1 plantour-tables.sql`
- `DbModels/User.cs`
- `Repositories/UsersRepository.cs`

> Existing DBs must be altered manually (see SQL in the setup section below).

### New backend settings
Added `SocialAuthSettings` to appsettings:
```json
"SocialAuthSettings": {
  "GoogleClientId": "",
  "FacebookAppId": "",
  "FacebookAppSecret": ""
}
```

Files updated:
- `appsettings.json`
- `appsettings.Development.json`
- `appsettings.QA.json`
- `appsettings.Production.json`

---

## Frontend (`plantour-client`)

### Sign-in and Sign-up pages
Added social actions on both:
- Google button (Google Identity Services SDK)
- Facebook button (Facebook JS SDK)

Files:
- `src/app/components/sign-in/sign-in.ts`
- `src/app/components/sign-in/sign-in.html`
- `src/app/components/sign-up/sign-up.ts`
- `src/app/components/sign-up/sign-up.html`
- `src/app/services/social-auth-service.ts`

### Frontend environment config
Added public IDs:
- `googleClientId`
- `facebookAppId`

Files:
- `src/environment.token.ts`
- `src/environments/environment.ts`
- `src/environments/environment.qa.ts`
- `src/environments/environment.prod.ts`

### Users service API call
Added method:
- `socialSignIn(provider, token)` -> calls `/api/users/admin/social/signin`

File:
- `src/app/services/users-service.ts`

### Profile page password UX
Profile now supports social users who do not have a local password yet:
- Backend returns `hasPassword` in profile DTO.
- UI shows **Set Password** (without current-password requirement) if `hasPassword=false`.
- For regular users, **Change Password** flow remains unchanged.

### Profile social connect/reset UX
Profile now also supports linking/unlinking social providers for the currently signed-in user:
- `POST /api/users/profile/social/link` with `SocialSignInRequest`
- `DELETE /api/users/profile/social/{provider}` where provider is `google` or `facebook`

Behavior:
- **Connect Google/Facebook** validates provider token server-side and links provider ID to current user.
- **Reset Google/Facebook** removes linked provider from current user.
- Backend blocks unlink if this would leave user with no login method (no password and no other linked provider).

Profile DTO now includes:
- `hasGoogleLinked`
- `hasFacebookLinked`

Files:
- `src/app/components/features/profile/profile-component/profile-component.ts`
- `src/app/components/features/profile/profile-component/profile-component.html`
- `src/app/services/users-service.ts` (`UserDto.hasPassword`)
- `plantour-server/DTOs/UserDto.cs`

---

## 2) What you must configure to make it work

## A. Database migration for existing DB

If your DB already exists, run this SQL once:

```sql
ALTER TABLE plantour.users
  ADD COLUMN IF NOT EXISTS google_sub text,
  ADD COLUMN IF NOT EXISTS facebook_user_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'plantour'
      AND indexname = 'users_google_sub_key'
  ) THEN
    CREATE UNIQUE INDEX users_google_sub_key
      ON plantour.users (google_sub)
      WHERE google_sub IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'plantour'
      AND indexname = 'users_facebook_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX users_facebook_user_id_key
      ON plantour.users (facebook_user_id)
      WHERE facebook_user_id IS NOT NULL;
  END IF;
END $$;
```

---

## B. Google setup (official flow)

Official docs used:
- https://developers.google.com/identity/gsi/web/guides/overview
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

### Steps
1. Open Google Cloud Console:
   - https://console.cloud.google.com/
2. Create/select your project.
3. Configure OAuth consent screen.
4. Create OAuth Client ID of type **Web application**.

256558134062-f78noulvdiq52n7bfmmh0cm23j91942s.apps.googleusercontent.com

5. Add your JavaScript origins (examples):
   - `http://localhost:4203`
   - `https://qa.plantour.app`
   - `https://plantour.app`
6. Copy the client ID.
7. Set values:
   - Frontend: `googleClientId` in environment files.
   - Backend: `SocialAuthSettings.GoogleClientId`.

### Notes
- Backend must validate ID token `aud` against your web client ID.
- Keep using HTTPS in QA/Prod.
- FedCM is enabled for Google button integration in code.

---

## C. Facebook/Meta setup (official flow)

Official docs used:
- https://developers.facebook.com/docs/facebook-login/
- https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

### Steps
1. Open Meta for Developers:
   - https://developers.facebook.com/apps/
2. Create/select app.
3. Add **Facebook Login** product.
4. In app settings, configure your app domains and site URL.
5. In Facebook Login settings, add valid OAuth redirect URIs/domains as required for your environment.
6. Ensure your login flow requests at least:
   - `public_profile`
   - `email`
7. Copy:
   - App ID - 2076632839798115
   - App Secret - d84b7e45c0ada5db351d9d9fc8d758da
8. Set values:
   - Frontend: `facebookAppId`
   - Backend: `SocialAuthSettings.FacebookAppId`, `SocialAuthSettings.FacebookAppSecret`

### Notes
- App secret must stay **server-side only**.
- Backend verifies access token through Graph `debug_token` and checks `app_id`.
- If Facebook account has no email or user declines email permission, sign-in is rejected by backend.

---

## D. Plantour config checklist

## Backend
Set these values in each environment (`Development`, `QA`, `Production`):
```json
"SocialAuthSettings": {
  "GoogleClientId": "<google web client id>",
  "FacebookAppId": "<facebook app id>",
  "FacebookAppSecret": "<facebook app secret>"
}
```

## Frontend
Set environment values:
```ts
googleClientId: '<google web client id>'
facebookAppId: '<facebook app id>'
```

---

## E. Test scenarios

1. New user signs up with Google -> user is created -> receives Plantour JWT.
2. New user signs up with Facebook -> user is created -> receives Plantour JWT.
3. Existing email/password user signs in with Google/Facebook using same email -> account is linked.
4. Social-created user opens Profile and sets password -> can later sign in via email/password.
5. Suspended/banned/archived user social sign-in is blocked by existing access checks.
6. Linked user resets Google/Facebook in Profile -> provider is disconnected if at least one other login method remains.
7. User reconnects provider in Profile -> provider link is restored and sign-in via provider works again.

---

## F. Security notes

- Google ID token verification is server-side and audience-constrained.
- Facebook access token is validated server-to-server against app credentials.
- Facebook app secret is not exposed to client.
- Plantour still uses its own JWT/refresh-token session model after social auth.

---

## G. Optional future improvements

- Add one-time email confirmation fallback when provider email is unavailable.
- Add dedicated migration script file under `DB/Scripts` for production rollout tracking.
