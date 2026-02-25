# Lost & Found API (Go)

A Lost and Found REST API built with **Go**, Chi router, and MongoDB for mobile and web applications.

**This project is solely for college project purposes only.**

---

## Tech Stack

- **Go 1.22+**
- Chi v5 (HTTP Router)
- MongoDB (Official Go Driver v2)
- JWT (golang-jwt)
- Bcrypt (golang.org/x/crypto)
- CORS (rs/cors)
- Rate Limiting (go-chi/httprate)

---

## Project Structure

```
lost_n_found_api/
├── main.go                # Entry point with graceful shutdown
├── config/
│   ├── config.go          # Environment config loader
│   └── config.env         # Environment variables
├── database/
│   └── mongodb.go         # MongoDB connection + index setup
├── model/                 # Data models
│   ├── student.go
│   ├── batch.go
│   ├── category.go
│   ├── item.go
│   ├── comment.go
│   └── refresh_token.go
├── repository/            # Database access layer (interfaces + MongoDB)
│   ├── student_repo.go
│   ├── batch_repo.go
│   ├── category_repo.go
│   ├── item_repo.go
│   ├── comment_repo.go
│   └── refresh_token_repo.go
├── service/               # Business logic
│   ├── auth_service.go
│   ├── student_service.go
│   ├── batch_service.go
│   ├── category_service.go
│   ├── item_service.go
│   └── comment_service.go
├── handler/               # HTTP handlers
│   ├── response.go
│   ├── student_handler.go
│   ├── auth_handler.go
│   ├── batch_handler.go
│   ├── category_handler.go
│   ├── item_handler.go
│   ├── comment_handler.go
│   └── upload_handler.go
├── middleware/             # HTTP middleware
│   ├── auth.go
│   ├── logging.go
│   ├── sanitize.go
│   ├── recovery.go
│   └── security.go
├── upload/
│   └── upload.go          # File upload handling
├── apperror/
│   └── errors.go          # Custom error types
├── router/
│   └── router.go          # Chi router with all routes
├── public/                # Static file serving
│   ├── profile_pictures/
│   ├── item_photos/
│   └── item_videos/
├── go.mod
├── go.sum
└── Makefile
```

---

## Quick Start

### Prerequisites

- Go 1.22+
- MongoDB running on `localhost:27017`

### Run

```bash
# Start development server
make dev

# Or manually
go run .
```

### Build

```bash
# Build binary
make build

# Run binary
make run

# Clean build artifacts
make clean
```

### Environment Configuration

Edit `config/config.env`:

```env
ENV=development
PORT=3000
DATABASE_URI=mongodb://127.0.0.1:27017/lost_n_found
FILE_UPLOAD_PATH=./public/
MAX_FILE_UPLOAD=10000000
JWT_SECRET=your_secret_key
JWT_EXPIRE=15m
JWT_COOKIE_EXPIRE=1
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## Database Design (MongoDB)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Batch       │       │     Student     │       │    Category     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ _id             │◄──────│ batchId (ref)   │       │ _id             │
│ batchName       │       │ _id             │       │ name            │
│ status          │       │ name            │       │ description     │
│ createdAt       │       │ email           │       │ status          │
└─────────────────┘       │ username        │       │ createdAt       │
                          │ password        │       └─────────────────┘
                          │ phoneNumber     │               │
                          │ profilePicture  │               │
                          │ createdAt       │               ▼
                          └─────────────────┘       ┌─────────────────┐
                                  ▲                 │      Item       │
                                  │                 ├─────────────────┤
                                  │                 │ _id             │
                                  ├─────────────────│ reportedBy (ref)│
                                  │                 │ claimedBy (ref) │
                                  │                 │ category (ref)  │
                                  │                 │ itemName        │
                                  │                 │ description     │
                                  │                 │ type (lost/found│
                                  │                 │ location        │
                                  │                 │ media           │
                                  │                 │ mediaType       │
                                  │                 │ isClaimed       │
                                  │                 │ status          │
                                  │                 │ createdAt       │
                                  │                 │ updatedAt       │
                                  │                 └─────────────────┘
                                  │                         ▲
                          ┌───────┴─────────┐               │
                          │     Comment     │               │
                          ├─────────────────┤               │
                          │ _id             │               │
                          │ text            │               │
                          │ item (ref)      │───────────────┘
                          │ commentedBy(ref)│
                          │ mentionedUsers[]│
                          │ parentComment   │──┐ (self-ref for replies)
                          │ isReply         │◄─┘
                          │ likes[]         │
                          │ isEdited        │
                          │ createdAt       │
                          │ updatedAt       │
                          └─────────────────┘
```

### Collections

#### Batch

| Field       | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `_id`       | ObjectId | Primary key                    |
| `batchName` | String   | Batch name (e.g., "35-A")      |
| `status`    | String   | active / completed / cancelled |
| `createdAt` | Date     | Creation timestamp             |

#### Student

| Field            | Type     | Description              |
| ---------------- | -------- | ------------------------ |
| `_id`            | ObjectId | Primary key              |
| `name`           | String   | Student full name        |
| `email`          | String   | Unique email address     |
| `username`       | String   | Unique username          |
| `password`       | String   | Hashed password (bcrypt) |
| `phoneNumber`    | String   | Contact number           |
| `batchId`        | ObjectId | Reference to Batch       |
| `profilePicture` | String   | Profile image filename   |
| `createdAt`      | Date     | Registration timestamp   |

#### Category

| Field         | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `_id`         | ObjectId | Primary key            |
| `name`        | String   | Category name (unique) |
| `description` | String   | Category description   |
| `status`      | String   | active / inactive      |
| `createdAt`   | Date     | Creation timestamp     |

#### Item

| Field         | Type     | Description                     |
| ------------- | -------- | ------------------------------- |
| `_id`         | ObjectId | Primary key                     |
| `itemName`    | String   | Name of lost/found item         |
| `description` | String   | Item description                |
| `type`        | String   | lost / found                    |
| `category`    | ObjectId | Reference to Category           |
| `location`    | String   | Where item was lost/found       |
| `media`       | String   | Photo/video filename            |
| `mediaType`   | String   | photo / video                   |
| `reportedBy`  | ObjectId | Reference to Student            |
| `claimedBy`   | ObjectId | Reference to Student (nullable) |
| `isClaimed`   | Boolean  | Claim status                    |
| `status`      | String   | available / claimed / resolved  |
| `createdAt`   | Date     | Creation timestamp              |
| `updatedAt`   | Date     | Last update timestamp           |

#### Comment

| Field            | Type       | Description                               |
| ---------------- | ---------- | ----------------------------------------- |
| `_id`            | ObjectId   | Primary key                               |
| `text`           | String     | Comment content                           |
| `item`           | ObjectId   | Reference to Item                         |
| `commentedBy`    | ObjectId   | Reference to Student                      |
| `mentionedUsers` | ObjectId[] | Tagged users (@username)                  |
| `parentComment`  | ObjectId   | Reference to parent Comment (for replies) |
| `isReply`        | Boolean    | Is this a reply?                          |
| `likes`          | ObjectId[] | Students who liked                        |
| `isEdited`       | Boolean    | Was comment edited?                       |
| `createdAt`      | Date       | Creation timestamp                        |
| `updatedAt`      | Date       | Last update timestamp                     |

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

### Authentication

Protected routes require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Batch Endpoints

| Method | Endpoint       | Description      | Auth |
| ------ | -------------- | ---------------- | ---- |
| POST   | `/batches`     | Create batch     | Yes  |
| GET    | `/batches`     | Get all batches  | No   |
| GET    | `/batches/:id` | Get single batch | No   |
| PUT    | `/batches/:id` | Update batch     | Yes  |

**Create Batch:**

```http
POST /api/v1/batches
Content-Type: application/json
Authorization: Bearer <token>

{
  "batchName": "35-A",
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "batchName": "35-A",
    "status": "active",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### Category Endpoints

| Method | Endpoint          | Description         | Auth |
| ------ | ----------------- | ------------------- | ---- |
| POST   | `/categories`     | Create category     | Yes  |
| GET    | `/categories`     | Get all categories  | No   |
| GET    | `/categories/:id` | Get single category | No   |
| PUT    | `/categories/:id` | Update category     | Yes  |
| DELETE | `/categories/:id` | Delete category     | Yes  |

**Create Category:**

```http
POST /api/v1/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Electronics",
  "description": "Phones, laptops, chargers, earbuds, etc.",
  "status": "active"
}
```

---

### Student Endpoints

| Method | Endpoint           | Description            | Auth |
| ------ | ------------------ | ---------------------- | ---- |
| POST   | `/students`        | Register               | No   |
| POST   | `/students/login`  | Login                  | No   |
| POST   | `/students/logout` | Logout                 | No   |
| GET    | `/students`        | Get all students       | Yes  |
| GET    | `/students/:id`    | Get single student     | No   |
| PUT    | `/students/:id`    | Update profile         | Yes  |
| DELETE | `/students/:id`    | Delete account         | Yes  |
| POST   | `/students/upload` | Upload profile picture | No   |

**Register:**

```http
POST /api/v1/students
Content-Type: application/json

{
  "name": "Kiran Rana",
  "username": "kiranr",
  "email": "kiran@softwarica.edu.np",
  "password": "password123",
  "batchId": "64abc123...",
  "phoneNumber": "+977-9801234500"
}
```

**Login:**

```http
POST /api/v1/students/login
Content-Type: application/json

{
  "email": "kiran@softwarica.edu.np",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "data": {
      "_id": "64abc123...",
      "name": "Kiran Rana",
      "email": "kiran@softwarica.edu.np",
      "username": "kiranr"
    }
  }
}
```

### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

---

### Item Endpoints

| Method | Endpoint              | Description     | Auth |
| ------ | --------------------- | --------------- | ---- |
| POST   | `/items`              | Create item     | Yes  |
| GET    | `/items`              | Get all items   | No   |
| GET    | `/items/:id`          | Get single item | No   |
| PUT    | `/items/:id`          | Update item     | Yes  |
| DELETE | `/items/:id`          | Delete item     | Yes  |
| POST   | `/items/upload-photo` | Upload photo    | Yes  |
| POST   | `/items/upload-video` | Upload video    | Yes  |

**Create Item:**

```http
POST /api/v1/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "itemName": "Black Backpack",
  "description": "Lost near library, has keychain attached",
  "type": "lost",
  "category": "64abc456...",
  "location": "Library, Ground Floor",
  "media": "photo.jpg"
}
```

**Get Items with Pagination & Filters:**

```http
GET /api/v1/items?page=1&limit=10&type=lost&status=available&category=64abc456...
```

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

---

### Comment Endpoints

| Method | Endpoint                        | Description             | Auth |
| ------ | ------------------------------- | ----------------------- | ---- |
| POST   | `/comments`                     | Create comment          | Yes  |
| GET    | `/comments/item/:itemId`        | Get comments by item    | No   |
| GET    | `/comments/:id/replies`         | Get replies             | No   |
| PUT    | `/comments/:id`                 | Update comment          | Yes  |
| DELETE | `/comments/:id`                 | Delete comment          | Yes  |
| POST   | `/comments/:id/like`            | Like/unlike comment     | Yes  |
| GET    | `/comments/student/:studentId`  | Get comments by student | No   |
| GET    | `/comments/mentions/:studentId` | Get mentions            | No   |

**Create Comment:**

```http
POST /api/v1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "I think I saw this near the cafeteria @john",
  "itemId": "64abc123...",
  "commentedBy": "64abc456..."
}
```

**Create Reply:**

```http
POST /api/v1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Thanks for the info!",
  "itemId": "64abc123...",
  "commentedBy": "64abc456...",
  "parentCommentId": "64abc789..."
}
```

---

## Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Security Features

- Password hashing with bcrypt (cost factor 10)
- JWT access tokens (15min expiry) + refresh token rotation (7 days)
- Rate limiting (100 requests/15min general, 5 login attempts/15min)
- XSS prevention (HTML escaping)
- NoSQL injection prevention ($ removal)
- CORS configuration with allowed origins
- Security headers (equivalent to Helmet)
- HTTP-only cookies for tokens
- Graceful server shutdown

---

**Author:** Kiran Rana

**License:** ISC
