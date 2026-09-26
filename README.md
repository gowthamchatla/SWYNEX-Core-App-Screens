# QuickTask — Core App Screens

SWYNEX Internship — Task 2 (Core App Screens)

A daily micro-task and habit tracker, built as a mobile-responsive web app.
This implements the primary screens defined in Task 1 (App Concept and Screen Flow).

## Tech used

Plain HTML, CSS, and JavaScript (no framework). Chosen so it can be run and
reviewed locally with zero setup — just open `index.html` in a browser.

## Task progression

- **Task 1** — App concept and screen flow (design doc)
- **Task 2** — Core app screens implemented (this codebase)
- **Task 3** — Added validation and confirmed persistent local state (see below)

## Task 3: Validation & persistent state

The **create-and-list** feature path (Add Task/Habit → appears on Home) now includes:

- **Required field validation** — an empty name shows an inline error and blocks saving
- **Minimum length validation** — names shorter than 2 characters are rejected
- **Duplicate detection** — you can't create two items of the same type with the same name
- **Empty states** — the Tasks/Habits lists show a friendly message when there's nothing to display yet
- **Persistent local state** — all items are saved to `localStorage` under the key `quicktask_items_v1`, so your data survives a page refresh or browser restart

## Screens included

1. **Onboarding** — app intro with a "Get started" CTA
2. **Home** — today's tasks and habits, progress summary, streak counter, quick-add button
3. **Add Task / Habit** — form to create a new task or habit (name, type, category, reminder time)
4. **Progress** — weekly completion chart and habit streaks
5. **Profile** — user info and settings (notifications, dark mode toggle)

## Features

- Full navigation between all 5 screens (onboarding → home → bottom tabs)
- Add new tasks/habits from the Home screen; they appear immediately
- Tap any task/habit to mark it done/undone; the summary and streaks update live
- Progress screen shows a weekly bar chart and per-habit streak counts
- State is saved to `localStorage`, so your tasks persist between page reloads
- Fully responsive layout — works on mobile screen sizes and in desktop browsers

## Running locally

No build step or dependencies required.

```bash
# Option 1: just open the file directly
open index.html

# Option 2: serve it locally (recommended for consistent behavior)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
quicktask-app/
├── index.html      # all 5 screens (markup)
├── css/
│   └── style.css   # styling for all screens
├── js/
│   └── app.js      # navigation, state, and rendering logic
└── README.md
```
