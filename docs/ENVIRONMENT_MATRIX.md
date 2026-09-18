# ENVIRONMENT MATRIX

This document outlines the strict isolation parameters between Development, Staging, and Production environments for the **GET YOUR JOB** web application.

> [!WARNING]
> Staging must **never** connect to production Firebase resources, payment keys, or secrets. Any crossover will lead to test data polluting the production environment or real money being charged from sandbox environments.

## Matrix

| Component        | Development  | Staging      | Production |
| ---------------- | ------------ | ------------ | ---------- |
| **Firebase Project** | DEV (`get-your-job-dev`) | STAGING (`get-your-job-staging`) | PROD (`get-your-job-prod`) |
| **Authentication** | DEV          | STAGING      | PROD       |
| **Firestore**      | DEV          | STAGING      | PROD       |
| **Storage**        | DEV          | STAGING      | PROD       |
| **Functions**      | DEV (Emulators) | STAGING      | PROD       |
| **Hosting**        | Localhost    | STAGING      | PROD       |
| **FCM**            | DEV          | STAGING      | PROD       |
| **Maps**           | DEV          | STAGING      | PROD       |
| **Payments**       | SANDBOX/TEST | SANDBOX/TEST | LIVE       |
| **Webhooks**       | Localtunnel  | STAGING      | PROD       |
| **Secrets**        | `.env.local` | `.env.staging` | Secret Manager / `.env.production` |

## Branch Mapping
- `main` -> **Production** Environment
- `staging` / `release/*` -> **Staging** Environment
- `dev` / `feature/*` -> **Development** Environment
