# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# Task Board Application

A full-stack task management application built with React, Node.js, Express, and MySQL. This application provides a Kanban-style board for teams to track work across different stages with real-time status indicators.

## 🚀 Features

- **Kanban Board**: Drag-and-drop tasks between columns (Backlog, In Progress, Review, Done)
- **Task Management**: Create, edit, delete tasks with title, description, priority, assignee, and due date
- **Real-time Status Badges**: 
  - 🟢 On Track (due date > 24h away)
  - 🟡 At Risk (due date ≤ 24h away) 
  - 🔴 Overdue (past due date and not Done)
- **Comments System**: Add comments to tasks for team communication
- **Filtering**: Filter tasks by assignee and priority
- **User Management**: Secure authentication with JWT
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **CSS3** - Styling with custom CSS
- **Axios** - HTTP client for API calls
- **date-fns** - Date manipulation and formatting

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Database
- **MySQL** - Relational database

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git

## 🏗 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd task-board
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE task_board;
USE task_board;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    assignee_id INT,
    status ENUM('Backlog', 'In Progress', 'Review', 'Done') DEFAULT 'Backlog',
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create comments table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    author_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=task_board
JWT_SECRET=your_jwt_secret_key

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

## 🚀 Running the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Application**:
   ```bash
   cd frontend  
   npm start
   ```
   Application runs on http://localhost:3000

3. **Access the Application**:
   Open http://localhost:3000 in your browser

## 📱 Usage

### User Registration/Login
1. Visit http://localhost:3000
2. Click "Create Account" to register or sign in with existing credentials
3. Fill in required information and submit

### Task Management
1. **Create Task**: Click "New Task" button in header
2. **Edit Task**: Click edit icon on task card
3. **Move Task**: Drag and drop between columns
4. **View Details**: Click on task card to open modal
5. **Add Comments**: Open task details and use comment form

### Filtering
1. Use sidebar filters to filter by assignee or priority
2. Click "My Tasks" for quick filter
3. Use "Clear All" to reset filters

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments  
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me/tasks` - Get current user's tasks

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create task with all fields  
- [ ] Move task between columns
- [ ] Add comments to task
- [ ] Filter by assignee and priority
- [ ] Badge status updates correctly
- [ ] Page refresh maintains data
- [ ] Responsive design works

### API Testing with Thunder Client/Postman
Test all endpoints with sample data:

**Register User:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Create Task:**
```json
POST /api/tasks
{
  "title": "Sample Task",
  "description": "Task description",
  "priority": "High",
  "due_date": "2024-12-31T23:59:00"
}
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Create account on Railway/Render
2. Connect GitHub repository
3. Set environment variables:
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
4. Deploy and note the backend URL

### Frontend Deployment (Vercel/Netlify)
1. Create account on Vercel/Netlify
2. Connect GitHub repository  
3. Set build command: `npm run build`
4. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend-domain.com/api`
5. Deploy and note the frontend URL

### Database Deployment
- Use PlanetScale, AWS RDS, or similar managed MySQL service
- Update connection credentials in backend environment variables

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | User ID |
| email | VARCHAR(255) | User email (unique) |
| password_hash | VARCHAR(255) | Hashed password |
| name | VARCHAR(255) | User full name |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### Tasks Table  
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Task ID |
| title | VARCHAR(255) | Task title |
| description | TEXT | Task description |
| priority | ENUM | Low/Medium/High |
| assignee_id | INT (FK) | Assigned user ID |
| status | ENUM | Backlog/In Progress/Review/Done |
| due_date | DATETIME | Task due date |
| created_at | TIMESTAMP | Task creation time |
| updated_at | TIMESTAMP | Last update time |

### Comments Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Comment ID |
| task_id | INT (FK) | Associated task ID |
| author_id | INT (FK) | Comment author ID |
| body | TEXT | Comment content |
| created_at | TIMESTAMP | Comment creation time |

## 🔍 Architecture Overview

```
Frontend (React)          Backend (Express)         Database (MySQL)
┌─────────────────┐       ┌──────────────────┐      ┌─────────────────┐
│  Components     │──────▶│  API Routes      │─────▶│  Tables         │
│  - Dashboard    │       │  - Auth          │      │  - users        │
│  - TaskBoard    │       │  - Tasks         │      │  - tasks        │  
│  - TaskCard     │       │  - Comments      │      │  - comments     │
│  - TaskForm     │       │  - Users         │      └─────────────────┘
│  - Filters      │       │                  │               │
│                 │       │  Middleware      │               │
│  Context API    │       │  - Auth          │               │
│  - Auth         │       │  - Validation    │               │
│  - Task         │       │  - Error         │               │
│                 │       │                  │               │
│  Services       │       │  Database        │               │
│  - API calls    │       │  - Connection    │◀──────────────┘
└─────────────────┘       │  - Queries       │
         │                └──────────────────┘
         │                         │
         └─────────HTTP/JSON───────┘
```

## ⚡ Performance Optimizations

### Frontend
- React.memo for TaskCard components to prevent unnecessary re-renders
- Efficient state management with Context API
- Lazy loading for large task lists
- Optimized API calls with proper error handling

### Backend  
- Database connection pooling
- Input validation and sanitization
- Efficient SQL queries with proper indexing
- JWT token-based authentication
- Error handling middleware

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication  
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Environment variable protection

## 🎯 Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] File attachments for tasks
- [ ] Team/project organization
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with third-party tools (Slack, GitHub)
- [ ] Advanced filtering and search
- [ ] Task templates and automation

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running
- Check database credentials in .env
- Ensure database and tables exist

**CORS Error**
- Update CORS_ORIGIN in backend .env
- Verify frontend URL is correct

**JWT Token Issues**
- Check JWT_SECRET is set
- Clear localStorage and re-login
- Verify token format in API calls

**Port Already in Use**
- Change PORT in backend .env
- Kill processes using the port: `npx kill-port 5000`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React team for the excellent framework
- Express.js community for the robust backend framework
- MySQL team for the reliable database system
- All contributors and testers

---

## 📸 Screenshots

### Dashboard View
![Dashboard](docs/images/dashboard.png)

### Task Creation
![Task Form](docs/images/task-form.png)

### Task Details
![Task Modal](docs/images/task-modal.png)

### Mobile Responsive
![Mobile View](docs/images/mobile.png)

---

For support or questions, please open an issue in the GitHub repository.

