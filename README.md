# Nest TOTP Service

A minimal NestJS microservice that provides Time-based One-Time Password (TOTP) generation and verification functionality. This service helps you implement secure OTP-based authentication flows, useful for enhancing user security through two-factor authentication (2FA) or standalone OTP validation.

## Features

- Generate unique TOTP secrets for users based on their email
- Generate OTP tokens using the TOTP secret
- Verify OTP tokens against the stored secret
- Encrypt TOTP secrets with a configurable encryption key
- Simple REST API endpoints to integrate with any application
- Uses PostgreSQL (via Prisma) to persist user and secret data
- Built with NestJS and TypeScript for scalability and maintainability
