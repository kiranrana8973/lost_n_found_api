# API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

This doc lists all available endpoints with request/response examples.

## Table of Contents
1. [Authentication](#authentication)
2. [Batch Endpoints](#batch-endpoints)
3. [Student Endpoints](#student-endpoints)
4. [Item Endpoints](#item-endpoints)
5. [Comment Endpoints](#comment-endpoints)
6. [Response Format](#response-format)

## Authentication

Protected endpoints need a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

You get the token when you login (see student login endpoint below).

## Batch Endpoints

Batches are basically student groups or classes (like "2024-CS-A").

### Create a Batch
- **Endpoint:** `POST /batches`
- **Access:** Public
- **Body:**
```json
{
  "batchName": "2024-CS-A",
  "year": 2024,
  "department": "Computer Science"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "batch_id",
    "batchName": "2024-CS-A",
    "year": 2024,
    "department": "Computer Science",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Batches
- **Endpoint:** `GET /batches`
- **Access:** Public
- **Cache:** 30 minutes
- **Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Batch by ID
- **Endpoint:** `GET /batches/:id`
- **Access:** Public
- **Cache:** 30 minutes
- **Parameters:** `id` - Batch ID

### Update Batch
- **Endpoint:** `PUT /batches/:id`
- **Access:** Protected (Requires Authentication)
- **Parameters:** `id` - Batch ID
- **Body:**
```json
{
  "batchName": "2024-CS-A-Updated",
  "year": 2024,
  "department": "Computer Science"
}
```

---

## Student Endpoints

### Register/Create Student
- **Endpoint:** `POST /students`
- **Access:** Public
- **Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "batchId": "batch_id_here",
  "phoneNumber": "+1234567890",
  "profilePicture": "optional-filename.jpg"
}
```
- **Validation:**
  - Password: minimum 6 characters
  - Email: must be unique and valid format
  - Username: must be unique
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "student_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "batchId": "batch_id_here",
    "phoneNumber": "+1234567890",
    "profilePicture": "default-profile.png"
  }
}
```

### Student Login
- **Endpoint:** `POST /students/login`
- **Access:** Public
- **Rate Limit:** 5 attempts per 15 minutes
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Note:** Token is also sent as httpOnly cookie

### Get All Students
- **Endpoint:** `GET /students`
- **Access:** Public
- **Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### Get Student by ID
- **Endpoint:** `GET /students/:id`
- **Access:** Public
- **Parameters:** `id` - Student ID

### Update Student
- **Endpoint:** `PUT /students/:id`
- **Access:** Protected (User can only update their own profile)
- **Parameters:** `id` - Student ID
- **Body:** (All fields optional)
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "newpassword123",
  "batchId": "new_batch_id",
  "phoneNumber": "+9876543210",
  "profilePicture": "new-profile.jpg"
}
```

### Delete Student
- **Endpoint:** `DELETE /students/:id`
- **Access:** Protected (User can only delete their own profile)
- **Parameters:** `id` - Student ID

### Upload Profile Picture
- **Endpoint:** `POST /students/upload`
- **Access:** Public
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `profilePicture` - Image file (jpg, jpeg, png)
- **Max Size:** 10MB
- **Response:**
```json
{
  "success": true,
  "data": "pro-pic-1234567890.jpg"
}
```

---

## Item Endpoints

### Create Item
- **Endpoint:** `POST /items`
- **Access:** Protected (Requires Authentication)
- **Body:**
```json
{
  "itemName": "Blue Backpack",
  "description": "Blue backpack with laptop compartment",
  "type": "lost",
  "mediaUrl": "photo_url_here",
  "reportedBy": "student_id_here"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "item_id",
    "itemName": "Blue Backpack",
    "description": "Blue backpack with laptop compartment",
    "type": "lost",
    "mediaUrl": "photo_url_here",
    "reportedBy": "student_id_here",
    "isClaimed": false,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Items
- **Endpoint:** `GET /items`
- **Access:** Public
- **Cache:** 5 minutes
- **Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [...]
}
```

### Get Item by ID
- **Endpoint:** `GET /items/:id`
- **Access:** Public
- **Cache:** 10 minutes
- **Parameters:** `id` - Item ID

### Update Item
- **Endpoint:** `PUT /items/:id`
- **Access:** Protected (Owner only)
- **Parameters:** `id` - Item ID
- **Body:**
```json
{
  "itemName": "Updated Item Name",
  "description": "Updated description",
  "status": "claimed",
  "claimedBy": "student_id_here",
  "isClaimed": true
}
```

### Delete Item
- **Endpoint:** `DELETE /items/:id`
- **Access:** Protected (Owner only)
- **Parameters:** `id` - Item ID

### Upload Item Photo
- **Endpoint:** `POST /items/upload-photo`
- **Access:** Public
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `itemPhoto` - Image file (jpg, jpeg, png, gif)
- **Max Size:** 10MB
- **Response:**
```json
{
  "success": true,
  "data": "itm-pic-1234567890.jpg",
  "message": "Item photo uploaded successfully"
}
```

### Upload Item Video
- **Endpoint:** `POST /items/upload-video`
- **Access:** Public
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `itemVideo` - Video file (mp4, avi, mov, wmv)
- **Max Size:** 10MB
- **Response:**
```json
{
  "success": true,
  "data": "item-vid-1234567890.mp4",
  "message": "Item video uploaded successfully"
}
```

---

## Comment Endpoints

### Create Comment
- **Endpoint:** `POST /comments`
- **Access:** Protected
- **Body (Main Comment):**
```json
{
  "text": "Has anyone seen this? @john please check!",
  "itemId": "item_id_here",
  "commentedBy": "student_id_here"
}
```
- **Body (Reply to Comment):**
```json
{
  "text": "Thanks for tagging me @mary!",
  "itemId": "item_id_here",
  "commentedBy": "student_id_here",
  "parentCommentId": "parent_comment_id_here"
}
```
- **Features:**
  - Tag users using `@username` syntax
  - System automatically extracts and links mentioned users

### Get Comments by Item
- **Endpoint:** `GET /comments/item/:itemId`
- **Access:** Public
- **Parameters:** `itemId` - Item ID
- **Query Parameters:**
  - `includeReplies` - Set to "true" to include all replies (default: false)
- **Examples:**
  - `GET /comments/item/123456` - Main comments only
  - `GET /comments/item/123456?includeReplies=true` - All comments + replies

### Get Replies for a Comment
- **Endpoint:** `GET /comments/:commentId/replies`
- **Access:** Public
- **Parameters:** `commentId` - Comment ID

### Update Comment
- **Endpoint:** `PUT /comments/:id`
- **Access:** Protected (Owner only)
- **Parameters:** `id` - Comment ID
- **Body:**
```json
{
  "text": "Updated comment text with @username mention"
}
```
- **Note:** Sets `isEdited: true` and updates `editedAt` timestamp

### Delete Comment
- **Endpoint:** `DELETE /comments/:id`
- **Access:** Protected (Owner only)
- **Parameters:** `id` - Comment ID
- **Note:** Deleting a parent comment also deletes all replies

### Like/Unlike Comment
- **Endpoint:** `POST /comments/:id/like`
- **Access:** Protected
- **Parameters:** `id` - Comment ID
- **Body:**
```json
{
  "studentId": "student_id_here"
}
```
- **Response:**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 5,
  "data": {...}
}
```

### Get Comments by Student
- **Endpoint:** `GET /comments/student/:studentId`
- **Access:** Public
- **Parameters:** `studentId` - Student ID

### Get Mentions by Student
- **Endpoint:** `GET /comments/mentions/:studentId`
- **Access:** Public
- **Parameters:** `studentId` - Student ID
- **Description:** Get all comments where a student was @mentioned

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Cached Response
Cached responses include an additional field:
```json
{
  "success": true,
  "cached": true,
  "data": {...}
}
```

---

## Security Features

### Rate Limiting
- **General API:** 100 requests per 15 minutes per IP
- **Login Endpoint:** 5 attempts per 15 minutes per IP

### Authentication
- JWT tokens expire after 30 days
- Tokens stored in httpOnly cookies for security
- Passwords hashed with bcrypt (10 rounds)

### Input Sanitization
- NoSQL injection prevention ($ character removal)
- XSS attack prevention (HTML escaping)
- Email and URL fields preserved

### Authorization
- Users can only modify/delete their own resources
- Protected endpoints return 401 if not authenticated
- Ownership checks return 403 if unauthorized

---

## Common Error Codes

- **400** - Bad Request (validation error, missing fields)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (not authorized to access resource)
- **404** - Not Found (resource doesn't exist)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

---

## Status Codes

- **200** - OK (successful GET, PUT, DELETE)
- **201** - Created (successful POST)
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **429** - Too Many Requests
- **500** - Server Error

---

## Testing Examples

### Using Postman
1. Import the endpoints into Postman
2. Set base URL: `http://localhost:3000/api/v1`
3. For protected endpoints:
   - Login first via `POST /students/login`
   - Copy the token from response
   - Add to Authorization header: `Bearer <token>`

### Using cURL

**Create Student:**
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "batchId": "batch_id",
    "phoneNumber": "+1234567890"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Items (with auth):**
```bash
curl http://localhost:3000/api/v1/items \
  -H "Authorization: Bearer your_token_here"
```

---

## Additional Notes

### File Upload Guidelines
- **Profile Pictures:** Stored in `/public/profile_pictures/`
- **Item Photos:** Stored in `/public/item_photos/`
- **Item Videos:** Stored in `/public/item_videos/`
- **Supported Image Formats:** jpg, jpeg, png, gif
- **Supported Video Formats:** mp4, avi, mov, wmv
- **Max File Size:** 10MB

### Comment Features
- **User Mentions:** Use `@username` to tag users
- **Nested Replies:** Comments can have replies via `parentCommentId`
- **Like System:** Users can like/unlike comments
- **Edit Tracking:** Edited comments show `isEdited: true`
- **Cascade Delete:** Deleting parent deletes all replies

---

**Last Updated:** January 2025
**API Version:** v1
**Documentation Version:** 2.0
