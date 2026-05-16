# Stage 1: REST API Contract and Notification Structure

## Supported Actions

- Fetch notifications for a student.
- Filter notifications by type.
- Paginate notification lists.
- Mark a notification as read in a future backend design.
- Fetch unread count in a future backend design.

## REST Endpoints

### Fetch Notifications

Method: `GET`

Endpoint:

```text
/notifications?studentId=1042&page=1&limit=10&notification_type=Placement
```

Headers:

```text
Authorization: Bearer access_token
Content-Type: application/json
```

Example response:

```json
{
  "notifications": [
    {
      "ID": "N1001",
      "Type": "Placement",
      "Message": "Placement drive registration closes today.",
      "Timestamp": "2026-05-16 10:30:00"
    }
  ]
}
```

### Mark Notification As Read

Method: `PATCH`

Endpoint:

```text
/students/1042/notifications/N1001/read
```

Example response:

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Get Unread Count

Method: `GET`

Endpoint:

```text
/students/1042/notifications/unread-count
```

Example response:

```json
{
  "studentId": 1042,
  "unreadCount": 6
}
```

## Real-Time Notification Approach

For real-time updates, the system can use Server-Sent Events or WebSocket.

SSE is a good fit when the server only needs to push notification updates to the browser. WebSocket is better when students also need to send live actions back through the same connection. In this project, SSE is enough for live notification delivery because the data mainly flows from server to student.

# Stage 2: Persistent Storage and Database Schema

PostgreSQL is suitable because notifications need reliable relational data, joins between students and notifications, indexing for filtering, and transaction support for bulk delivery. It also handles structured queries well as the system grows.

## Tables

```sql
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL CHECK (type IN ('Event', 'Result', 'Placement')),
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_notifications (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  notification_id BIGINT NOT NULL REFERENCES notifications(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  UNIQUE (student_id, notification_id)
);

CREATE TABLE notification_delivery_logs (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  notification_id BIGINT NOT NULL REFERENCES notifications(id),
  channel VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  error_message TEXT,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Example Queries

Fetch notifications:

```sql
SELECT n.id, n.type, n.message, n.created_at, sn.is_read
FROM student_notifications sn
JOIN notifications n ON n.id = sn.notification_id
WHERE sn.student_id = 1042
ORDER BY n.created_at DESC
LIMIT 10 OFFSET 0;
```

Fetch by type:

```sql
SELECT n.id, n.type, n.message, n.created_at, sn.is_read
FROM student_notifications sn
JOIN notifications n ON n.id = sn.notification_id
WHERE sn.student_id = 1042
  AND n.type = 'Placement'
ORDER BY n.created_at DESC
LIMIT 10 OFFSET 0;
```

Mark as read:

```sql
UPDATE student_notifications
SET is_read = true, read_at = CURRENT_TIMESTAMP
WHERE student_id = 1042
  AND notification_id = 1001;
```

Unread count:

```sql
SELECT COUNT(*) AS unread_count
FROM student_notifications
WHERE student_id = 1042
  AND is_read = false;
```

# Stage 3: Query Optimization

Query:

```sql
SELECT * FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

This query is not logically correct for the schema above because `studentId` and `isRead` belong to `student_notifications`, while notification content belongs to `notifications`. A corrected version should join both tables.

At scale, the query becomes slow because the database may scan many rows for one student, then sort all unread rows by creation time. With many students and notifications, that can become expensive.

Recommended index:

```sql
CREATE INDEX idx_student_notifications_student_read
ON student_notifications (student_id, is_read, notification_id);

CREATE INDEX idx_notifications_created_at
ON notifications (created_at);
```

For the corrected join query, PostgreSQL can quickly find unread rows for one student instead of scanning the whole table. The cost can improve from a large table scan toward an indexed lookup plus a smaller sort.

Indexing every column is not effective because indexes take storage, slow down inserts and updates, and may never be used by common queries. Indexes should match real filtering, joining, and sorting patterns.

Students who got Placement notifications in the last 7 days:

```sql
SELECT DISTINCT s.id, s.name, s.email
FROM students s
JOIN student_notifications sn ON sn.student_id = s.id
JOIN notifications n ON n.id = sn.notification_id
WHERE n.type = 'Placement'
  AND n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

Useful indexes for that case:

```sql
CREATE INDEX idx_notifications_type_created
ON notifications (type, created_at DESC);

CREATE INDEX idx_student_notifications_notification_student
ON student_notifications (notification_id, student_id);
```

# Stage 4: Performance Improvement Strategy

Fetching notifications on every page load can overload the database if many students open the app at the same time.

Pagination reduces each request to a small result set. It is simple and reliable, but users may still request several pages.

Caching can store recent notification results for a short time. This reduces repeated database work, but personalized data must be cached carefully so one student never receives another student's data.

An unread count cache stores only the unread number for each student. This is fast for badges and headers, but it must be updated whenever a notification is created or marked as read.

`lastFetchedAt` supports incremental fetch. The frontend can request only notifications created after the last successful load. This reduces repeated data transfer, but the backend must handle missed updates and clock differences carefully.

WebSocket or SSE can push new notifications when they arrive. This avoids constant polling, but it adds connection management and retry behavior.

CDN caching is not relevant for personalized notification data because each student receives different private content.

# Stage 5: Notify All Reliable Architecture

Bad implementation:

```text
for each student:
  send_email
  save_to_db
  push_to_app
```

If email takes 200 ms per student and there are 50,000 students, email alone takes:

```text
50,000 * 200 ms = 10,000,000 ms = 10,000 seconds = about 166.7 minutes
```

That is almost 2 hours and 47 minutes before considering database saves or app push.

Revised pseudocode:

```text
create notification once
find target students
bulk insert student notification rows
publish email jobs to queue
publish app push jobs to queue

email worker:
  receive job
  send email
  save delivery log
  retry failed jobs with backoff
  move repeated failures to dead letter queue

push worker:
  receive job
  send app notification asynchronously
  save delivery log
```

Database save and email sending should not be tightly coupled. The notification record must be saved quickly and reliably even if email is slow or temporarily unavailable. A queue lets the system retry email without blocking the main request or losing the notification.

# Stage 6: Priority Inbox Approach

The frontend priority inbox uses notification type weight plus recency.

Weights:

```text
Placement = 3
Result = 2
Event = 1
```

Each notification gets a score from its type weight and timestamp. Higher type weight ranks first, and newer timestamps rank higher within the same type. The frontend sorts notifications by score and selects the top 10.

For this stage, database storage is not required because the assessment provides the notification API. In a larger backend design, the same priority logic could be moved into an API query or calculated field.
