# 📋 Smart To-Do List

> A dependency-aware task management system built with React + TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite)](https://vitejs.dev/)

---

## 🎯 Overview

This project is a **dependency-aware Smart To-Do List** built as part of a Frontend Engineering take-home assignment. The application consumes a provided backend API to manage tasks and their dependencies, enforcing authoritative dependency rules on the frontend to ensure consistent task state transitions.

**Focus**: Logic correctness, code structure, and maintainability over visual design.

---

## ✨ Features

- 📊 **Display tasks** with their current state
- 🔍 **Filter tasks** by state (todo, in_progress, done, blocked)
- 🔒 **Enforce dependency rules**:
  - Automatic blocking and unblocking
  - Recursive propagation to downstream tasks
  - User-driven task state updates (when allowed)
- 🛡️ **Type-safe** implementation using TypeScript
- 🏗️ **Clean separation** between UI and domain logic

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React + TypeScript |
| **Build Tool** | Vite |
| **API Communication** | Fetch API |
| **State Management** | React Hooks |
| **Backend** | FastAPI (provided via Docker) |

---

## 🚀 Getting Started

### Prerequisites

- ✅ Docker & Docker Compose
- ✅ Node.js (v18+ recommended)
- ✅ npm or pnpm

### 1️⃣ Backend Setup

**Start the backend services:**

```bash
docker compose up -d
```

**Run database migrations:**

```bash
docker compose exec -it api uv run alembic upgrade head
```

**Verify the backend is running:**

Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

### 2️⃣ Frontend Setup

**Install dependencies:**

```bash
npm install
```

**Start the development server:**

```bash
npm run dev
```

**Open the application:**

Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📐 Dependency Rules & State Model

### Task States

| State | Description | User Editable |
|-------|-------------|---------------|
| `todo` | Ready to start | ✅ Yes |
| `in_progress` | Currently working | ✅ Yes |
| `done` | Completed | ✅ Yes |
| `blocked` | Waiting on dependencies | ❌ No (derived) |

### Core Rules

#### 🔒 Blocking vs Actionable

- A task is **blocked** if any dependency is not `done`
- A task is **actionable** only if all dependencies are `done`

#### 🔄 Automatic Transitions

- `blocked` → `todo` when all dependencies become `done`
- `todo | in_progress | done` → `blocked` if any dependency reverts

#### 👤 User-driven Transitions

Users may move actionable tasks between:
- `todo` ↔ `in_progress` ↔ `done`

**Restrictions:**
- ❌ Cannot manually set a task to `blocked`
- ❌ Cannot edit blocked tasks

#### 🌊 Recursive Propagation

- Any state change propagates recursively to all downstream dependent tasks
- Propagation continues until the system reaches a stable state

#### 🔗 Multiple Dependencies

- Tasks may depend on any number of other tasks
- **Consistency Rule**: A `done` task will revert to `blocked` if any dependency becomes not `done`

---

## 🏗️ Architecture & Code Organization

The project follows a clean architecture pattern with clear separation of concerns:

```
src/
├── api/              # API client functions
├── domain/           # Dependency resolution & propagation logic
├── components/       # UI components
├── hooks/            # Custom React hooks
├── types/            # Shared TypeScript types
├── styles/           # CSS styling
└── App.tsx           # Main application
```

### Key Design Decisions

- ✅ Dependency evaluation and propagation are implemented as **pure functions**
- ✅ UI components do **not contain business logic**
- ✅ All state transitions are **validated** against dependency rules before being applied

---

## 🧮 Data Structures & Algorithms

### Data Structures

| Structure | Purpose | Complexity |
|-----------|---------|------------|
| **Adjacency Map** | Track dependency relationships | O(1) lookup |
| **Task Map** | Access tasks by ID | O(1) access |

### Algorithms

#### Depth-First Search (DFS)

Used for recursive propagation of task state changes.

**Features:**
- Visited Set prevents infinite loops
- Enables simple cycle detection
- **Time Complexity**: O(n + e)
  - `n` = number of tasks
  - `e` = number of dependencies

---

## 🛡️ Error Handling

- ✅ Backend errors are displayed in a user-friendly format
- ✅ Invalid user actions (e.g., editing blocked tasks) are prevented at both UI and logic levels
- ✅ Dependency cycles are detected and reported clearly

---

## 🧪 Testing the Application

### Test Case 1: Dependency Blocking
1. Find a task with incomplete dependencies
2. Verify it shows as `blocked`
3. Complete all dependencies
4. Task should automatically transition to `todo`

### Test Case 2: Recursive Propagation
1. Find a `done` task that other tasks depend on
2. Change it to `todo` or `in_progress`
3. All downstream tasks should automatically become `blocked`
4. Change it back to `done`
5. Downstream tasks should unblock


### Test Case 3: State Filtering
1. Use filter buttons to view tasks by state
2. Verify filtering works correctly
3. Test "All" to show everything

### 🧪 Automated Verification
Run the domain logic verification suite:
```bash
npm test
```
This runs `vitest` to verify strict adherence to dependency rules.

---

## 📚 Project Structure

```
Frontend-assessment/
├── src/
│   ├── api/
│   │   └── tasks.ts              # API client
│   ├── domain/
│   │   ├── dependencies.ts       # Graph & blocking logic
│   │   ├── propagation.ts        # DFS propagation
│   │   ├── validation.ts         # State validation
│   │   └── rules.test.ts         # Dependency rules verification
│   ├── components/
│   │   ├── TaskList.tsx          # Task list display
│   │   ├── TaskItem.tsx          # Individual task card
│   │   ├── StateFilter.tsx       # Filter controls
│   │   └── ErrorDisplay.tsx      # Error messages
│   ├── hooks/
│   │   └── useTasks.ts           # Task management hook
│   ├── types/
│   │   └── task.ts               # TypeScript types
│   └── styles/
│       └── app.css               # Application styles
├── docker-compose.yml            # Backend services
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
└── index.html                    # HTML template
```

---

## 🎨 Color Scheme

Tasks are color-coded by state for easy visual identification:

| State | Color | Hex |
|-------|-------|-----|
| **Todo** | 🔵 Blue | `#3b82f6` |
| **In Progress** | 🟠 Orange | `#f59e0b` |
| **Done** | 🟢 Green | `#10b981` |
| **Blocked** | 🔴 Red | `#ef4444` |

---
---

## 🧠 Assumptions & Trade-offs

### 💡 Assumptions

- **Authority**: The Backend API is the final source of truth for task data and state.
- **Scale**: The task dependency graph is assumed to be relatively small, fitting the typical use case for a personal to-do list.
- **State Derivation**: The `blocked` state is strictly derived in the frontend based on dependency rules, ensuring consistency before API submission.

### ⚖️ Trade-offs

- **Real-time Updates**: WebSocket or Polling support was considered optional and skipped to maintain a lean, performance-focused initial implementation.
- **Design System**: Explicitly used clean, functional CSS instead of a heavy UI framework to prioritize code correctness and logical integrity.
- **State Sync**: Opted for optimistic updates with manual refresh to ensure the user always sees the authoritative state while maintaining a snappy feel.

---

## 🚀 Potential Improvements

If given more time, the following enhancements would be prioritized:

- 🔄 **Real-time Sync**: Add WebSocket support for live task updates across multiple clients.
- 📉 **Graph Visualization**: Introduce a visual dependency map to help users navigate complex task relationships.
- ↩️ **Undo/Redo**: Add state history management for easy recovery from accidental transitions.
- ⌨️ **Accessibility**: Enhance ARIA labeling and keyboard navigation for a truly inclusive experience.

---

