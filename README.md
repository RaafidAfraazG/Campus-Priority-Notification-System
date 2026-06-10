# Campus-Priority-Notification-System

React TypeScript frontend for a protected campus notification API with notification listing, local viewed-state tracking, priority inbox, logging middleware, and system design documentation.

## Install And Run

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Environment Variables

Create `frontend/.env` from `frontend/.env.example`.

```bash
VITE_ACCESS_TOKEN=replace_with_access_token
VITE_NOTIFICATION_API_URL=/evaluation-service/notifications
VITE_LOG_API_URL=/evaluation-service/logs
```

Place real secrets only in local `.env` files. Do not commit them.

## Folder Structure

```text
logging_middleware/
frontend/
backend/
notification_system_design.md
README.md
```

## Notes

The frontend uses plain CSS, React, TypeScript, and Vite. The backend folder contains a short README because the assessment provides the notification API and does not require a backend server.
