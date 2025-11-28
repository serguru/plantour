# Admin and Participant Authentication System - Implementation Guide

## Overview

The Plantour authentication system supports two distinct user roles:
1. **Admin** - Full users with password authentication who own trips
2. **Participant** - Users who access the system via access codes and can only view/participate in their admin's trips

## Key Concepts

### User Model
- A single `User` record can act as both Admin and Participant
- `password_hash` can be `NULL` or have a value:
  - **Has value**: User can login as Admin (email/password) OR as Participant (access code + optional password)
  - **NULL**: User can only login as Participant (access code only, no password required)

### Access Levels
- **Admin Login**: Full access to all their trips and data
- **Participant Login**: Limited access only to trips they're participating in under their admin

### Token Structure
- **Admin Token** contains:
  - User ID
  - Email
  - Role: "Admin"
  - First Name, Last Name (optional)
  
- **Participant Token** contains:
  - Participant User ID
  - Participant Email
  - Role: "Participant"
  - Access Code
  - **Admin Data** (embedded):
    - Admin ID
    - Admin Email
    - Admin First Name, Last Name (optional)

## Database Schema

### admins_participants table


•	id (uuid, PK)
•	admin_id (uuid, FK → users.id)
•	participant_id (uuid, FK → users.id)
•	access_code (varchar(8), unique) 



## API Endpoints

### Admin Authentication

#### 1. Admin Sign Up
**POST** `/api/auth/admin/signup`

Request:
````````


# Response
````````markdown



{ "email": "admin@example.com", "password": "SecurePass123", "firstName": "John", "lastName": "Doe", "phone": "+1234567890" }



````````

#### 2. Admin Sign In
**POST** `/api/auth/admin/signin`

Request:
````````markdown
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
````````

# Response
````````markdown
{
  "userID": "uuid-of-the-admin",
  "token": "jwt-access-token",
  "expiresIn": 3600,
  "refreshToken": "jwt-refresh-token"
}
````````

### Participant Authentication

#### 3. Participant Sign Up
**POST** `/api/auth/participant/signup` (Requires Admin Authorization)

Request:
````````


# Response
````````markdown
{ "participantID": "uuid-of-the-participant", "accessCode": "ABC12345" }
````````

#### 4. Participant Sign In
**POST** `/api/auth/participant/signin`

Request:
````````markdown
{
  "accessCode": "ABC12345",
  "password": "OptionalParticipantPassword"
}
````````

# Response
````````markdown
{
  "participantID": "uuid-of-the-participant",
  "token": "jwt-access-token-for-participant",
  "expiresIn": 3600,
  "refreshToken": "jwt-refresh-token-for-participant",
  "adminData": {
    "adminID": "uuid-of-the-admin",
    "adminEmail": "admin@example.com",
    "adminFirstName": "John",
    "adminLastName": "Doe"
  }
}



{ "email": "admin@example.com", "password": "SecurePass123" }





````````

## Access Code Generation

Access codes are:
- 8 characters long
- Use only unambiguous characters: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Excluded similar characters: `I, O, 0, 1`
- Guaranteed unique across `admins_participants`, `trip_users`, and `invitations` tables

## Security Considerations

1. **Password Requirements**
   - Minimum 6 characters (enforced in DTOs)
   - Consider implementing stronger requirements in production

2. **Access Code Security**
   - Access codes should be transmitted securely
   - Consider implementing expiration for access codes
   - Consider rate limiting on participant signin attempts

3. **Token Storage**
   - Store tokens securely on client side
   - Use HTTPS in production
   - Implement proper token refresh logic

4. **Authorization Checks**
   - Always verify `adminId` matches the resource owner
   - For participants, verify they have access to specific trips
   - Implement row-level security checks

## Workflow Examples

### Admin Creates Participant

1. Admin signs up: `POST /api/auth/admin/signup`
2. Admin receives token and uses it
3. Admin creates participant: `POST /api/auth/participant/signup`
   - Headers: `Authorization: Bearer {admin-token}`
4. Admin shares `accessCode` with participant via external channel
5. Participant signs in: `POST /api/auth/participant/signin` with `accessCode`

### Participant with Optional Password

1. **Scenario A**: Participant without password
   - Admin creates participant without password
   - Participant uses only access code to login
   - More convenient, less secure

2. **Scenario B**: Participant with password
   - Admin creates participant with password
   - Participant must provide both access code AND password
   - More secure, two-factor approach

### Token Refresh Flow

1. Client detects token expiration (401 response)
2. Client calls: `POST /api/auth/refresh` with `refreshToken`
3. System checks if user is participant or admin
4. Returns appropriate token type
5. Client updates stored tokens

## Testing with Postman

### 1. Create Admin




