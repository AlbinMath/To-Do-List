# Todo List Application

A full-featured Todo List web application built with Node.js, Express, MongoDB, and Passport.js for authentication.

## Features

- User authentication (login/register)
- Create, read, update, and delete todo items
- Mark todos as complete/incomplete
- Delete all todos at once
- Secure password hashing
- Session management
- MongoDB database integration

## Prerequisites

- Node.js (v12 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd todolist
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

## Running the Application

1. Start MongoDB service on your machine
2. Run the application:

```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Dependencies

- express: Web framework
- mongoose: MongoDB object modeling
- passport: Authentication middleware
- bcryptjs: Password hashing
- express-session: Session management
- connect-mongo: MongoDB session store
- ejs: Template engine
- body-parser: Request body parsing
- dotenv: Environment variable management

## Project Structure

- `app.js`: Main application file
- `public/`: Static files (CSS, client-side JavaScript)
- `views/`: EJS templates
  - `index.ejs`: Main todo list view
  - `login.ejs`: Login page
  - `register.ejs`: Registration page
  - `edit.ejs`: Todo edit page

## API Routes

- `GET /`: Main todo list page (requires authentication)
- `GET /login`: Login page
- `POST /login`: Login authentication
- `GET /register`: Registration page
- `POST /register`: User registration
- `GET /logout`: User logout
- `POST /newtodo`: Create new todo
- `GET /delete/:id`: Delete specific todo
- `POST /toggle/:id`: Toggle todo completion status
- `POST /delAlltodo`: Delete all todos
- `GET /edit/:id`: Edit todo page
- `POST /update/:id`: Update todo

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- MongoDB session store
- Protected routes using Passport.js
- Environment variable configuration

## License

MIT License
