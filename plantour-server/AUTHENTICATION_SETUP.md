# Authentication System Setup and Usage Guide

## Overview
This authentication system provides JWT-based authentication with refresh token support for the Plantour application. It uses PostgreSQL for data storage and implements secure password hashing with HMACSHA512.

## Setup Instructions

### 1. Database Setup
Run the SQL script to create the refresh tokens table:
psql -h localhost -p 5432 -U postgres -d postgres -f DB/Scripts/create_auth_tables.sql

### 3. Configuration
Update `appsettings.json` with:
- **ConnectionStrings:DefaultConnection**: Your PostgreSQL connection string
- **JwtSettings:SecretKey**: Generate a strong secret key (at least 32 characters)
- **JwtSettings:Issuer**: Your API identifier
- **JwtSettings:Audience**: Your client identifier
- **JwtSettings:AccessTokenExpirationMinutes**: Access token lifetime (default: 60 minutes)
- **JwtSettings:RefreshTokenExpirationDays**: Refresh token lifetime (default: 7 days)

### 4. Run EF Core Migrations (if needed)

