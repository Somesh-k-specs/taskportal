# DoAble — AI-Powered Task Management

A full-stack task management application built with Spring Boot + React + Gemini AI.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Spring Boot 3.2, Java 21, Maven     |
| Security  | Spring Security, JWT (JJWT 0.11.5)  |
| Database  | MySQL 8 + Spring Data JPA           |
| AI        | Google Gemini 1.5 Flash API         |
| Frontend  | React 18, Vite, Tailwind CSS        |
| HTTP      | Axios with JWT interceptor          |

---

## Architecture Overview

```
taskportal/
├── backend/                         # Spring Boot app
│   └── src/main/java/com/taskportal/backend/
│       ├── config/          # SecurityConfig, AppConfig (CORS, beans)
│       ├── controller/      # AuthController, TaskController, AiController
│       ├── service/         # AuthService, TaskService, AiService
│       ├── security/        # JwtAuthenticationFilter
│       ├── model/           # User, Task (JPA entities + enums)
│       ├── dto/             # Request/Response DTOs
│       ├── repository/      # JPA repositories
│       ├── util/            # JwtUtil
│       └── exception/       # GlobalExceptionHandler, ResourceNotFoundException
└── frontend/                        # React + Vite app
    └── src/
        ├── context/         # AuthContext (global auth state)
        ├── services/        # api.js (axios instance + endpoints)
        ├── pages/           # LoginPage, RegisterPage, DashboardPage, AiPage
        └── components/      # Layout, TaskCard, TaskModal
```

---

## API Endpoints

### Auth
| Method | Endpoint           | Description       | Auth required |
|--------|--------------------|-------------------|---------------|
| POST   | /api/auth/register | Register new user | No            |
| POST   | /api/auth/login    | Login, get JWT    | No            |

### Tasks
| Method | Endpoint          | Description               | Auth required |
|--------|-------------------|---------------------------|---------------|
| GET    | /api/tasks        | Get all tasks (+ ?status) | Yes           |
| GET    | /api/tasks/{id}   | Get task by ID            | Yes           |
| POST   | /api/tasks        | Create task               | Yes           |
| PUT    | /api/tasks/{id}   | Update task               | Yes           |
| DELETE | /api/tasks/{id}   | Delete task               | Yes           |

### AI
| Method | Endpoint                    | Description                        | Auth required |
|--------|-----------------------------|------------------------------------|---------------|
| GET    | /api/ai/suggestions         | Smart suggestions for all tasks    | Yes           |
| POST   | /api/ai/generate-description| Generate description from title    | Yes           |

---

## Setup Instructions

### Prerequisites
- Java 21
- Maven 3.8+
- MySQL 8
- Node.js 18+

### 1. Database

```sql
CREATE DATABASE taskportal;
```

### 2. Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
gemini.api.key=YOUR_GEMINI_API_KEY   # Optional — fallback works without it
```

```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## AI Integration Explanation

**Feature implemented: Option A + Option C (combined)**

- **Description Generator (Option A):** When creating a task, click "Auto-fill with AI". The frontend sends the task title to `POST /api/ai/generate-description`, which calls Gemini to produce a description, suggested priority, and estimated effort.

- **Smart Suggestions (Option C):** The AI page calls `GET /api/ai/suggestions`. The backend collects all the user's tasks, builds a structured prompt, and asks Gemini to return JSON with:
  - **Priority suggestions** — tasks that should be reprioritised
  - **Duplicate detection** — tasks with similar titles
  - **Due date risks** — overdue or urgently due tasks

**Graceful fallback:** If the Gemini API key is not configured or the call fails, the system falls back to a rule-based engine that performs the same three checks using local logic (due-date arithmetic, word-overlap similarity scoring). The frontend shows a notice when fallback mode is active.

---

## Database Schema

```sql
CREATE TABLE users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- BCrypt hashed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    priority    ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
    status      ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
    due_date    DATE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id     BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Hibernate `ddl-auto=update` will create these tables automatically on first run.

---

## Deployment

| Part     | Suggested platform |
|----------|--------------------|
| Frontend | Vercel / Netlify   |
| Backend  | Render / Railway   |
| Database | PlanetScale / Neon |

Set environment variables in your deployment platform instead of hard-coding in `application.properties`.
