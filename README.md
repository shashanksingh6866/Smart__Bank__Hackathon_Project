# SmartBank

A secure, scalable banking backend system with a React frontend.

## Tech Stack
- **Frontend**: React + Tailwind CSS (Create React App)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **DevOps**: Docker + GitHub Actions

## Prerequisites
- Docker & Docker Compose
- Node.js (for local dev without Docker)

## Setup & Run

### Using Docker (Recommended)
1. **Build and Run**:
   ```bash
   docker-compose up --build
   ```
2. **Access**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Manual Setup

#### Backend
1. `cd backend`
2. `npm install`
3. Set up `.env` (see `docker-compose.yml` for vars)
4. `npm run dev`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

## API Documentation
- `POST /auth/register`: Register new user (needs `email`, `password`, `kyc...`).
- `POST /auth/login`: Login (returns JWT).
- `POST /accounts`: Create account (needs token).
- `POST /transactions/transfer`: Transfer funds (ACID compliant).
- `GET /dashboard`: View summary.

## Testing
- Backend: `cd backend && npm test`
- CI/CD: Handled by GitHub Actions on push.
