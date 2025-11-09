# Lost & Found API - Database Design

## Database: MongoDB (NoSQL)
**Connection:** Configured via `config/config.env`

---

## 📊 Collections Overview

The database consists of 4 main collections:
1. **Batch** - Student batch/class information
2. **Student** - User accounts and profiles
3. **Item** - Lost and found items
4. **Comment** - Comments and replies on items

---

## 🗂️ Collection Schemas

### 1. Batch Collection

**Collection Name:** `batches`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto-generated | Unique identifier |
| batchName | String | Yes | - | Name of the batch (e.g., "2024-CS-A") |
| status | String (enum) | No | "active" | Batch status: "active", "completed", "cancelled" |
| createdAt | Date | No | Date.now | Timestamp of batch creation |

**Indexes:**
- Primary: `_id`

**Example Document:**
```json
{
  "_id": "65a1234567890abcdef12345",
  "batchName": "2024-CS-A",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Student Collection

**Collection Name:** `students`

| Field | Type | Required | Default | Unique | Description |
|-------|------|----------|---------|--------|-------------|
| _id | ObjectId | Auto | Auto-generated | Yes | Unique identifier |
| name | String | Yes | - | No | Full name of the student |
| phone | String | Yes | - | No | Contact phone number |
| batch | ObjectId | Yes | - | No | Reference to Batch collection |
| username | String | Yes | - | Yes | Unique username for login |
| password | String | Yes | - | No | Hashed password (should be hashed) |
| profilePicture | String | No | "default-profile.png" | No | URL/path to profile picture |

**Relationships:**
- `batch` → References `Batch._id` (Many-to-One)

**Indexes:**
- Primary: `_id`
- Unique: `username`

**Example Document:**
```json
{
  "_id": "65a1234567890abcdef67890",
  "name": "John Doe",
  "phone": "+1234567890",
  "batch": "65a1234567890abcdef12345",
  "username": "john",
  "password": "$2a$10$hashed_password_here",
  "profilePicture": "/profile_pictures/pro-pic-1234567890.jpg"
}
```

**Security Notes:**
- ⚠️ Password should be hashed using bcrypt before storage
- Consider adding email field for password recovery
- JWT tokens are used for authentication

---

### 3. Item Collection

**Collection Name:** `items`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto-generated | Unique identifier |
| itemName | String | Yes | - | Name/title of the item |
| description | String | Yes | - | Detailed description of the item |
| type | String (enum) | Yes | - | Item type: "lost" or "found" |
| mediaUrl | String | Yes | - | URL/path to photo or video |
| mediaType | String (enum) | No | "photo" | Media type: "photo" or "video" |
| claimedBy | ObjectId | No | null | Student who claimed the item |
| isClaimed | Boolean | No | false | Whether item has been claimed |
| reportedBy | ObjectId | Yes | - | Student who reported the item |
| status | String (enum) | Yes | "available" | Status: "available", "claimed", "resolved" |
| createdAt | Date | Auto | Auto-generated | Timestamp when item was created |
| updatedAt | Date | Auto | Auto-generated | Timestamp when item was last updated |

**Relationships:**
- `reportedBy` → References `Student._id` (Many-to-One)
- `claimedBy` → References `Student._id` (Many-to-One)

**Indexes:**
- Primary: `_id`
- Recommended: `type`, `status`, `reportedBy`, `createdAt`

**Example Document:**
```json
{
  "_id": "65a1234567890abcdef11111",
  "itemName": "Blue Backpack",
  "description": "Blue backpack with laptop compartment, found near library",
  "type": "found",
  "mediaUrl": "/item_photos/itm-pic-1762658970511.jpg",
  "mediaType": "photo",
  "claimedBy": null,
  "isClaimed": false,
  "reportedBy": "65a1234567890abcdef67890",
  "status": "available",
  "createdAt": "2024-01-15T14:20:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

**Business Rules:**
- Items can be either "lost" (someone lost it) or "found" (someone found it)
- When `claimedBy` is set, `isClaimed` should be true and `status` should be "claimed"
- Media files stored in `/public/item_photos/` or `/public/item_videos/`

---

### 4. Comment Collection

**Collection Name:** `comments`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto-generated | Unique identifier |
| text | String | Yes | - | Comment content/text |
| item | ObjectId | Yes | - | Reference to Item being commented on |
| commentedBy | ObjectId | Yes | - | Student who wrote the comment |
| mentionedUsers | [ObjectId] | No | [] | Array of students mentioned (@username) |
| parentComment | ObjectId | No | null | Reference to parent comment (for replies) |
| isReply | Boolean | No | false | Whether this is a reply to another comment |
| likes | [ObjectId] | No | [] | Array of students who liked the comment |
| isEdited | Boolean | No | false | Whether comment has been edited |
| editedAt | Date | No | null | Timestamp of last edit |
| createdAt | Date | Auto | Auto-generated | Timestamp when comment was created |
| updatedAt | Date | Auto | Auto-generated | Timestamp when comment was last updated |

**Virtual Fields:**
- `replyCount` - Count of replies to this comment (not stored, calculated)

**Relationships:**
- `item` → References `Item._id` (Many-to-One)
- `commentedBy` → References `Student._id` (Many-to-One)
- `mentionedUsers` → References `Student._id[]` (Many-to-Many)
- `parentComment` → References `Comment._id` (Self-reference, Many-to-One)
- `likes` → References `Student._id[]` (Many-to-Many)

**Indexes:**
- Primary: `_id`
- Compound: `item` + `createdAt` (for sorting comments by item)
- `parentComment` (for fetching replies)
- `commentedBy` (for user's comments)

**Example Documents:**

**Main Comment:**
```json
{
  "_id": "65a1234567890abcdef22222",
  "text": "Has anyone seen this? @john please check!",
  "item": "65a1234567890abcdef11111",
  "commentedBy": "65a1234567890abcdef77777",
  "mentionedUsers": ["65a1234567890abcdef67890"],
  "parentComment": null,
  "isReply": false,
  "likes": ["65a1234567890abcdef67890", "65a1234567890abcdef88888"],
  "isEdited": false,
  "editedAt": null,
  "createdAt": "2024-01-15T15:30:00.000Z",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

**Reply Comment:**
```json
{
  "_id": "65a1234567890abcdef33333",
  "text": "Thanks for tagging me @mary! I will check it out.",
  "item": "65a1234567890abcdef11111",
  "commentedBy": "65a1234567890abcdef67890",
  "mentionedUsers": ["65a1234567890abcdef77777"],
  "parentComment": "65a1234567890abcdef22222",
  "isReply": true,
  "likes": [],
  "isEdited": false,
  "editedAt": null,
  "createdAt": "2024-01-15T15:35:00.000Z",
  "updatedAt": "2024-01-15T15:35:00.000Z"
}
```

**Business Rules:**
- Mentions are extracted from text using regex pattern `/@(\w+)/g`
- Deleting a parent comment cascades to delete all its replies
- When a comment is updated, `isEdited` is set to true and `editedAt` is updated
- Comments can be nested (replies), but typically limited to one level

---

## 🔗 Entity Relationship Diagram

### Detailed Visual Representation

```
                                    ┌───────────────────────────┐
                                    │         BATCH             │
                                    │  (batches collection)     │
                                    ├───────────────────────────┤
                                    │ 🔑 _id: ObjectId (PK)     │
                                    │ 📝 batchName: String      │
                                    │ 📊 status: Enum           │
                                    │    • active               │
                                    │    • completed            │
                                    │    • cancelled            │
                                    │ 📅 createdAt: Date        │
                                    └───────────┬───────────────┘
                                                │
                                                │ ONE Batch
                                                │ has
                                                │ MANY Students
                                                │ (1:N)
                                                ▼
                    ┌───────────────────────────────────────────────────────┐
                    │                    STUDENT                            │
                    │              (students collection)                    │
                    ├───────────────────────────────────────────────────────┤
                    │ 🔑 _id: ObjectId (PK)                                 │
                    │ 👤 name: String                                       │
                    │ 📞 phone: String                                      │
                    │ 🔗 batch: ObjectId (FK) ──────────► Batch._id         │
                    │ 🆔 username: String (UNIQUE)                          │
                    │ 🔒 password: String (hashed)                          │
                    │ 🖼️  profilePicture: String                            │
                    └───┬───────────────────────┬───────────────────────┬───┘
                        │                       │                       │
                        │                       │                       │
                        │ ONE Student           │ ONE Student           │ MANY Students
                        │ reports               │ claims                │ can be mentioned
                        │ MANY Items            │ MANY Items            │ in MANY Comments
                        │ (1:N)                 │ (1:N)                 │ (N:M)
                        │                       │                       │
                        ▼                       ▼                       │
    ┌───────────────────────────────────────────────────────┐           │
    │                      ITEM                             │           │
    │              (items collection)                       │           │
    ├───────────────────────────────────────────────────────┤           │
    │ 🔑 _id: ObjectId (PK)                                 │           │
    │ 📦 itemName: String                                   │           │
    │ 📝 description: String                                │           │
    │ 🏷️  type: Enum                                        │           │
    │    • lost                                             │           │
    │    • found                                            │           │
    │ 🖼️  mediaUrl: String                                  │           │
    │ 🎬 mediaType: Enum (photo/video)                      │           │
    │ 🔗 reportedBy: ObjectId (FK) ──► Student._id          │           │
    │ 🔗 claimedBy: ObjectId (FK) ───► Student._id (null)   │           │
    │ ✅ isClaimed: Boolean                                 │           │
    │ 📊 status: Enum                                       │           │
    │    • available                                        │           │
    │    • claimed                                          │           │
    │    • resolved                                         │           │
    │ 📅 createdAt: Date                                    │           │
    │ 📅 updatedAt: Date                                    │           │
    └───────────────────┬───────────────────────────────────┘           │
                        │                                               │
                        │ ONE Item                                      │
                        │ has                                           │
                        │ MANY Comments                                 │
                        │ (1:N)                                         │
                        │                                               │
                        ▼                                               │
    ┌────────────────────────────────────────────────────────────────┐  │
    │                        COMMENT                                 │  │
    │                  (comments collection)                         │  │
    ├────────────────────────────────────────────────────────────────┤  │
    │ 🔑 _id: ObjectId (PK)                                          │  │
    │ 💬 text: String                                                │  │
    │ 🔗 item: ObjectId (FK) ───────────► Item._id                   │  │
    │ 🔗 commentedBy: ObjectId (FK) ───► Student._id                 │  │
    │ 🔗 mentionedUsers: [ObjectId] (FK) ──────────────────────────┐ │  │
    │    Array of Student IDs mentioned with @username     ◄───────┼─┼──┘
    │                                                               │ │
    │ 🔗 parentComment: ObjectId (FK) ──┐                           │ │
    │    References another Comment._id │  (for replies)           │ │
    │                                   │                           │ │
    │ 🔄 isReply: Boolean               │                           │ │
    │ 💙 likes: [ObjectId] (FK) ────────┼───────────────────────────┘ │
    │    Array of Student IDs who liked │                             │
    │                                   │                             │
    │ ✏️  isEdited: Boolean              │                             │
    │ 📅 editedAt: Date                 │                             │
    │ 📅 createdAt: Date                │                             │
    │ 📅 updatedAt: Date                │                             │
    └───────────────────────────────────┼─────────────────────────────┘
                        ▲               │
                        │               │
                        └───────────────┘
                         Self-Reference
                      (Comment replies to Comment)


═══════════════════════════════════════════════════════════════════════════
                          RELATIONSHIP LEGEND
═══════════════════════════════════════════════════════════════════════════

┌──────────────┬──────────────────────────────────────────────────────────┐
│ Relationship │ Description                                              │
├──────────────┼──────────────────────────────────────────────────────────┤
│ 1:N          │ One-to-Many                                              │
│ N:M          │ Many-to-Many (via array of ObjectIds)                    │
│ PK           │ Primary Key (_id)                                        │
│ FK           │ Foreign Key (references another collection)              │
│ ───►         │ Relationship direction/reference                         │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### Simplified Relationship Flow

```
                  ┌─────────┐
                  │  BATCH  │
                  └────┬────┘
                       │
                       │ 1:N
                       ▼
                  ┌──────────┐
            ┌─────│ STUDENT  │─────┐
            │     └────┬─────┘     │
            │          │           │
            │ N:M      │ 1:N       │ N:M
            │  (likes/ │ (reports/ │ (mentions)
            │   mentions)  claims) │
            │          │           │
            ▼          ▼           │
       ┌─────────┐  ┌──────┐      │
       │ COMMENT │◄─│ ITEM │      │
       └────┬────┘  └──────┘      │
            │                     │
            │ 1:N (replies)       │
            │                     │
            └─────────────────────┘
```

---

## 📈 Relationships Summary

### One-to-Many (1:N) Relationships

#### 1. Batch → Students
```
┌─────────┐ 1      N ┌─────────┐
│  Batch  │──────────│ Student │
└─────────┘          └─────────┘
Field: Student.batch → Batch._id
```
- One batch contains many students
- Each student belongs to exactly one batch
- Example: "2024-CS-A" batch has 50 students

#### 2. Student → Items (as Reporter)
```
┌─────────┐ 1      N ┌──────┐
│ Student │──────────│ Item │
└─────────┘          └──────┘
Field: Item.reportedBy → Student._id
```
- One student can report many lost/found items
- Each item is reported by exactly one student
- Example: John reported 3 items (2 lost, 1 found)

#### 3. Student → Items (as Claimer)
```
┌─────────┐ 1      N ┌──────┐
│ Student │──────────│ Item │
└─────────┘          └──────┘
Field: Item.claimedBy → Student._id
```
- One student can claim many items
- Each item can be claimed by at most one student
- Example: Mary claimed 2 items that were found

#### 4. Item → Comments
```
┌──────┐ 1      N ┌─────────┐
│ Item │──────────│ Comment │
└──────┘          └─────────┘
Field: Comment.item → Item._id
```
- One item can have many comments
- Each comment belongs to exactly one item
- Example: "Blue Backpack" has 15 comments

#### 5. Student → Comments (as Author)
```
┌─────────┐ 1      N ┌─────────┐
│ Student │──────────│ Comment │
└─────────┘          └─────────┘
Field: Comment.commentedBy → Student._id
```
- One student can write many comments
- Each comment is written by exactly one student
- Example: John wrote 25 comments on various items

#### 6. Comment → Comments (Self-Reference for Replies)
```
┌─────────┐ 1      N ┌─────────┐
│ Comment │──────────│ Comment │
│(Parent) │          │(Reply)  │
└─────────┘          └─────────┘
Field: Comment.parentComment → Comment._id
```
- One comment can have many replies
- Each reply belongs to one parent comment
- Example: Main comment has 5 replies
- Creates a thread structure

---

### Many-to-Many (N:M) Relationships

#### 1. Comment ↔ Students (Mentions)
```
┌─────────┐ N      M ┌─────────┐
│ Comment │──────────│ Student │
└─────────┘          └─────────┘
Field: Comment.mentionedUsers → [Student._id]
```
- One comment can mention multiple students (@john @mary)
- One student can be mentioned in multiple comments
- Implemented via array of ObjectIds
- Example: Comment mentions 3 students; Student is mentioned in 10 comments

**How it works:**
```javascript
// Comment text: "Hey @john and @mary, check this out!"
mentionedUsers: [
  ObjectId("john_id"),
  ObjectId("mary_id")
]
```

#### 2. Comment ↔ Students (Likes)
```
┌─────────┐ N      M ┌─────────┐
│ Comment │──────────│ Student │
└─────────┘          └─────────┘
Field: Comment.likes → [Student._id]
```
- One comment can be liked by multiple students
- One student can like multiple comments
- Implemented via array of ObjectIds
- Example: Comment has 20 likes; Student liked 50 comments

**How it works:**
```javascript
// When students like a comment
likes: [
  ObjectId("student1_id"),
  ObjectId("student2_id"),
  ObjectId("student3_id")
]
```

---

### Complete Relationship Matrix

| From       | To        | Relationship | Type | Field Name        | Description |
|------------|-----------|--------------|------|-------------------|-------------|
| Batch      | Student   | Has          | 1:N  | Student.batch     | Batch contains students |
| Student    | Item      | Reports      | 1:N  | Item.reportedBy   | Student reports items |
| Student    | Item      | Claims       | 1:N  | Item.claimedBy    | Student claims items |
| Item       | Comment   | Has          | 1:N  | Comment.item      | Item has comments |
| Student    | Comment   | Writes       | 1:N  | Comment.commentedBy | Student writes comments |
| Comment    | Comment   | Has Reply    | 1:N  | Comment.parentComment | Comment has replies |
| Comment    | Student   | Mentions     | N:M  | Comment.mentionedUsers | Comment mentions students |
| Comment    | Student   | Liked By     | N:M  | Comment.likes     | Comment liked by students |

---

### Visual Cardinality Notation

```
┌──────────────────────────────────────────────────────────────────┐
│                      CARDINALITY EXAMPLES                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ONE Batch (e.g., "2024-CS-A")                                   │
│      ├─► Student: John (username: john)                          │
│      ├─► Student: Mary (username: mary)                          │
│      ├─► Student: Alice (username: alice)                        │
│      └─► Student: Bob (username: bob)                            │
│                                                                  │
│  ONE Student (John)                                              │
│      ├─► Reported Item: "Blue Backpack" (lost)                   │
│      ├─► Reported Item: "Red Notebook" (lost)                    │
│      ├─► Claimed Item: "Black Wallet" (found by Mary)            │
│      ├─► Comment: "Has anyone seen this?"                        │
│      ├─► Comment: "Thanks for finding it!"                       │
│      └─► Mentioned in 5 comments, Liked 10 comments              │
│                                                                  │
│  ONE Item (Blue Backpack)                                        │
│      ├─► Comment 1: "I think I saw this!" (by Mary)              │
│      │      ├─► Reply 1.1: "Where?" (by John)                    │
│      │      └─► Reply 1.2: "Near the library" (by Mary)          │
│      ├─► Comment 2: "@john is this yours?" (by Alice)            │
│      │      └─► Reply 2.1: "Yes! Thanks!" (by John)              │
│      └─► Comment 3: "Great find @mary!" (by Bob)                 │
│             [Liked by: John, Alice, Mary]                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Features

### Indexing Strategy
```javascript
// Item Collection
db.items.createIndex({ type: 1, status: 1 })
db.items.createIndex({ reportedBy: 1 })
db.items.createIndex({ createdAt: -1 })

// Comment Collection
db.comments.createIndex({ item: 1, createdAt: -1 })
db.comments.createIndex({ parentComment: 1 })
db.comments.createIndex({ commentedBy: 1 })
db.comments.createIndex({ mentionedUsers: 1 })

// Student Collection
db.students.createIndex({ username: 1 }, { unique: true })
db.students.createIndex({ batch: 1 })
```

### Data Validation
- **Enums**: Used for status fields to ensure data integrity
  - Batch.status: "active", "completed", "cancelled"
  - Item.type: "lost", "found"
  - Item.mediaType: "photo", "video"
  - Item.status: "available", "claimed", "resolved"

### Timestamps
- **Auto-managed**: `createdAt` and `updatedAt` in Item and Comment collections
- **Manual**: Batch collection uses manual `createdAt`

### Cascading Operations
- Deleting a parent comment → deletes all child replies
- Consider adding cascade for deleting student → handle their items/comments

---

## 🔒 Security Considerations

1. **Password Storage**
   - Currently passwords are stored as plain text (⚠️ SECURITY RISK)
   - **Recommendation**: Implement bcrypt hashing before storage
   ```javascript
   const bcrypt = require('bcrypt');
   password = await bcrypt.hash(password, 10);
   ```

2. **Authentication**
   - JWT tokens are implemented for student login
   - Store tokens securely on client side

3. **Data Sanitization**
   - `express-mongo-sanitize` is configured (currently commented out)
   - Prevents NoSQL injection attacks

4. **Input Validation**
   - Mongoose schema validation handles required fields
   - Consider adding more validation (email format, phone format, etc.)

---

## 📊 Sample Data Flow

### Lost Item Report Flow
```
1. Student logs in → receives JWT token
2. Student uploads photo → POST /api/v1/items/upload-photo
3. System saves to /public/item_photos/ → returns photoUrl
4. Student creates item → POST /api/v1/items
   {
     itemName: "Blue Backpack",
     description: "Lost near library",
     type: "lost",
     mediaUrl: "/item_photos/...",
     reportedBy: "student_id"
   }
5. Item saved to database with status: "available"
```

### Comment with Mention Flow
```
1. User writes comment: "Check this out @john @mary"
2. POST /api/v1/comments
3. System extracts mentions using regex: /@(\w+)/g
4. Finds users by username: ["john", "mary"]
5. Stores their IDs in mentionedUsers array
6. Comment saved with populated mentionedUsers field
7. Frontend can query: GET /api/v1/comments/mentions/:studentId
```

---

## 🛠️ Potential Improvements

### Recommended Schema Enhancements

1. **Student Collection**
   - Add `email` field (unique, required) for password recovery
   - Add `isVerified` boolean for email verification
   - Add `role` field (student, admin) for authorization
   - Hash passwords using bcrypt

2. **Item Collection**
   - Add `category` field (Bag, Electronics, Documents, etc.)
   - Add `location` field with more detail
   - Add `foundDate` or `lostDate` timestamp
   - Add `color` field for better searching
   - Add array of images instead of single mediaUrl

3. **Comment Collection**
   - Add `isPinned` for important comments
   - Add `reportedBy` for flagging inappropriate comments

4. **New Collections**
   - **Notifications**: Track mentions, likes, claims
   - **Messages**: Private messaging between students
   - **Admin**: Separate admin accounts

### Performance Optimizations
- Add more compound indexes based on query patterns
- Implement pagination for large result sets
- Add caching layer (Redis) for frequently accessed data
- Use aggregation pipelines for complex queries

---

**Database Type:** MongoDB (NoSQL - Document-oriented)
**ODM:** Mongoose
**Total Collections:** 4 (Batch, Student, Item, Comment)
**Last Updated:** 2025-01-09
