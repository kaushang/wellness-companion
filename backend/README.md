# Wellness Companion - Backend

Express.js backend API for the Personal Wellness Companion.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/wellness-companion
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

## API Base URL

The API runs on `http://localhost:5000` by default.

All API endpoints are prefixed with `/api`.

