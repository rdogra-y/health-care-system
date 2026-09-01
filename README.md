# Health Care System

A full-stack healthcare operations platform built to manage patient records, provider workloads, appointment workflows, and operational analytics through a secure role-based application.

The project focuses on healthcare operations and business intelligence rather than diagnosis or treatment recommendations.

## Core Features

### Patient Management
- Register and search patients
- Server-side and client-side validation
- Required contact and address information
- Email and international phone validation
- Date-of-birth validation
- Protected patient APIs

### Appointment Management
- Schedule appointments between patients and providers
- Explicit date and time confirmation before scheduling
- Prevent scheduling appointments in the past
- Appointment lifecycle workflow:

```text
Scheduled
   |
Checked In
   |
Waiting
   |
In Progress
   |
Completed
```

- Appointment timestamps are recorded as patients move through the workflow
- Server-side validation prevents invalid scheduling requests

### Provider Workspace
- Provider directory
- Specialty information
- Provider workload monitoring
- Active, upcoming, and completed appointment tracking
- Capacity visibility

### Operational Analytics
- Total appointment activity
- Completion rate
- Cancellation rate
- Active patient queue
- Average wait time
- Seven-day appointment activity
- Provider performance
- Busiest provider analysis
- Busiest appointment hours
- Operational management insights

### Authentication and Authorization

The application uses JWT authentication and role-based access control.

Supported roles:

- ADMIN
- DOCTOR
- RECEPTIONIST

Protected API routes verify both authentication and role permissions before allowing access.

Example authorization model:

| Action | Admin | Doctor | Receptionist |
|---|---|---|---|
| View patients | Yes | Yes | Yes |
| Add patients | Yes | No | Yes |
| View appointments | Yes | Yes | Yes |
| Schedule appointments | Yes | No | Yes |
| Update appointment workflow | Yes | Yes | Yes |
| View providers | Yes | Yes | Yes |
| Administrative dashboard | Yes | No | No |

Passwords are stored as bcrypt hashes rather than plain text.

Access tokens expire automatically.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS
- Fetch API

### Backend

- Node.js
- Express
- TypeScript
- JWT authentication
- bcrypt
- Zod validation

### Database

- PostgreSQL
- Prisma ORM

### Development

- Git
- GitHub
- npm
- VS Code

## Architecture

```text
React + TypeScript
        |
        |
Authenticated API Client
        |
        |
Node.js + Express + TypeScript
        |
        |-- JWT Authentication
        |-- Role-Based Authorization
        |-- Request Validation
        |-- Business Logic
        |
        |
Prisma ORM
        |
        |
PostgreSQL
```

The frontend and backend are intentionally separated into independent applications.

```text
health-care-system/
|
|-- client/
|   |-- src/
|       |-- components/
|       |-- context/
|       |-- pages/
|       |-- utils/
|
|-- server/
|   |-- src/
|       |-- middleware/
|       |-- prisma/
|       |-- routes/
|       |-- utils/
|       |-- validation/
|
|-- README.md
```

## API Design

The Express backend exposes REST APIs for the application's primary resources.

```text
/api/auth
/api/patients
/api/providers
/api/appointments
/api/dashboard
```

Protected requests include a bearer access token.

```text
Authorization: Bearer <access-token>
```

Authorization is enforced by the backend rather than relying on frontend visibility.

## Appointment Workflow

Appointments are treated as operational workflows rather than simple database records.

```text
SCHEDULED
    |
CHECKED_IN
    |
WAITING
    |
IN_PROGRESS
    |
COMPLETED
```

Workflow changes are persisted through the API.

Important operational timestamps include:

- Check-in time
- Visit start time
- Completion time

These timestamps can then be used to calculate metrics such as patient wait time and provider workload.

## Validation

Patient registration is validated on both the client and server.

Validation includes:

- Required first and last name
- Valid email address
- Valid phone number
- Required date of birth
- Future dates rejected for date of birth
- Required address
- Length and format constraints

Appointment scheduling validates:

- Patient
- Provider
- Appointment date
- Appointment time
- Future scheduling
- Existing patient and provider records

Backend validation remains authoritative even if a client-side check is bypassed.

## Security

The project implements several application security controls:

- Password hashing with bcrypt
- JWT-based authentication
- Token expiration
- Role-based authorization
- Protected API endpoints
- Environment variables for secrets
- Server-side input validation
- Database access through an ORM
- `.env` files excluded from Git

For a production system, I would extend the authentication architecture with secure HttpOnly SameSite cookies, refresh-token rotation, stricter rate limiting, security headers, audit logging, and production-specific CORS policies.

## Running Locally

### Requirements

Install:

- Node.js
- npm
- PostgreSQL

Clone the repository:

```bash
git clone https://github.com/rdogra-y/health-care-system.git
cd health-care-system
```

### Backend

```bash
cd server
npm install
```

Create the required environment configuration.

```text
DATABASE_URL=<your-postgresql-connection>
JWT_SECRET=<your-secret>
PORT=4000
```

Start the backend:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite.

## Design Decisions

### Separate Client and API

The React frontend and Express API are separated rather than tightly coupling UI and database logic.

This makes authentication, authorization, validation, testing, and future client applications easier to manage independently.

### Backend Authorization

UI restrictions alone are not considered security controls.

Authorization therefore occurs inside the Express API so protected operations remain inaccessible even if a request is manually sent outside the React application.

### Operational Appointment States

Instead of storing appointments only as scheduled or completed, the system models intermediate operational states.

This allows the application to represent what is actually happening during the day and enables meaningful metrics such as queue size and waiting time.

### Client and Server Validation

Client validation provides immediate feedback, while server validation protects data integrity.

The server remains the authoritative validation layer.

## What I Would Change at Larger Scale

The current analytics are intentionally optimized for a portfolio-scale dataset and rapid product iteration.

With substantially larger datasets, I would move more analytics computation into optimized database queries and aggregation services rather than deriving metrics from broad application-level datasets.

I would also introduce:

- Database indexes based on production query patterns
- Pagination
- Background processing for expensive analytics
- Structured audit logging
- Centralized monitoring and observability
- Automated integration and end-to-end testing
- CI/CD pipelines
- Containerized production environments
- Real-time operational updates where required

## Project Goal

The goal was not simply to create CRUD screens.

The project was designed as an operational system where authentication, authorization, patient flow, provider capacity, validation, analytics, and data persistence work together as one full-stack application.

## Author

Rakshita Dogra