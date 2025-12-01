/**
 * README - BYUI Clubs API
 * 
 * This file provides documentation on how to run and use the API.
 */

# BYUI Clubs API

A REST API for managing BYUI campus club information. Built with Node.js, Express, and PostgreSQL.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your configuration:
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string (when ready)
- `JWT_SECRET`: Secret key for authentication (change this!)

### 3. Run the Server

Development mode (auto-restart on changes):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 4. Verify It's Running

Visit: http://localhost:3000/health

You should see:
```json
{
  "status": "OK",
  "message": "BYUI Clubs API is running",
  "timestamp": "2025-11-17T..."
}
```

## API Endpoints

### Clubs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/clubs` | Get all clubs (supports `?category=name` filter) | No |
| GET | `/api/clubs/:id` | Get single club (by ID or slug) | No |
| POST | `/api/clubs` | Create new club | Yes (admin) |
| PUT | `/api/clubs/:id` | Update club | Yes (admin) |
| DELETE | `/api/clubs/:id` | Soft delete club | Yes (admin) |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories with club counts | No |
| GET | `/api/categories/:id/clubs` | Get all clubs in a category | No |

### Example Requests

#### Get all clubs
```bash
curl http://localhost:3000/api/clubs
```

#### Get clubs filtered by category
```bash
curl "http://localhost:3000/api/clubs?category=Engineering"
```

#### Get specific club by slug
```bash
curl http://localhost:3000/api/clubs/society-of-women-engineers
```

#### Get specific club by ID
```bash
curl http://localhost:3000/api/clubs/1
```

#### Get all categories
```bash
curl http://localhost:3000/api/categories
```

#### Get clubs in a category
```bash
curl http://localhost:3000/api/categories/1/clubs
```

#### Create a club (will require auth later)
```bash
curl -X POST http://localhost:3000/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Photography Club",
    "slug": "photography-club",
    "description": "Learn photography and take amazing photos",
    "meeting_day": "Wednesday",
    "meeting_time": "5:00 PM",
    "meeting_location": "Art Building Room 101",
    "contact_email": "photo@byui.edu",
    "website_url": "https://my.byui.edu/groups/photo-club",
    "categories": ["Recreation"]
  }'
```

#### Update a club (will require auth later)
```bash
curl -X PUT http://localhost:3000/api/clubs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_time": "6:00 PM",
    "meeting_location": "New Location"
  }'
```
