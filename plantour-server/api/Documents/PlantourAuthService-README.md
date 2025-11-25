# PlantourAuthService — design and usage

Summary
-------
`PlantourAuthService` manages participant creation, access codes and issues Plantour-signed JWT tokens for participants. Participant tokens may include an embedded admin Supabase JWT (claim `admin_token`) so participant requests can be validated against Supabase auth requirements.

Configuration
-------------
- `SUPABASE_JWT_SECRET` — Supabase JWT secret (already used).
- `PLANTOUR_JWT_SECRET` — secret used to sign participant tokens (add to appsettings or environment variables).
- Optional: `PLANTOUR_TOKEN_EXP_DAYS` — token lifetime in days (defaults to 7).

Key endpoints
-------------
- POST `/api/auth/participant/register`
  - Body: `{ "adminTravelerId": "...", "tripId": "...", "email": "...", "firstName": "...", "lastName": "...", "phone": "..." }`
  - Returns: `{ "access_code": "..." }`
  - Creates `Traveler` and `TripTraveler` with generated access code.

- POST `/api/auth/participant/login`
  - Body: `{ "accessCode": "..." }`
  - If the request includes an Authorization Bearer header with an admin Supabase token, it will be embedded into the returned participant token.
  - Returns: `{ "token": "..." }` — this is the Plantour participant token.

- POST `/api/auth/participant/reset`
  - Body: `{ "tripTravelerId": "..." }`
  - Returns new access code.

- GET `/api/auth/participant/me`
  - Returns resolved CurrentUser details (admin supabase user if available, traveler and trip_traveler when participant).

How it works
------------
1. Admin creates participant via `register` (client should be authenticated as admin and pass trip/admin ids).
2. Participant receives access code via out-of-band channel.
3. Participant logs in by sending access code to `login`. If admin was logged in on the client that created the participant, the client may forward admin's Supabase token to allow embedding. When the server returns a participant token that includes `admin_token`, the middleware will:
   - Validate the Plantour token using `PLANTOUR_JWT_SECRET`.
   - Extract `admin_token` and replace the incoming token with it so the normal Supabase token validation occurs.
   - Middleware also sets HttpContext.Items["Plantour.TripTravelerId"] so services can resolve the TripTraveler record.

Security considerations
-----------------------
- Embedding an admin Supabase token into participant token grants supabase-level privileges tied to that admin. Only embed admin tokens when admin explicitly provides them.
- Treat `admin_token` as sensitive; do not log it.
- If you prefer not to embed full admin tokens, implement a server-side delegation mechanism issuing limited admin tokens.

Next steps
----------
- Add controller endpoints that allow admins to create participants while authenticated (this sample register endpoint is generic).
- Add unit tests for PlantourAuthService.
- Optionally implement storage of a server-issued delegated admin token to avoid embedding full admin tokens in participant tokens.
