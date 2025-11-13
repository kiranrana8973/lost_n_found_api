# Lost & Found API

This is a REST API for managing lost and found items on campus. Students can report lost items, post found items, and comment on posts to help reunite people with their belongings.

## What's Inside

The API includes user authentication, file uploads for item photos, a commenting system with @mentions, and Redis caching for better performance. I built it as a learning project to understand backend development with Express and MongoDB.

**Main Features:**
- User registration and JWT authentication
- Post lost/found items with photos or videos
- Comment on items with nested replies and @username mentions
- Like/unlike comments
- Redis caching (makes things noticeably faster)
- Rate limiting to prevent spam
- Only item owners can edit/delete their posts

## Before You Start

You'll need these installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (optional, but recommended for caching)

## Getting Started

### Installation

Clone the repo and install dependencies:

```bash
git clone <repository-url>
cd lost_n_found_api
npm install
```

### Configuration

The API looks for a `config/config.env` file. Here's what mine looks like:

```env
NODE_ENV=development
PORT=3000
LOCAL_DATABASE_URI='mongodb://127.0.0.1:27017/lost_n_found'
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CORS_ORIGIN=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

Make sure to change `JWT_SECRET` to something random and secure.

### Start Your Database

**MongoDB:**
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                       # Windows
```

**Redis** (optional but makes things faster):
```bash
brew services start redis              # macOS
sudo systemctl start redis-server      # Linux
sudo service redis-server start        # Windows (WSL2)
```

If you don't have Redis, the API still works - it just won't cache responses.

### Add Some Test Data (Optional)

I included a seed script to populate the database with fake students and items for testing:

```bash
node seed-data.js -i
```

This adds 12 students, 15 items, and some comments. All test accounts use the password `password123`.

Try logging in as: `sarah.johnson@college.edu` / `password123`

To wipe everything clean:
```bash
node seed-data.js -d
```

### Run the Server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`

If everything worked, you should see colorful terminal output showing MongoDB and Redis connections.

## Documentation

Check these files for more details:
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Full list of available endpoints with examples
- [REDIS_SETUP_COMPLETE.md](REDIS_SETUP_COMPLETE.md) - How to install Redis on different operating systems
- [API_TESTING.md](API_TESTING.md) - Testing guide
- [TEACHING_NOTES.md](TEACHING_NOTES.md) - Notes for instructors (if you're using this for teaching)

**Quick reference:**
- Base URL: `http://localhost:3000/api/v1`
- Auth: JWT tokens (pass as `Authorization: Bearer YOUR_TOKEN`)


## Project Structure

Here's how the code is organized:

```
lost_n_found_api/
├── config/          - Database connections and environment config
├── controllers/     - Request handlers (the main logic)
├── middleware/      - Auth, caching, file uploads, error handling
├── models/          - MongoDB schemas
├── routes/          - API endpoint definitions
├── utils/           - Helper functions like cache invalidation
├── public/          - Uploaded files (photos, videos, profile pics)
├── server.js        - Main entry point
└── seed-data.js     - Script to add test data
```

## API Endpoints

The API has endpoints for batches (student groups/classes), students, items, and comments.

**Batches:**
- `POST /batches` - Create a new batch
- `GET /batches` - List all batches
- `GET /batches/:id` - Get specific batch
- `PUT /batches/:id` - Update batch (protected)

**Students:**
- `POST /students` - Register new student
- `POST /students/login` - Login and get JWT token
- `GET /students` - List all students
- `GET /students/:id` - Get student profile
- `PUT /students/:id` - Update own profile (protected)
- `DELETE /students/:id` - Delete own account (protected)
- `POST /students/upload` - Upload profile picture

**Items (Lost & Found):**
- `POST /items` - Report lost/found item (protected)
- `GET /items` - Browse all items
- `GET /items/:id` - View item details
- `PUT /items/:id` - Update own item (protected)
- `DELETE /items/:id` - Delete own item (protected)
- `POST /items/upload-photo` - Upload item photo
- `POST /items/upload-video` - Upload item video

**Comments:**
- `POST /comments` - Add comment (protected)
- `GET /comments/item/:itemId` - Get comments for an item
- `PUT /comments/:id` - Edit own comment (protected)
- `DELETE /comments/:id` - Delete own comment (protected)
- `POST /comments/:id/like` - Like/unlike comment (protected)

All endpoints are under `/api/v1/`. Protected routes need a JWT token in the Authorization header.

## Testing

There's an automated test script you can run:

```bash
npm test
```

It tests all the main endpoints and shows what passed or failed.

For manual testing, I usually use Postman or just cURL:

```bash
# Get all items
curl http://localhost:3000/api/v1/items

# Login example
curl -X POST http://localhost:3000/api/v1/students/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@college.edu","password":"password123"}'
```

## Security

I tried to follow security best practices:
- Passwords are hashed with bcrypt before storing
- JWT tokens for authentication (they expire after 30 days)
- Rate limiting: 5 login attempts per 15 minutes, 100 requests per 15 minutes for other endpoints
- Input sanitization to prevent XSS and NoSQL injection
- Users can only edit/delete their own posts
- File uploads are validated (type and size)
- CORS is configurable

In development mode, you get detailed error messages. In production, errors are more generic to avoid leaking sensitive info.


## Performance

Redis caching makes a noticeable difference:
- Without Redis: responses take 50-200ms
- With Redis: cached responses take 2-10ms

The cache automatically clears when data changes. Here's what gets cached:
- Batches list: 30 minutes
- Items list: 5 minutes
- Individual items: 10 minutes

If Redis isn't running, everything still works - just slower.

## Available Scripts

```bash
npm run dev     # Development server with auto-reload
npm start       # Production server
npm test        # Run API tests
```

## Deployment

For production, you'll want to:
1. Use a real MongoDB instance / YOu can use MongoDB Atlas
2. Set a strong JWT_SECRET (at least 32 characters)
3. Configure CORS_ORIGIN to your frontend domain
4. Set NODE_ENV to "production"

Sample production config:
```env
NODE_ENV=production
PORT=5000
LOCAL_DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_long_random_secret_here
CORS_ORIGIN=https://yourdomain.com
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=your-redis-password
```

The app should work on Heroku, Railway, DigitalOcean, AWS, or Render without much modification.

## Contributing

Feel free to fork this and make it your own. If you add something cool, pull requests are welcome.

## License

ISC License

## Author

Built by Kiran Rana as a learning project and teaching tool.

## Helpful Links

- [MongoDB docs](https://docs.mongodb.com/)
- [Express.js guide](https://expressjs.com/)
- [Redis documentation](https://redis.io/documentation)
- [JWT explained](https://jwt.io/)

---

**Tech Stack:** Node.js, Express, MongoDB, Redis

