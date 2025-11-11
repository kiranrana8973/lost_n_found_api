# Lost & Found API

A secure, scalable REST API for managing lost and found items with real-time comments, user authentication, and Redis caching.

---

## 🚀 Features

- ✅ **User Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **CRUD Operations** - Full create, read, update, delete for all resources
- ✅ **File Uploads** - Support for images and videos
- ✅ **Comment System** - Nested comments with @mentions and likes
- ✅ **Redis Caching** - Fast response times with intelligent caching
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Security Hardening** - XSS prevention, NoSQL injection protection
- ✅ **Authorization** - Users can only modify their own resources
- ✅ **CORS Support** - Configurable cross-origin requests

---

## 📋 Prerequisites

- **Node.js** v14+
- **MongoDB** v4.4+
- **Redis** v6+ (optional but recommended)

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd lost_n_found_api
npm install
```

### 2. Configure Environment

Create/edit `config/config.env`:

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

### 3. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Start Redis (Optional)

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Windows (WSL2)
sudo service redis-server start
```

### 5. Run Server

```bash
npm run dev
```

Server runs on: `http://localhost:3000`

---

## 📚 Documentation

### **Complete Guides:**
- **[API Endpoints](API_ENDPOINTS.md)** - Full API documentation
- **[Redis Setup](REDIS_SETUP_COMPLETE.md)** - Redis installation for all OS
- **[API Testing](API_TESTING.md)** - Automated testing guide

### **Quick Links:**
- Base URL: `http://localhost:3000/api/v1`
- API Version: v1
- Authentication: Bearer Token (JWT)

---

## 🗂️ Project Structure

```
lost_n_found_api/
├── config/
│   ├── config.env           # Environment variables
│   ├── db.js                # MongoDB connection
│   └── redis.js             # Redis connection
├── controllers/
│   ├── batch_controller.js  # Batch logic
│   ├── comment_controller.js# Comment logic
│   ├── item_controller.js   # Item logic
│   └── student_controller.js# Student logic
├── middleware/
│   ├── async.js             # Async handler wrapper
│   ├── auth.js              # JWT authentication
│   ├── cache.js             # Redis caching
│   ├── errorHandler.js      # Global error handler
│   └── uploads.js           # File upload handler
├── models/
│   ├── batch_model.js       # Batch schema
│   ├── comment_model.js     # Comment schema
│   ├── items_model.js       # Item schema
│   └── student_model.js     # Student schema
├── routes/
│   ├── batch_route.js       # Batch endpoints
│   ├── comment_route.js     # Comment endpoints
│   ├── item_route.js        # Item endpoints
│   └── student_route.js     # Student endpoints
├── utils/
│   └── cacheInvalidation.js # Cache management
├── public/
│   ├── item_photos/         # Uploaded item images
│   ├── item_videos/         # Uploaded item videos
│   └── profile_pictures/    # User profile pictures
├── server.js                # Main application entry
├── test-api.js              # Automated API tests
└── package.json             # Dependencies
```

---

## 🔗 API Endpoints Summary

### **Batches**
- `POST /api/v1/batches` - Create batch
- `GET /api/v1/batches` - Get all batches (cached 30min)
- `GET /api/v1/batches/:id` - Get batch by ID (cached 30min)
- `PUT /api/v1/batches/:id` - Update batch 🔒

### **Students**
- `POST /api/v1/students` - Register student
- `POST /api/v1/students/login` - Login
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/:id` - Get student by ID
- `PUT /api/v1/students/:id` - Update student 🔒
- `DELETE /api/v1/students/:id` - Delete student 🔒
- `POST /api/v1/students/upload` - Upload profile picture

### **Items**
- `POST /api/v1/items` - Create item 🔒
- `GET /api/v1/items` - Get all items (cached 5min)
- `GET /api/v1/items/:id` - Get item by ID (cached 10min)
- `PUT /api/v1/items/:id` - Update item 🔒
- `DELETE /api/v1/items/:id` - Delete item 🔒
- `POST /api/v1/items/upload-photo` - Upload photo
- `POST /api/v1/items/upload-video` - Upload video

### **Comments**
- `POST /api/v1/comments` - Create comment 🔒
- `GET /api/v1/comments/item/:itemId` - Get item comments
- `PUT /api/v1/comments/:id` - Update comment 🔒
- `DELETE /api/v1/comments/:id` - Delete comment 🔒
- `POST /api/v1/comments/:id/like` - Like comment 🔒

🔒 = Requires Authentication

---

## 🧪 Testing

### Automated Tests

```bash
npm test
```

This runs comprehensive tests on all endpoints and shows:
- ✅ Passed tests
- ❌ Failed tests with error details
- 📊 Success rate percentage

### Manual Testing

Use Postman, Thunder Client, or cURL:

```bash
# Example: Get all items
curl http://localhost:3000/api/v1/items

# Example: Login
curl -X POST http://localhost:3000/api/v1/students/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔒 Security Features

### **Implemented:**
- ✅ JWT Authentication (30-day expiration)
- ✅ Password Hashing (bcrypt, 10 rounds)
- ✅ Rate Limiting (100 req/15min general, 5 req/15min login)
- ✅ NoSQL Injection Prevention
- ✅ XSS Attack Prevention
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Input Sanitization
- ✅ Authorization Checks (users can only modify own data)
- ✅ File Upload Validation (type & size)
- ✅ httpOnly Cookies

### **Environment-Specific:**
- Development: Detailed error messages with stack traces
- Production: Generic error messages only

---

## 📊 Performance

### **Without Redis:**
- Average response time: 50-200ms
- Database hit: Every request

### **With Redis:**
- Cached response time: 2-10ms ⚡
- 20-50x faster for cached endpoints!
- Reduced database load by ~80%

### **Cache Strategy:**
- Batches: 30 minutes
- Items (list): 5 minutes
- Items (single): 10 minutes
- Auto-invalidation on create/update/delete

---

## 🛠️ Development Scripts

```bash
# Start development server (with nodemon)
npm run dev

# Start production server
npm start

# Run automated tests
npm test
```

---

## 🌐 Deployment

### **Environment Variables for Production:**

```env
NODE_ENV=production
PORT=5000
LOCAL_DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=super_long_random_secret_minimum_32_characters
CORS_ORIGIN=https://yourdomain.com
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=your-redis-password
MAX_FILE_UPLOAD=10000000
```

### **Recommended Platforms:**
- **Heroku** - Easy deployment
- **Railway** - Modern platform
- **DigitalOcean** - App Platform
- **AWS** - EC2 + ElastiCache (Redis)
- **Render** - Free tier available

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📝 License

ISC License - See LICENSE file for details

---

## 👨‍💻 Author

**Kiran Rana**

---

## 🔗 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT.io](https://jwt.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Support

For issues and questions:
1. Check [API_ENDPOINTS.md](API_ENDPOINTS.md) for API documentation
2. Check [REDIS_SETUP_COMPLETE.md](REDIS_SETUP_COMPLETE.md) for Redis setup
3. Check [API_TESTING.md](API_TESTING.md) for testing guide
4. Run `npm test` to diagnose issues

---

**Built with ❤️ using Node.js, Express, MongoDB, and Redis**

**Version:** 1.0.0
**Last Updated:** January 2025
