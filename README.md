# Personal Wellness Companion

A full-stack web application for tracking nutrition and fitness goals. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS.

## Features

- **User Authentication**: Sign up and login with secure password hashing
- **Nutrition Tracking**: Log meals with calorie tracking and daily summaries
- **Fitness Tracking**: Log workouts with duration/count tracking and weekly summaries
- **Profile Management**: View and update user profile information
- **Clean UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
Wellness Companion/
├── backend/
│   ├── models/          # MongoDB models (User, Nutrition, Fitness)
│   ├── routes/          # API routes (auth, nutrition, fitness, profile)
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (AuthContext)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API utilities
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/wellness-companion
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password

### Nutrition
- `POST /api/nutrition/log` - Log a meal
- `GET /api/nutrition/today` - Get today's meals and total calories
- `GET /api/nutrition/all` - Get all meals

### Fitness
- `POST /api/fitness/log` - Log a workout
- `GET /api/fitness/week` - Get this week's workouts
- `GET /api/fitness/all` - Get all workouts

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Pages

1. **Landing Page** (`/`) - Introduction and login/signup buttons
2. **Signup Page** (`/signup`) - User registration form
3. **Login Page** (`/login`) - User authentication
4. **Home Page** (`/home`) - Main dashboard with chat-style UI and navigation cards
5. **Nutrition Page** (`/nutrition`) - Log meals and view daily calorie summary
6. **Fitness Page** (`/fitness`) - Log workouts and view weekly summary
7. **Profile Page** (`/profile`) - View and update user profile

## Notes

- All routes except `/`, `/signup`, and `/login` require authentication
- Passwords are hashed using bcryptjs before storage
- JWT tokens are stored in localStorage for authentication
- The chat interface on the home page is a placeholder for future AI integration

## Future Enhancements

- AI-powered wellness recommendations
- Interactive chat functionality
- Advanced analytics and charts
- Meal and workout templates
- Social features and sharing

