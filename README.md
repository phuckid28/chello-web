# Chello Web (Frontend)

## Overview
**Chello Web** is the single-page frontend application for **Chello** (a Trello-inspired Kanban board application) built with **React 18**, **Vite**, **Material UI (MUI v5)**, **Redux Toolkit**, and **@dnd-kit**.

---

## Tech Stack
- **Framework & Bundler**: React 18 (`^18.2.0`), Vite (`^4.3.2`) with SWC (`@vitejs/plugin-react-swc`)
- **UI Library**: Material UI (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `material-ui-confirm`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing & Forms**: React Router DOM v6 (`react-router-dom`), React Hook Form (`react-hook-form`)
- **HTTP Client**: Axios (`authorizedAxiosInstance`) with `withCredentials: true`, centralized error handling, and automatic `410 GONE` access token refresh

---

## Project Structure
```text
chello-web/
├── docker/
│   └── nginx.conf                         # Production Nginx SPA routing & security headers
├── public/
├── src/
│   ├── apis/
│   │   └── index.js                       # REST API client wrappers (boards, columns, cards, users)
│   ├── assets/                            # Static SVG icons & background images
│   ├── components/
│   │   ├── AppBar/                        # Top navigation bar & user profile menu
│   │   ├── Form/FieldErrorAlert.jsx       # Form validation alert component
│   │   ├── Loading/PageLoadingSpinner.jsx # Full-screen loading indicator
│   │   └── ModeSelect/ModeSelect.jsx      # Light / Dark / System theme switcher
│   ├── customLibaries/
│   │   └── DndKitSensors.js               # Custom Mouse & Touch sensors ignoring data-no-dnd elements
│   ├── pages/
│   │   ├── 404/NotFound.jsx               # Custom 404 page
│   │   ├── Auth/                          # Login, Register & Email AccountVerification pages
│   │   └── Boards/                        # Paginated Boards list, Create Board modal & Kanban BoardContent
│   ├── redux/
│   │   ├── activeBoard/activeBoardSlice.js# Redux slice for active board state
│   │   ├── user/userSlice.js              # Redux slice for authenticated user state
│   │   └── store.js                       # Redux store configuration
│   ├── utils/
│   │   ├── authorizeAxios.js              # Axios instance with HttpOnly cookie & 410 token refresh interceptors
│   │   ├── constants.js                   # API_ROOT & pagination constants
│   │   ├── formatters.js                  # Placeholder card & spam-click prevention helpers
│   │   ├── randomColor.js                 # Deterministic board card header color generator
│   │   ├── sort.js                        # mapOrder array sorting utility
│   │   └── validators.js                  # Shared email, password & file validation rules
│   ├── App.jsx                            # Route definitions & ProtectedRoute guard
│   ├── main.jsx                           # Application bootstrap
│   └── theme.js                           # MUI CssVarsProvider custom theme
├── Dockerfile                             # Multi-stage Vite build + Nginx production image
├── compose.yaml                           # Docker Compose configuration
├── .gitlab-ci.yml                         # GitLab CI/CD pipeline (lint, test, build-image)
└── vite.config.js                         # Vite configuration
```

---

## Setup & Running Locally

### 1. Install Dependencies
```bash
yarn install
```

### 2. Run Development Server
```bash
yarn dev
```
The application runs at `http://localhost:5173` and connects to `http://localhost:8017` by default (configurable via `VITE_API_ROOT`).

### 3. Lint & Production Build
```bash
yarn lint
yarn build
```

### 4. Run Full-Stack with Docker Compose
Launch MongoDB 7.0, `chello-api` (`http://localhost:8017`), and `chello-web` (`http://localhost:5173`) with a single command:
```bash
docker compose up --build
```
