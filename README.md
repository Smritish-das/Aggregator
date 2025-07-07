# News Aggregator Backend

A robust backend service for a news aggregation platform that allows users to personalize their news feed based on their interests and categories.

## Features

- User authentication and authorization
- Personalized news feed based on user categories
- Category-based article filtering
- Token-based authentication with JWT
- Secure password handling with bcrypt
- Token blacklisting for secure logout

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

## Running the Project

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### User Authentication

#### Register User
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "string (min 3 characters)",
    "email": "valid email address",
    "password": "string (min 6 characters)",
    "categories": ["array of categories"]
  }
  ```
- **Valid Categories**: `Technology`, `Business`, `Entertainment`, `Environment`, `Finance`, `Smart Home`, `Social Media`, `Retail`
- **Response**: Returns user object and authentication token

#### Login User
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "registered email",
    "password": "string"
  }
  ```
- **Response**: Returns user object and authentication token

#### Logout User
- **URL**: `/logout`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Success message

### User Profile

#### Get Profile
- **URL**: `/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Returns user profile information

#### Update Profile
- **URL**: `/update`
- **Method**: `PUT`
- **Authentication**: Required
- **Body** (all fields optional):
  ```json
  {
    "name": "string (min 3 characters)",
    "oldPassword": "current password",
    "newPassword": "new password (min 6 characters)",
    "categories": ["array of categories"]
  }
  ```
- **Response**: Returns updated user object

### News Feed

#### Get Personalized News
- **URL**: `/news`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Returns articles matching user's categories

## Data Models

### User Model
```javascript
{
  name: String (required, min 3 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed),
  categories: [String] (required, enum of valid categories)
}
```

### Article Model
```javascript
{
  heading: String (required, min 3 chars),
  picture: String (optional, valid URL),
  author: String (required, min 3 chars),
  website_url: String (required, unique, valid URL),
  description: String (optional, min 10 chars),
  categories: [String] (required, enum of valid categories)
}
```

## Project Structure

```
├── controllers/        # Request handlers
├── db/                # Database configuration
├── middleware/        # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── app.js             # Express app setup
└── server.js          # Server entry point
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in:
- Cookie: `token`
- OR Authorization header: `Bearer <token>`

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Server error

## License

MIT License