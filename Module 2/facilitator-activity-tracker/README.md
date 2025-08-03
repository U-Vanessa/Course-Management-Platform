# Facilitator Activity Tracker (FAT)

A comprehensive Node.js application for tracking weekly facilitator activities with Redis-backed notifications and role-based access control.

## Features

### Core Functionality
- **Activity Tracking**: Track weekly activities including attendance, grading tasks, course moderation, intranet sync, and gradebook status
- **Role-Based Access Control**: Three user roles (Facilitator, Manager, Admin) with appropriate permissions
- **Real-time Notifications**: Redis-backed notification system with Bull queue processing
- **Dashboard Analytics**: Activity completion statistics and weekly progress tracking
- **RESTful API**: Complete CRUD operations with proper error handling and validation

### Activity Tracking Fields
- `allocationId`: Reference to course offering
- `attendance`: Array of boolean values for daily attendance
- `formativeOneGrading`: Status (Done/Pending/Not Started)
- `formativeTwoGrading`: Status (Done/Pending/Not Started)  
- `summativeGrading`: Status (Done/Pending/Not Started)
- `courseModeration`: Status (Done/Pending/Not Started)
- `intranetSync`: Status (Done/Pending/Not Started)
- `gradeBookStatus`: Status (Done/Pending/Not Started)

### User Roles
- **Facilitator**: Can manage their own activity logs only
- **Manager**: Can read all activity logs, send notifications, schedule reminders  
- **Admin**: Full system access including user management

## Tech Stack

- **Backend**: Node.js 18+, Express.js 4.18.2
- **Database**: MySQL with Sequelize ORM
- **Cache/Queue**: Redis with Bull queue system
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## Installation

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher  
- Redis 6.0 or higher

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd "Module 2/facilitator-activity-tracker"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` (if available) or use the existing `.env` file
   - Update database and Redis connection settings as needed

4. **Database Setup**
   ```bash
   # Create database
   npx sequelize-cli db:create
   
   # Run migrations
   npx sequelize-cli db:migrate
   
   # Seed sample data
   npx sequelize-cli db:seed:all
   ```

5. **Start Redis Server**
   ```bash
   # On Windows (if Redis is installed)
   redis-server
   
   # On macOS with Homebrew
   brew services start redis
   
   # On Linux
   sudo systemctl start redis
   ```

6. **Start Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/users` - Get all users (managers+)
- `PUT /api/auth/users/:id` - Update user (admin only)

### Activity Tracking
- `POST /api/activities` - Create/update activity tracker
- `GET /api/activities` - Get activity trackers (with filters)
- `GET /api/activities/summary` - Get activity summary/dashboard
- `GET /api/activities/:id` - Get single activity tracker
- `PUT /api/activities/:id` - Update activity tracker
- `DELETE /api/activities/:id` - Delete activity tracker

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `POST /api/notifications/send` - Send notification (managers+)
- `POST /api/notifications/schedule-reminders` - Schedule reminders (managers+)
- `GET /api/notifications/queue-stats` - Get queue statistics (admin only)

### System
- `GET /health` - Health check endpoint
- `GET /api` - API documentation

## Sample Users

After running the seeder, you can login with these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Facilitator | john.facilitator@alu.edu | password123 |
| Facilitator | jane.facilitator@alu.edu | password123 |
| Manager | bob.manager@alu.edu | password123 |
| Admin | alice.admin@alu.edu | password123 |

## API Usage Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.facilitator@alu.edu","password":"password123"}'

# Use the returned token in subsequent requests
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Activity Tracking
```bash
# Create/Update Activity
curl -X POST http://localhost:3001/api/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allocationId": 1,
    "weekNumber": 1,
    "attendance": [true, true, false, true, true],
    "formativeOneGrading": "Done",
    "formativeTwoGrading": "Pending",
    "summativeGrading": "Not Started",
    "courseModeration": "Done",
    "intranetSync": "Done",  
    "gradeBookStatus": "Pending",
    "notes": "Week 1 completed successfully"
  }'

# Get Activities with Filters
curl -X GET "http://localhost:3001/api/activities?weekNumber=1&status=Pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get Activity Dashboard
curl -X GET http://localhost:3001/api/activities/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Notifications
```bash
# Get Notifications
curl -X GET http://localhost:3001/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send Notification (Manager/Admin only)
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deadline_reminder",
    "data": {
      "message": "Week 2 activities due tomorrow",
      "userId": 1
    }
  }'
```

## Development

### Database Commands
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Create new seeder
npx sequelize-cli seed:generate --name seeder-name

# Reset database
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Redis Queue Monitoring
The application uses Bull queues for background job processing. Monitor queue status via:
- Admin dashboard at `/api/notifications/queue-stats`
- Direct Redis inspection using Redis CLI
- Bull Dashboard (can be added for visual monitoring)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Express rate limiter (100 requests per 15 minutes)
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and content security policy
- **Input Validation**: Sequelize model validation and constraints
- **Role-based Authorization**: Middleware-enforced permission levels

## Error Handling

The application includes comprehensive error handling:
- Sequelize validation errors (400)
- Authentication errors (401)
- Authorization errors (403)  
- Resource not found errors (404)
- Unique constraint violations (409)
- Internal server errors (500)

## Performance Considerations

- **Database Indexing**: Optimized indexes on frequently queried fields
- **Connection Pooling**: Configured database connection pools
- **Redis Caching**: Background job queuing and notification storage
- **Rate Limiting**: Protection against API abuse
- **Pagination**: All list endpoints support pagination

## Deployment

### Environment Variables
Ensure these environment variables are set in production:
- `NODE_ENV=production`
- `JWT_SECRET` - Strong secret key for JWT signing
- `DATABASE_URL` - Production database connection string
- `REDIS_URL` - Production Redis connection string
- `CORS_ORIGIN` - Allowed frontend origins

### Production Considerations
- Use PM2 or similar process manager
- Set up proper logging and monitoring
- Configure database backups
- Use Redis persistence for critical queues
- Set up SSL/TLS termination
- Configure environment-specific rate limits

## Support

For issues or questions:
1. Check the API documentation at `http://localhost:3001/api`
2. Review application logs for error details
3. Test API endpoints using the provided curl examples
4. Verify database and Redis connections via `/health` endpoint

## License

This project is licensed under the MIT License.
