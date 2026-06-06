# Exercise 1: Personal Task Manager — Design Document

## 1. Overview

A full-stack personal task manager (to-do list) for a single user with no authentication. Users can create, view, update, delete, and filter tasks. The app follows a **monorepo** layout with clear separation between React frontend and Node.js backend.

**Chosen exercise:** Exercise 1 — Personal Task Manager (Studio Graphene Full Stack Assessment)

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Backend** | Node.js + Express + TypeScript | Type safety, familiar REST patterns, easy to test |
| **Frontend** | React 18 + Vite + TypeScript | Fast dev server, modern hooks-only components |
| **Storage** | JSON file (`data/tasks.json`) | Satisfies persistence bonus; simple, no DB setup |
| **Styling** | Tailwind CSS | Rapid, responsive UI without heavy component libraries |
| **HTTP client** | Native `fetch` + custom hooks | Keeps dependencies light; sufficient for CRUD |
| **IDs** | `crypto.randomUUID()` | Built-in, no extra package |
| **Testing** | Vitest (backend) | One or two meaningful API tests |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ TaskForm │ │ TaskList │ │ Filters  │ │ Stats / Search│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘ │
│       └────────────┴────────────┴───────────────┘           │
│                         │ fetch (REST)                       │
└─────────────────────────┼───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Express API (Node.js) — port 3001               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Routes      │→ │ Controllers  │→ │ Task Service     │  │
│  │ /api/tasks  │  │ validation   │  │ (business logic) │  │
│  └─────────────┘  └──────────────┘  └────────┬─────────┘  │
│                                                 ▼            │
│                                    ┌──────────────────────┐  │
│                                    │ JSON File Repository │  │
│                                    │ data/tasks.json      │  │
│                                    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Principles:**
- Backend owns sorting, filtering logic, and persistence
- Frontend handles UI state (modals, form drafts, optimistic UX)
- CORS enabled for local dev; env var for production API URL

---

## 4. Data Model

```typescript
interface Task {
  id: string;              // UUID v4
  title: string;           // required, trimmed, max 200 chars
  description?: string;    // optional, max 1000 chars
  dueDate?: string;        // optional ISO date "YYYY-MM-DD"
  completed: boolean;      // default false
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
}
```

**Derived states (computed on frontend):**
- `isOverdue` = `dueDate < today` AND `!completed`
- `status` = `completed ? 'completed' : 'active'`

---

## 5. REST API Design

Base URL: `http://localhost:3001/api`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List all tasks (newest first). Query: `status`, `search` |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks/:id` | Update task (full or partial fields) |
| `PATCH` | `/tasks/:id/toggle` | Toggle `completed` |
| `DELETE` | `/tasks/:id` | Delete task |

### Query Parameters — `GET /tasks`

| Param | Values | Default |
|-------|--------|---------|
| `status` | `all` \| `active` \| `completed` | `all` |
| `search` | string (title match, case-insensitive) | — |

### Request / Response Shapes

**POST /tasks**
```json
// Request
{ "title": "Buy groceries", "description": "Milk, eggs", "dueDate": "2026-06-10" }

// Response 201
{ "id": "...", "title": "Buy groceries", "description": "Milk, eggs",
  "dueDate": "2026-06-10", "completed": false,
  "createdAt": "2026-06-06T10:00:00.000Z", "updatedAt": "2026-06-06T10:00:00.000Z" }
```

**PUT /tasks/:id**
```json
// Request (any subset of editable fields)
{ "title": "Updated title", "description": "", "dueDate": null, "completed": true }

// Response 200 — full Task object
```

**PATCH /tasks/:id/toggle**
```json
// No body
// Response 200 — updated Task object
```

**GET /tasks** (with stats in response header or body)
```json
// Response 200
{
  "tasks": [ /* Task[] sorted by createdAt desc */ ],
  "meta": {
    "total": 5,
    "active": 3,
    "completed": 2
  }
}
```

### Error Responses

```json
{ "error": "Title is required", "statusCode": 400 }
{ "error": "Task not found", "statusCode": 404 }
{ "error": "Internal server error", "statusCode": 500 }
```

---

## 6. Backend Structure

```
server/
├── src/
│   ├── index.ts              # Express app entry, CORS, middleware
│   ├── routes/
│   │   └── taskRoutes.ts     # Route definitions
│   ├── controllers/
│   │   └── taskController.ts # HTTP handlers, status codes
│   ├── services/
│   │   └── taskService.ts    # CRUD, filter, sort, search
│   ├── repositories/
│   │   └── taskRepository.ts # Read/write tasks.json
│   ├── middleware/
│   │   └── errorHandler.ts   # Centralized error handling
│   └── types/
│       └── task.ts           # Task interface
├── data/
│   └── tasks.json            # Persisted tasks (gitignored or seeded)
├── tests/
│   └── tasks.test.ts         # API integration tests
├── package.json
└── tsconfig.json
```

### Key Backend Behaviors

1. **On startup:** Ensure `data/tasks.json` exists; create `[]` if missing
2. **Create:** Validate title (non-empty after trim); set timestamps
3. **List:** Sort by `createdAt` descending; apply `status` and `search` filters
4. **Update:** Merge fields; bump `updatedAt`
5. **Delete:** Return 404 if id not found
6. **Concurrency:** File write with simple in-memory lock (single-user app)

---

## 7. Frontend Structure

```
client/
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Layout shell
│   ├── api/
│   │   └── tasks.ts          # API client functions
│   ├── hooks/
│   │   ├── useTasks.ts       # Fetch, mutate, refetch
│   │   └── useTaskForm.ts    # Form state for add/edit
│   ├── components/
│   │   ├── Header.tsx        # App title + stats
│   │   ├── TaskStats.tsx     # Active vs completed counts
│   │   ├── TaskForm.tsx      # Add / edit form
│   │   ├── TaskList.tsx      # Renders list or empty state
│   │   ├── TaskItem.tsx      # Single task row/card
│   │   ├── FilterTabs.tsx    # All | Active | Completed
│   │   ├── SearchBar.tsx     # Title search (bonus)
│   │   ├── EmptyState.tsx    # No tasks illustration/message
│   │   ├── ConfirmDialog.tsx # Delete confirmation
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBanner.tsx
│   ├── utils/
│   │   ├── date.ts           # isOverdue, formatDate
│   │   └── constants.ts      # API base URL
│   ├── types/
│   │   └── task.ts
│   └── index.css             # Tailwind imports
├── index.html
├── package.json
├── vite.config.ts            # Proxy /api → localhost:3001 in dev
└── tailwind.config.js
```

---

## 8. UI / UX Design

### Layout (Desktop)

```
┌────────────────────────────────────────────────────────┐
│  Task Manager                    3 active · 2 done     │
├────────────────────────────────────────────────────────┤
│  [🔍 Search tasks...]                                  │
│                                                        │
│  ┌─ Add New Task ──────────────────────────────────┐  │
│  │ Title *        [________________________]        │  │
│  │ Description    [________________________]        │  │
│  │ Due Date       [____date picker____]  [Add Task]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [ All ]  [ Active ]  [ Completed ]                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ☐ Buy groceries          Due: Jun 10   ✏️ 🗑️     │  │
│  │   Milk, eggs                                     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ☑ Finish report          OVERDUE       ✏️ 🗑️     │  │  ← red border
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Visual States

| State | Treatment |
|-------|-----------|
| **Active task** | Default card, checkbox unchecked |
| **Completed task** | Strikethrough title, muted text, checked box |
| **Overdue task** | Red left border + "Overdue" badge (only if not completed) |
| **Empty list** | Centered icon + "No tasks yet. Add one above!" |
| **Loading** | Skeleton cards or spinner |
| **Error** | Red banner with retry button |
| **Delete** | Modal: "Delete this task?" with Cancel / Delete |

### Responsive (Mobile)

- Stack form fields vertically
- Full-width buttons
- Touch-friendly tap targets (min 44px)
- Filter tabs scroll horizontally if needed

### Color Palette (suggested)

- Background: `#f8fafc` (slate-50)
- Primary: `#3b82f6` (blue-500)
- Danger/overdue: `#ef4444` (red-500)
- Completed: `#94a3b8` (slate-400)
- Success: `#22c55e` (green-500)

---

## 9. User Flows

### Flow 1: Add Task
1. User fills title (required), optional description & due date
2. Clicks "Add Task" → `POST /api/tasks`
3. Form resets; list refreshes with new task at top
4. Validation error shown inline if title empty

### Flow 2: Toggle Complete
1. User clicks checkbox → `PATCH /api/tasks/:id/toggle`
2. Task visually updates (strikethrough / stats recount)

### Flow 3: Edit Task
1. User clicks edit icon → form populates with task data
2. User modifies fields → clicks "Save" → `PUT /api/tasks/:id`
3. Form returns to "add" mode

### Flow 4: Delete Task
1. User clicks delete → confirmation modal opens
2. Confirm → `DELETE /api/tasks/:id` → task removed from list

### Flow 5: Filter
1. User clicks Active / Completed tab
2. Frontend calls `GET /api/tasks?status=active` (or filters client-side)
3. List updates; empty state if no matches

---

## 10. Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| Add task (title, description, due date) | `TaskForm` + `POST /tasks` |
| View all, newest first | Server sort by `createdAt` desc |
| Toggle complete | Checkbox + `PATCH /toggle` |
| Edit task | Edit mode in `TaskForm` + `PUT /tasks/:id` |
| Delete with confirmation | `ConfirmDialog` + `DELETE /tasks/:id` |
| Filter All/Active/Completed | `FilterTabs` + query param |
| Active vs completed count | `TaskStats` from API `meta` |
| Overdue visual | `isOverdue()` utility + red styling |
| Empty state | `EmptyState` component |
| Search by title (bonus) | `SearchBar` + `?search=` param |
| JSON persistence (bonus) | `taskRepository.ts` |
| Drag-and-drop reorder (bonus) | **Deferred** — out of scope for MVP |

---

## 11. Environment & Configuration

```
# server/.env
PORT=3001
DATA_FILE=./data/tasks.json
CORS_ORIGIN=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:3001/api
```

**Production:** Set `VITE_API_URL` to deployed backend URL (Render/Railway).

---

## 12. Project Root Structure

```
task-manager/
├── client/          # React + Vite frontend
├── server/          # Express backend
├── DESIGN.md        # This document
├── README.md        # Setup, API docs, deployment links
├── package.json     # Root scripts (optional: concurrently)
└── .gitignore
```

**Root scripts (optional):**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install:all": "npm install --prefix server && npm install --prefix client"
  }
}
```

---

## 13. Implementation Order (6–10 hours)

| Phase | Time | Tasks |
|-------|------|-------|
| **1. Scaffold** | ~1h | Monorepo, Express skeleton, Vite React app, Tailwind |
| **2. Backend CRUD** | ~2h | Repository, service, routes, validation, JSON persistence |
| **3. Frontend list** | ~2h | Fetch tasks, TaskList, TaskItem, loading/error states |
| **4. Forms & actions** | ~2h | Add/edit form, toggle, delete modal |
| **5. Filters & polish** | ~1.5h | Filter tabs, stats, overdue styling, empty state, search |
| **6. Docs & deploy** | ~1.5h | README, API docs, deploy to Render + Vercel, 1–2 tests |

---

## 14. Deployment Plan

| Service | Hosts | Notes |
|---------|-------|-------|
| Backend | Render or Railway | Free tier; set `PORT`, mount persistent disk for JSON if needed |
| Frontend | Vercel or Netlify | Set `VITE_API_URL` to backend URL |

**CORS:** Allow deployed frontend origin in server config.

---

## 15. Testing Strategy (Optional Bonus)

1. **Backend:** `POST /tasks` without title → 400
2. **Backend:** Full CRUD cycle → create, read, update, delete, verify JSON file

---

## 16. Next Steps (README honesty section)

Items intentionally deferred or for future work:
- Drag-and-drop reorder (requires `order` field + more complex persistence)
- User authentication / multi-user support
- Recurring tasks
- Categories / tags
- Dark mode toggle
- Offline support / service worker

---

## 17. Git Commit Strategy

Incremental commits reviewers expect:
1. `chore: scaffold monorepo with client and server`
2. `feat(server): add task CRUD API with JSON persistence`
3. `feat(client): add task list and form components`
4. `feat: add filters, stats, and overdue styling`
5. `feat: add search and delete confirmation`
6. `test: add backend API tests`
7. `docs: add README and deployment links`
