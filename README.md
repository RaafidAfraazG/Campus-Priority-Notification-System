# Campus Priority Notification System

This repository contains the frontend for a campus notification system built with React and TypeScript. It features a paged and filterable list of all notifications, a priority inbox that ranks important updates, and detailed system design documentation for a full-stack implementation.

## Features

*   **All Notifications Page:** Browse campus updates with filters for type (Event, Result, Placement) and pagination controls.
*   **Priority Inbox:** View the top 10 most important notifications, ranked by a scoring system based on type and recency.
*   **Viewed State Tracking:** Notifications are marked as "viewed" after being clicked, with the state persisted locally in the browser's `localStorage`.
*   **Responsive UI:** A clean, responsive interface that adapts to various screen sizes.
*   **Logging Middleware:** A custom logger sends structured logs (e.g., API calls, UI interactions) to a specified endpoint.
*   **Comprehensive System Design:** Includes a detailed `notification_system_design.md` document covering API contracts, database schema, query optimization, and scalable architecture.

## Getting Started

Follow these steps to run the frontend application locally.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Configuration

Before running the application, you need to set up your environment variables.

1.  Create a `.env` file in the `frontend` directory from the example file:
    ```bash
    cp frontend/.env.example frontend/.env
    ```
2.  Edit `frontend/.env` and add your access token:
    ```env
    # The access token required to authenticate with the notification and log APIs.
    VITE_ACCESS_TOKEN=replace_with_your_access_token

    # The proxy path for the notification API. The default is configured in vite.config.ts.
    VITE_NOTIFICATION_API_URL=/evaluation-service/notifications

    # The proxy path for the logging API. The default is configured in vite.config.ts.
    VITE_LOG_API_URL=/evaluation-service/logs
    ```
    The Vite configuration (`vite.config.ts`) proxies requests to `/evaluation-service` to the target API server at `http://4.224.186.213`.

## Project Structure

The repository is organized into several key areas:

```
.
├── backend/                  # Placeholder for future backend implementation.
├── frontend/                 # React and TypeScript frontend application.
│   ├── src/
│   │   ├── api/              # Functions for fetching data from the API.
│   │   ├── components/       # Reusable React components.
│   │   ├── pages/            # Top-level page components.
│   │   ├── types/            # TypeScript type definitions.
│   │   └── utils/            # Helpers for priority logic and local storage.
│   └── vite.config.ts        # Vite configuration, including the API proxy.
├── logging_middleware/       # Custom logging function used by the frontend.
└── notification_system_design.md # In-depth system design documentation.
```

## System Design Documentation

The `notification_system_design.md` file provides a comprehensive blueprint for building a complete, scalable notification system. It is broken down into several stages:

*   **Stage 1: API Contract:** Defines REST endpoints for fetching notifications, marking them as read, and getting unread counts.
*   **Stage 2: Database Schema:** Proposes a PostgreSQL schema with tables for students, notifications, and read statuses.
*   **Stage 3: Query Optimization:** Discusses indexing strategies to improve query performance at scale.
*   **Stage 4: Performance Strategy:** Explores caching, pagination, and real-time updates (via WebSocket/SSE).
*   **Stage 5: Reliable Architecture:** Outlines a robust architecture using message queues to handle bulk notifications reliably.
*   **Stage 6: Priority Inbox:** Details the logic used to calculate and rank priority notifications.

## Priority Inbox Logic

The Priority Inbox displays the top 10 notifications based on a calculated score. This logic is implemented in `frontend/src/utils/priority.ts`.

-   **Weights:** Each notification type is assigned a weight:
    -   `Placement`: 3
    -   `Result`: 2
    -   `Event`: 1
-   **Scoring:** The score is a combination of the type's weight and the notification's timestamp. This ensures that higher-priority types (like `Placement`) are ranked first, and within the same type, newer notifications appear higher.
-   **Ranking:** The frontend fetches recent notifications, calculates their scores, sorts them in descending order, and displays the top 10 with their rank from 1 to 10.
