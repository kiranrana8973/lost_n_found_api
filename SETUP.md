# Lost & Found API — Setup Guide

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** v6 or higher (running locally or a remote URI)

## 1. Clone the Repository

```bash
git clone https://github.com/kiranrana8973/lost_n_found_api.git
cd lost_n_found_api
git checkout sever_nestjs
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment

Open `config/config.env` and update the values:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `LOCAL_DATABASE_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/lost_n_found` |
| `JWT_SECRET` | Secret key for JWT signing (change in production) | `this_is_a_secret_key` |
| `JWT_EXPIRE` | Access token expiry | `15m` |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days | `1` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry in days | `7` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:3001` |

## 4. Start MongoDB

Make sure MongoDB is running before starting the server.

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 5. Seed the Database (Optional)

Populate the database with sample data (8 batches, 10 categories, 13 students, 25 items, 30 comments):

```bash
npm run seed
```

To remove all seed data:

```bash
npm run seed:destroy
```

### Seed Data Overview

#### Batches (8)

| Batch Name | Status |
|---|---|
| 35-A | active |
| 35-B | active |
| 35-C | active |
| 35-D | active |
| 36-A | active |
| 36-B | active |
| 36-C | active |
| 36-D | active |

#### Categories (10)

| Name | Description |
|---|---|
| Electronics | Phones, laptops, chargers, earbuds, etc. |
| Bags & Accessories | Backpacks, wallets, purses, keychains |
| Clothing | Jackets, hoodies, shoes, hats |
| Books & Stationery | Textbooks, notebooks, calculators, pens |
| ID & Cards | Student ID, credit cards, access cards |
| Keys | Car keys, room keys, bike locks |
| Sports & Fitness | Water bottles, fitness trackers, sports gear |
| Jewelry | Necklaces, rings, watches, bracelets |
| Eyewear | Glasses, sunglasses, contact lens cases |
| Others | Miscellaneous items |

#### Students (13)

| Name | Email | Username |
|---|---|---|
| Kiran Rana | kiranrana@softwarica.edu.np | kiranr |
| Sarah Johnson | sarah.johnson@softwarica.edu.np | sarahj |
| Michael Chen | michael.chen@softwarica.edu.np | mikechen |
| Emily Rodriguez | emily.rodriguez@softwarica.edu.np | emilyrod |
| James Wilson | james.wilson@softwarica.edu.np | jameswilson |
| Priya Patel | priya.patel@softwarica.edu.np | priyap |
| David Kim | david.kim@softwarica.edu.np | davidkim |
| Olivia Martinez | olivia.martinez@softwarica.edu.np | oliviam |
| Ryan Thompson | ryan.thompson@softwarica.edu.np | ryant |
| Sophia Lee | sophia.lee@softwarica.edu.np | sophialee |
| Alex Garcia | alex.garcia@softwarica.edu.np | alexg |
| Emma Brown | emma.brown@softwarica.edu.np | emmab |
| Daniel Singh | daniel.singh@softwarica.edu.np | daniels |

All students have password: `password123`

#### Items (25)

| Item Name | Type | Location | Status |
|---|---|---|---|
| Black backpack | lost | Library, Ground Floor | available |
| iPhone 14 with blue case | found | Canteen, 2nd Floor | available |
| Silver Hydroflask | lost | Gym Locker Room | available |
| TI-84 Calculator | found | Block A, Room 205 | available |
| Brown leather wallet | lost | Parking Lot B | available |
| AirPods Pro | found | Main Quad, Near Fountain | claimed |
| Red Nike hoodie | lost | Block B, Computer Lab 204 | available |
| Car keys with green lanyard | found | Block C, Main Entrance | available |
| Prescription glasses | lost | Main Auditorium | available |
| Data Structures textbook | found | Library, 3rd Floor Study Area | available |
| Purple floral umbrella | lost | Main Gate Bus Stop | available |
| Fitbit Charge 5 | found | Gym, Men's Locker Room | available |
| White lab coat | lost | Chemistry Building, Lab 3 | resolved |
| 64GB SanDisk pendrive | found | Computer Center, Main Entrance | available |
| Element skateboard | lost | Student Center, Bike Rack Area | available |
| MacBook charger | found | Library, Study Room 4 | available |
| Gold necklace with pendant | lost | Girls Hostel, Near Garden | available |
| Blue JBL speaker | found | Cafeteria, Outdoor Seating | claimed |
| Student ID card | found | Main Building, ATM Area | resolved |
| Black leather jacket | lost | Main Auditorium | available |
| Wireless mouse | found | Block A, Computer Lab 101 | available |
| Chemistry lab manual | lost | Block D, 2nd Floor | available |
| Samsung Galaxy Buds | found | Basketball Court, Bleachers | available |
| Denim jacket | lost | Cafeteria, Indoor Seating | available |
| Power bank 20000mAh | found | Parking Lot, Vending Machine | available |

#### Comments (30)

| # | Text |
|---|---|
| 1 | I think I saw this near library yesterday around 4pm. Did you check with the lost and found office? |
| 2 | Hey @sarahj I found it! Come to library front desk to pick it up. |
| 3 | Is it the plain blue case or the sparkly one? My friend lost a similar phone. |
| 4 | Same thing happened to me last week. Hope you find it soon! |
| 5 | Wait this might be mine! Can you tell me the last 4 digits of serial number? |
| 6 | That's rough. I'll ask around and let you know if anyone has seen it. |
| 7 | This could be mine. What brand is the case exactly? |
| 8 | Is this still available? I think it belongs to my roommate. |
| 9 | Saw someone wearing a red hoodie near gym this morning. Might be yours? |
| 10 | These might be my roommate's keys! Are they still with you? |
| 11 | I was in that lab yesterday. Didn't see any hoodie though. Maybe check with the lab assistant? |
| 12 | Upvoting for visibility. Hope you find your wallet soon! |
| 13 | Try checking the security office too. They usually collect lost items. |
| 14 | @mikechen is this yours? You mentioned losing your calculator. |
| 15 | I found a similar looking item near Block B. Could be the same one? |
| 16 | Has anyone claimed this yet? My sister lost the same thing last week. |
| 17 | Check the cafeteria lost and found box. They found my stuff there once. |
| 18 | Posted on the college WhatsApp group too. More eyes the better! |
| 19 | Thank you so much for posting this! Just picked it up. Really appreciate it! |
| 20 | Still looking for this? I might have seen something similar in parking lot. |
| 21 | Try the security booth near main gate. They keep found items for a week. |
| 22 | Is there any reward? Just kidding, but seriously hope you find it! |
| 23 | I'll keep an eye out during my evening walk around campus. |
| 24 | Did you check all your class rooms? Sometimes we forget where we last had it. |
| 25 | This is why I always put AirTags on my important stuff. Good luck though! |
| 26 | Just shared this post with my batch group. Someone might have seen it. |
| 27 | Contact campus security. They have CCTV footage that might help. |
| 28 | Glad this community exists! Found my lost phone through this app last month. |
| 29 | Hey @priyap this looks like your ID card! Check this post. |
| 30 | Any updates on this? Did you find it? |

## 6. Run the Server

**Development** (with hot reload):

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000`.

## 7. Verify

Open your browser or use curl:

```bash
curl http://localhost:3000/api/v1/batches
```

You should get a JSON response with the list of batches.

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/refresh` | No | Refresh access token |

### Students

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/students` | No | Register a new student |
| POST | `/students/login` | No | Login |
| POST | `/students/logout` | No | Logout |
| POST | `/students/upload` | No | Upload profile picture |
| GET | `/students/me` | Yes | Get current student |
| GET | `/students` | Yes | Get all students |
| GET | `/students/:id` | No | Get student by ID |
| PUT | `/students/:id` | Yes | Update student (owner only) |
| DELETE | `/students/:id` | Yes | Delete student (owner only) |

### Batches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/batches` | Yes | Create a batch |
| GET | `/batches` | No | Get all batches |
| GET | `/batches/:id` | No | Get batch by ID |
| PUT | `/batches/:id` | Yes | Update a batch |

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/categories` | Yes | Create a category |
| GET | `/categories` | No | Get all active categories |
| GET | `/categories/:id` | No | Get category by ID |
| PUT | `/categories/:id` | Yes | Update a category |
| DELETE | `/categories/:id` | Yes | Delete a category |

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/items` | Yes | Create an item |
| POST | `/items/upload-photo` | Yes | Upload item photo |
| POST | `/items/upload-video` | Yes | Upload item video |
| GET | `/items` | No | Get all items (paginated, filterable) |
| GET | `/items/:id` | No | Get item by ID |
| PUT | `/items/:id` | Yes | Update item (owner only) |
| DELETE | `/items/:id` | Yes | Delete item (owner only) |

**Query params for GET /items:** `page`, `limit`, `type` (lost/found), `status`, `category`

### Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/comments` | Yes | Create a comment |
| GET | `/comments/item/:itemId` | No | Get comments for an item |
| GET | `/comments/student/:studentId` | Yes | Get comments by a student |
| GET | `/comments/mentions/:studentId` | Yes | Get mentions for a student |
| GET | `/comments/:id/replies` | No | Get replies to a comment |
| PUT | `/comments/:id` | Yes | Update comment (owner only) |
| DELETE | `/comments/:id` | Yes | Delete comment (owner only) |
| POST | `/comments/:id/like` | Yes | Toggle like on a comment |

## Test Credentials (after seeding)

| Email | Password |
|---|---|
| `kiranrana@softwarica.edu.np` | `password123` |
| `sarah.johnson@softwarica.edu.np` | `password123` |

## Project Structure

```
src/
  main.ts                 # Bootstrap (prefix, pipes, filters, CORS, helmet)
  app.module.ts           # Root module
  auth/                   # JWT strategy, token refresh
  students/               # Student CRUD, login/logout, profile upload
  batches/                # Batch CRUD
  categories/             # Category CRUD
  items/                  # Item CRUD, photo/video uploads, pagination
  comments/               # Comments, replies, mentions, likes
  uploads/                # Multer configurations
  database/seed/          # Seeder with sample data
  common/
    guards/               # JWT auth guard, roles guard
    decorators/           # @CurrentUser(), @Public(), @Roles()
    filters/              # Global exception filter
    middleware/            # Input sanitization
    pipes/                # ObjectId validation
    dto/                  # Shared pagination DTO
    utils/                # Pagination helper
config/config.env         # Environment variables
public/                   # Static files (uploads)
```
