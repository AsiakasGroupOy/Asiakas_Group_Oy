# 📞 VoIP Management System

A full-stack VoIP platform for managing contacts, calling lists, customers, and WebRTC-based calling workflows.  
Frontend: React (Vite)  
Backend: Python (Flask REST API)  
Authentication: JWT-based (protected routes via `@auth_required`)  
Real-time voice communication: Twilio (WebRTC + call handling)

---

## System Overview

The system provides a multi-tenant CRM-based platform with integrated VoIP functionality for managing customers, contacts, and real-time communication workflows.

Key capabilities:

- Customer and user management (multi-tenant architecture)
- Contact management and bulk operations
- Calling list workflows and assignment logic
- Call logging and callback history tracking
- Invitation-based onboarding (customers and users)
- Real-time WebRTC calling via Twilio
- Role-based access control (admin / manager / user)

## Frontend (React + Vite)

The frontend is a single-page application built with React (Vite), communicating with the backend via REST API.

## Architecture

- Pages – route-level screens
- Components – feature-based UI modules (auth, users, calls, Twilio, invitations)
- Services – API layer (REST communication)
- State handling – authentication, call sessions, and runtime call state

## API Communication

All requests are sent via REST API.

### Required headers:

Content-Type: application/json  
Authorization: Bearer <JWT_TOKEN>

### Notes:

- Authentication is JWT-based
- All responses are JSON
- Some delete operations use POST for safety reasons

## Authentication & Authorization

- JWT token stored client-side
- Attached to all API requests
- Backend protection via @auth_required
- Role-based access control:  
  -application_admin  
  -admin  
  -manager  
  -user

## 📞 Twilio Integration (WebRTC)

The frontend uses **Twilio JavaScript SDK (WebRTC Client)** for real-time calling functionality.

### Flow:

1. Frontend requests Twilio Access Token:

   GET /twilio/token

2. Backend generates token using Twilio credentials

3. Frontend initializes Twilio Device:
   - Registers device in browser
   - Waits for incoming/outgoing calls

4. Call flow:

   All voice calls are processed through a single Twilio webhook:

   **POST /twilio/voice**

   Twilio routes both WebRTC (browser-based) and PSTN (external phone) calls to this endpoint.

   Call type identification (WebRTC vs PSTN) is handled internally by the application after the webhook is triggered.

   All calls are processed via TwiML and managed within the same Twilio Voice flow.

5. Call status updates are handled via backend webhook:

   **POST /twilio/call-status**

---

## Users

- POST `/users/register` – user registration
- POST `/users/login` – login
- POST `/users/logout` – logout
- POST `/users/refresh` – refresh JWT token
- GET `/users/current` – current user info (auth required)
- GET `/users/all` – list users (auth required)
- PUT `/users/role` – update user role (auth required)
- POST `/users/remove` – delete user (auth required)

---

## Customers (Multi-tenant layer)

- GET `/customers/all` – all customers (auth required)
- GET `/customers/options` – customer dropdown options
- GET `/customers/<customer_id>/users` – users under a customer
- PUT `/customers/<customer_id>` – update customer
- POST `/customers/remove` – delete customer

---

## Contacts

- POST `/contacts/add_one` – create single contact
- POST `/contacts/upload_contacts` – bulk upload contacts
- PUT `/contacts/edit` – edit contact

---

## Calling Lists

- GET `/callinglists/all` – get all calling lists

---

## Contact ↔ Calling List Relations

- GET `/contact_callinglist/all` – full contact-call list view
- GET `/contact_callinglist/first` – first calling list view
- GET `/contact_callinglist/<concal_id>/navid` – view by selected list ID
- GET `/contact_callinglist/<name>/calllistname` – view by list name
- POST `/contact_callinglist/remove` – remove contact or list relations
- PUT `/contact_callinglist/<concal_id>/note` – update note

---

## Call Logs & Callbacks

- POST `/calllog/<concal_id>/status` – create call log status
- DELETE `/calllog/<call_id>` – delete call log
- GET `/callbacks/calls` – call history for customer

---

## Organizations

- GET `/organizations/all` – get all organizations

---

## File Preview

- POST `/preview_file/` – upload file for preview processing

---

## Twilio Backend API

- GET `/twilio/token` – generate WebRTC access token (auth required)
- POST `/twilio/voice` – TwiML response for WebRTC and PSTN calls
- POST `/twilio/call-status` – call status webhook

---

## 🔐 Invitation System

## Customers

- GET `/invitation/customers` – list customer invitations
- POST `/invitation/customers/invite` – invite customer + admin
- POST `/invitation/customers/remove` – remove customer invitation

## Users

- GET `/invitation/users` – list user invitations
- POST `/invitation/users/invite` – invite user
- POST `/invitation/users/remove` – remove user invitation

---

## 📁 Project Architecture

The system is organized into the following layers:

### Backend (Flask API)

The backend follows a modular blueprint-based architecture:

- **Routes layer** – API endpoints grouped by domain (users, contacts, calls, etc.)
- **Services layer** – business logic (invitations, Twilio integration, workflows)
- **Models layer** – database entities and ORM mappings
- **Schemas layer** – request/response serialization and validation
- **Migrations** – database version control
- **Helpers layer** – authentication utilities, validation, JWT token handling
  Multi-tenant design is implemented via Customer-based data isolation.

### Frontend (React SPA)

- **Pages** – route-level UI screens
- **Components** – feature-based UI components (auth, users, Twilio, invitations, shared UI)
- **Services** – API communication layer (REST requests, auth handling)
- **Authentication** – implemented in auth-related components (login, session, token management)
- **Twilio Integration** – WebRTC client setup using Twilio JS SDK inside dedicated components
- **User Management** – user administration and invitation workflows handled in user-related components

---

## Author

Tatiana Lyubavskaya.
