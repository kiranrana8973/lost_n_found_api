# Lost & Found API Endpoints Documentation

Base URL: `http://localhost:3000/api/v1` (or your configured PORT)

---

## 📚 Table of Contents
1. [Batch Endpoints](#batch-endpoints)
2. [Student Endpoints](#student-endpoints)
3. [Item Endpoints](#item-endpoints)
4. [Comment Endpoints](#comment-endpoints)

---

## 🎓 Batch Endpoints

### Create a Batch
- **Endpoint:** `POST /api/v1/batches`
- **Description:** Create a new batch
- **Body:**
```json
{
  "batchName": "2024-CS-A",
  "year": 2024,
  "department": "Computer Science"
}
```

### Get All Batches
- **Endpoint:** `GET /api/v1/batches`
- **Description:** Retrieve all batches

### Get Batch by ID
- **Endpoint:** `GET /api/v1/batches/:id`
- **Description:** Retrieve a specific batch by ID
- **Parameters:** `id` - Batch ID

### Update Batch
- **Endpoint:** `PUT /api/v1/batches/:id`
- **Description:** Update batch details
- **Parameters:** `id` - Batch ID
- **Body:**
```json
{
  "batchName": "2024-CS-A-Updated",
  "year": 2024
}
```

---

## 👨‍🎓 Student Endpoints

### Register/Create Student
- **Endpoint:** `POST /api/v1/students`
- **Description:** Register a new student
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
- **Notes:**
  - Password must be at least 6 characters
  - Email and username must be unique
  - Password is automatically hashed with bcrypt
  - profilePicture is optional (defaults to "default-profile.png")

### Student Login
- **Endpoint:** `POST /api/v1/students/login`
- **Description:** Student authentication/login using email and password
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** Returns JWT token in cookie and response body
```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

### Get All Students
- **Endpoint:** `GET /api/v1/students`
- **Description:** Retrieve all students

### Get Student by ID
- **Endpoint:** `GET /api/v1/students/:id`
- **Description:** Retrieve a specific student by ID
- **Parameters:** `id` - Student ID

### Update Student
- **Endpoint:** `PUT /api/v1/students/:id`
- **Description:** Update student details
- **Parameters:** `id` - Student ID
- **Body:** (All fields are optional)
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "newpassword123",
  "batchId": "new_batch_id_here",
  "phoneNumber": "+9876543210",
  "profilePicture": "new-profile.jpg"
}
```
- **Notes:**
  - Only include fields you want to update
  - Password will be automatically hashed if provided

### Delete Student
- **Endpoint:** `DELETE /api/v1/students/:id`
- **Description:** Delete a student
- **Parameters:** `id` - Student ID

### Upload Profile Picture
- **Endpoint:** `POST /api/v1/students/upload`
- **Description:** Upload student profile picture
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `profilePicture` - Image file (jpg, jpeg, png)

---

## 📦 Item Endpoints

### Create Item
- **Endpoint:** `POST /api/v1/items`
- **Description:** Create a new lost/found item
- **Body:**
```json
{
  "itemName": "Blue Backpack",
  "description": "Blue backpack with laptop compartment",
  "type": "lost",
  "category": "Bag",
  "foundLocation": "Library, 2nd Floor",
  "foundDate": "2024-01-15",
  "foundBy": "student_id_here",
  "itemPhoto": "photo_url_here",
  "itemVideo": "video_url_here"
}
```

### Get All Items
- **Endpoint:** `GET /api/v1/items`
- **Description:** Retrieve all items (lost & found)

### Get Item by ID
- **Endpoint:** `GET /api/v1/items/:id`
- **Description:** Retrieve a specific item by ID
- **Parameters:** `id` - Item ID

### Update Item
- **Endpoint:** `PUT /api/v1/items/:id`
- **Description:** Update item details
- **Parameters:** `id` - Item ID
- **Body:**
```json
{
  "itemName": "Updated Item Name",
  "description": "Updated description",
  "status": "claimed"
}
```

### Delete Item
- **Endpoint:** `DELETE /api/v1/items/:id`
- **Description:** Delete an item
- **Parameters:** `id` - Item ID

### Upload Item Photo
- **Endpoint:** `POST /api/v1/items/upload-photo`
- **Description:** Upload photo of the item
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `itemPhoto` - Image file (jpg, jpeg, png)
- **Response:**
```json
{
  "success": true,
  "photoUrl": "/item_photos/filename.jpg"
}
```

### Upload Item Video
- **Endpoint:** `POST /api/v1/items/upload-video`
- **Description:** Upload video of the item
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `itemVideo` - Video file (mp4, avi, mov)
- **Response:**
```json
{
  "success": true,
  "videoUrl": "/item_videos/filename.mp4"
}
```

---

## 💬 Comment Endpoints

### Create Comment or Reply
- **Endpoint:** `POST /api/v1/comments`
- **Description:** Create a new comment or reply to an existing comment
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
  "text": "Thanks for tagging me @mary! I will check it out.",
  "itemId": "item_id_here",
  "commentedBy": "student_id_here",
  "parentCommentId": "parent_comment_id_here"
}
```
- **Features:**
  - Tag users using `@username` syntax
  - System automatically extracts and links mentioned users

### Get Comments by Item
- **Endpoint:** `GET /api/v1/comments/item/:itemId`
- **Description:** Get all comments for a specific item
- **Parameters:**
  - `itemId` - Item ID
- **Query Parameters:**
  - `includeReplies` - Set to "true" to include all replies (default: false, returns only main comments)
- **Example:**
  - `GET /api/v1/comments/item/123456` - Get main comments only
  - `GET /api/v1/comments/item/123456?includeReplies=true` - Get all comments including replies

### Get Replies for a Comment
- **Endpoint:** `GET /api/v1/comments/:commentId/replies`
- **Description:** Get all replies for a specific comment
- **Parameters:** `commentId` - Comment ID

### Update Comment
- **Endpoint:** `PUT /api/v1/comments/:id`
- **Description:** Update comment text
- **Parameters:** `id` - Comment ID
- **Body:**
```json
{
  "text": "Updated comment text with @username mention"
}
```
- **Note:** Updates `isEdited` flag and `editedAt` timestamp

### Delete Comment
- **Endpoint:** `DELETE /api/v1/comments/:id`
- **Description:** Delete a comment
- **Parameters:** `id` - Comment ID
- **Note:** Deleting a parent comment will also delete all its replies

### Like/Unlike Comment
- **Endpoint:** `POST /api/v1/comments/:id/like`
- **Description:** Toggle like on a comment
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
  "data": { ... }
}
```

### Get Comments by Student
- **Endpoint:** `GET /api/v1/comments/student/:studentId`
- **Description:** Get all comments made by a specific student
- **Parameters:** `studentId` - Student ID

### Get Mentions by Student
- **Endpoint:** `GET /api/v1/comments/mentions/:studentId`
- **Description:** Get all comments where a student was mentioned/tagged
- **Parameters:** `studentId` - Student ID

---

## 📝 Notes

### Authentication
- Currently, most endpoints are public (should be protected in production)
- Some endpoints have `protect` middleware configured but may not be actively enforced
- Login endpoint returns a JWT token in both cookie and response body
- **Login uses email and password** (not username)
- Passwords are automatically hashed with bcrypt (minimum 6 characters)
- JWT token is stored in httpOnly cookie (expires in 30 days by default)

### File Uploads
- Profile pictures are stored in `/public/profile_pictures/`
- Item photos are stored in `/public/item_photos/`
- Item videos are stored in `/public/item_videos/`
- Supported image formats: jpg, jpeg, png
- Supported video formats: mp4, avi, mov

### Comment Features
- **User Mentions:** Use `@username` to tag users (e.g., "@john @mary check this out")
- **Nested Replies:** Comments can have replies by providing `parentCommentId`
- **Like System:** Users can like/unlike comments
- **Edit Tracking:** Edited comments are marked with `isEdited: true` and `editedAt` timestamp
- **Cascade Delete:** Deleting a parent comment removes all its replies

### Response Format
All API responses follow this structure:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Optional message",
  "count": "Optional count for list responses"
}
```

### Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🧪 Testing

A test script is available at `test_comment_system.sh` for testing the comment system endpoints. Update the IDs in the script before running:

```bash
chmod +x test_comment_system.sh
./test_comment_system.sh
```

---

**Last Updated:** 2025-01-09
**API Version:** v1
