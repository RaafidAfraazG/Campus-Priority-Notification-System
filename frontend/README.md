# Frontend

React TypeScript frontend for the campus notification assessment project.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment

Create a local `.env` file inside `frontend` using `.env.example`.

Required values:

```bash
VITE_ACCESS_TOKEN=replace_with_access_token
VITE_NOTIFICATION_API_URL=/evaluation-service/notifications
VITE_LOG_API_URL=/evaluation-service/logs
```

Secrets must stay in local `.env` files only.
