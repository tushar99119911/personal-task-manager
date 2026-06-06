# Personal Task Manager

A full-stack personal to-do list built for **Exercise 1** of the Studio Graphene Full Stack Developer assessment. Users can create, view, update, delete, and filter tasks without authentication — designed for a single user.

## Live Demo Links

> Not deployed yet. To deploy:
> - **Backend:** Render or Railway (set `PORT` and `CORS_ORIGIN`)
> - **Frontend:** Vercel or Netlify (set `VITE_API_URL` to your backend URL)

| Service  | URL |
|----------|-----|
| Frontend | _Add after deployment_ |
| Backend  | _Add after deployment_ |

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Backend | Node.js, Express, TypeScript | Clean REST API with type safety |
| Frontend | React 18, Vite, TypeScript | Fast dev experience, hooks-only components |
| Styling | Tailwind CSS | Responsive UI without heavy dependencies |
| Storage | JSON file (`server/data/tasks.json`) | Simple persistence across server restarts |
| Testing | Vitest + Supertest | Meaningful backend API integration tests |

## How to Run Locally

**Prerequisites:** Node.js 18+ installed.

```bash
# 1. Install all dependencies (from project root)
npm install
npm run install:all

# 2. Start both server and client
npm run dev
```

This starts:
- **API server** at `http://localhost:3001`
- **React app** at `http://localhost:5173`

### Run separately

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

### Run tests

```bash
cd server
npm test
```

### Production build

```bash
npm run build
cd server && npm start
cd client && npm run preview
```

## API Documentation

Base URL: `http://localhost:3001/api`

### `GET /tasks`

List tasks sorted by creation date (newest first).

**Query parameters:**
| Param | Type | Values | Default |
|-------|------|--------|---------|
| `status` | string | `all`, `active`, `completed` | `all` |
| `search` | string | Title search (case-insensitive) | — |

**Response `200`:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "description": "Milk and eggs",
      "dueDate": "2026-06-15",
      "completed": false,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "active": 1,
    "completed": 0
  }
}
```

### `GET /tasks/:id`

Get a single task.

**Response `200`:** Task object  
**Response `404`:** `{ "error": "Task not found", "statusCode": 404 }`

### `POST /tasks`

Create a new task.

**Request body:**
```json
{
  "title": "Buy groceries",
  "description": "Optional",
  "dueDate": "2026-06-15"
}
```

**Response `201`:** Created task object  
**Response `400`:** `{ "error": "Title is required", "statusCode": 400 }`

### `PUT /tasks/:id`

Update a task. All fields are optional.

**Request body:**
```json
{
  "title": "Updated title",
  "description": "New description",
  "dueDate": "2026-06-20",
  "completed": true
}
```

**Response `200`:** Updated task object  
**Response `404`:** Task not found

### `PATCH /tasks/:id/toggle`

Toggle task completion status.

**Response `200`:** Updated task object

### `DELETE /tasks/:id`

Delete a task.

**Response `204`:** No content  
**Response `404`:** Task not found

### `GET /health`

Health check.

**Response `200`:** `{ "status": "ok" }`

## Project Structure

```
task-manager/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api/               # API client (fetch wrappers)
│   │   ├── components/        # UI components
│   │   ├── hooks/             # useTasks custom hook
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Date helpers, constants
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # Error handling
│   │   ├── repositories/      # JSON file persistence
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic & validation
│   │   └── types/             # TypeScript interfaces
│   ├── tests/                 # API integration tests
│   ├── data/                  # tasks.json storage
│   └── package.json
├── DESIGN.md                  # Architecture design document
├── README.md
└── package.json               # Root scripts (concurrently)
```

## Features Implemented

### Must Have
- Add task with title (required), optional description and due date
- View all tasks sorted by creation date (newest first)
- Toggle task complete/incomplete
- Edit task title, description, and due date
- Delete task with confirmation dialog
- Filter by All, Active, Completed

### Should Have
- Active vs completed task counts in header
- Overdue tasks highlighted with red border and badge
- Empty state when no tasks match

### Bonus
- Search tasks by title
- JSON file persistence across server restarts
- Backend API tests (Vitest + Supertest)
- Loading, error, and responsive mobile UI

## Next Steps

With more time, I would add:

- **Drag-and-drop reordering** — requires an `order` field and more complex persistence
- **Deployed live demo** — Render (backend) + Vercel (frontend)
- **Dark mode** toggle
- **Task categories/tags** for better organization
- **Due date reminders** or calendar view
- **Input debouncing** on search for fewer API calls
