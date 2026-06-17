# DoAble — AI-Powered Task Management

A full-stack task management application built with Spring Boot + React + Google Gemini AI.

---

## Tech Stack Used

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Spring Boot 3.2, Java 21      |
| Security  | Spring Security, JWT          |
| Database  | MySQL 8, Spring Data JPA      |
| AI        | Google Gemini 1.5 Flash API   |
| Frontend  | React 18, Vite, Tailwind CSS  |
| Build     | Maven (Backend), NPM (Frontend)|

---

## Architecture Overview

### Backend Architecture (Layered)
```
backend/
└── src/main/java/com/taskportal/backend/
    ├── controller/      # REST API endpoints (Auth, Tasks, AI)
    ├── service/         # Business logic (Auth, Task, AI services)
    ├── repository/      # Database access (JPA repositories)
    ├── model/           # JPA entities (User, Task)
    ├── dto/             # Request/Response objects
    ├── security/        # JWT authentication filter
    ├── config/          # Spring Security & CORS configuration
    ├── util/            # JWT utility functions
    └── exception/       # Global exception handler
```

### Frontend Architecture
```
frontend/
└── src/
    ├── context/         # AuthContext for global auth state
    ├── services/        # API service with axios
    ├── pages/           # LoginPage, RegisterPage, DashboardPage, AiPage
    ├── components/      # Reusable UI components (TaskCard, TaskModal, etc)
    ├── utils/           # Helper functions
    └── App.jsx          # Main app component with routing
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login and get JWT token
```

### Tasks Management
```
GET    /api/tasks              - Get all user tasks
GET    /api/tasks/{id}         - Get task by ID
POST   /api/tasks              - Create new task
PUT    /api/tasks/{id}         - Update task
DELETE /api/tasks/{id}         - Delete task
```

### AI Features
```
POST   /api/ai/generate-description   - Generate description from task title
GET    /api/ai/suggestions             - Get AI suggestions for all tasks
```

---

## Setup Instructions

### Prerequisites
- Java 21
- Maven 3.8+
- MySQL 8
- Node.js 18+
- Google Gemini API Key (optional)

### Step 1: Clone Repository
```bash
git clone https://github.com/Somesh-k-specs/taskportal.git
cd taskportal
```

### Step 2: Database Setup
```bash
# Create MySQL database
mysql -u root -p
> CREATE DATABASE taskportal;
> EXIT;
```

### Step 3: Backend Setup
```bash
cd backend

# Edit application.properties
# Update: spring.datasource.password=YOUR_PASSWORD
# Update: gemini.api.key=YOUR_GEMINI_API_KEY (optional)

# Run backend
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

### Step 4: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Run frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 5: Access Application
- Open browser: `http://localhost:5173`
- Register new account
- Start creating tasks

---

## AI Integration Explanation

### Feature Implemented: Option A + Option C

#### Option A - AI Task Description Generator
When creating a task:
1. User enters task title (e.g., "Prepare client presentation")
2. User clicks "Auto-fill with AI" button
3. Frontend calls `POST /api/ai/generate-description`
4. Backend sends title to Google Gemini API
5. Gemini returns:
   - Detailed description
   - Suggested priority (LOW, MEDIUM, HIGH)
   - Estimated completion time (e.g., "4 hours")
6. Frontend displays results for user approval
7. User can edit and save

#### Option C - AI Smart Suggestions
On AI Suggestions page:
1. User clicks "Get AI Suggestions"
2. Frontend calls `GET /api/ai/suggestions`
3. Backend collects all user's tasks
4. Sends structured prompt to Google Gemini API
5. Gemini analyzes and returns JSON with:
   - **Priority Suggestions**: Tasks that need priority adjustment
   - **Duplicate Detection**: Tasks with similar titles/descriptions
   - **Due Date Risk Alerts**: Overdue or urgently due tasks
6. Frontend displays suggestions in organized format

### Graceful Fallback
- If Gemini API key is not configured → System uses rule-based fallback
- If API call fails → Falls back to local logic (date calculations, text similarity)
- User sees notification: "Using local suggestions (AI unavailable)"
- All features continue to work without AI

### API Integration Details
- **Provider**: Google Gemini 1.5 Flash
- **API Key**: Stored in environment variables (application.properties)
- **Error Handling**: Try-catch with fallback mechanism
- **Response Format**: JSON parsing with validation
- **Timeout**: 30 seconds per request

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- BCrypt hashed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
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

**Note**: Hibernate auto-creates tables using `spring.jpa.hibernate.ddl-auto=update`

---

## Screenshots

### 1. Login Page
- Email and password input fields
- Register link
- Submit button
- Error message display for invalid credentials

### 2. Dashboard - Task List
- List of all user tasks
- Task cards showing: title, priority, status, due date
- Edit button for each task
- Delete button for each task
- "Create New Task" button
- Filter by status option (TODO, IN_PROGRESS, DONE)

### 3. Create Task Page
- Title input field
- Description text area
- Priority dropdown (LOW, MEDIUM, HIGH)
- Due date picker
- "Auto-fill with AI" button
- Save button

### 4. AI Generated Task Details
- Title (user input)
- Auto-generated description
- Auto-suggested priority
- Estimated time
- Edit option before saving
- Save button

### 5. AI Suggestions Page
- Smart Priority Suggestions section
- Duplicate Task Warnings section
- Due Date Risk Alerts section
- Each suggestion with task details
- Clear/Dismiss options

### 6. Task Update Page
- Edit task title, description, priority, due date
- Update status dropdown (TODO → IN_PROGRESS → DONE)
- Save button
- Delete button

---

## Repository Structure

```
taskportal/
├── backend/
│   ├── src/main/java/com/taskportal/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   ├── security/
│   │   ├── config/
│   │   ├── util/
│   │   ├── exception/
│   │   └── TaskportalApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── services/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## GitHub Repository

**Link**: https://github.com/Somesh-k-specs/taskportal

All source code, configurations, and documentation available on GitHub.