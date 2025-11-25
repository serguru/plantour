# CONTRIBUTING.md

## Guidelines

This project follows strict conventions for code style, authentication flows, and contribution processes. When adding features related to authentication (PlantourAuthService) or user management, follow these rules:

- Implement new services under `Services` namespace and register them in dependency injection via `Program.cs` or equivalent startup file.
- Service class names should be PascalCase and interface names prefixed with `I`.
- Add XML documentation to public methods and properties.
- Keep methods small and single-responsibility.
- Use `Utils.AccessCodeGenerator` for generating participant access codes when available.
- Tokens issued by Plantour must embed the admin's supabase token when issuing participant tokens so the participant can act on behalf of the admin.
- Add unit tests for new services where possible and mock external dependencies (database context, token providers).

## Authentication

- Admins authenticate via Supabase auth (email/password). Their record exists in `travelers` table with `user_id` referencing `auth.users`.
- Participants authenticate using `access_code`. Each participant has a `traveler` record with `user_id = null`.
- PlantourAuthService must expose a `CurrentUser` property that contains both the supabase user (admin) and the associated Plantour traveler record.
- Update request handling to accept both admin Bearer tokens and participant tokens containing an embedded admin token.

## Formatting & EditorConfig

- Follow `.editorconfig` for indentation, naming, and formatting. If `.editorconfig` is missing, create it before large changes.

## Pull Requests

- Ensure the branch builds and all tests pass.
- Describe the changes clearly and link any related issues.
- Ensure code is reviewed by another contributor before merging.