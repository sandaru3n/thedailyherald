# The Daily Herald Backend API

A comprehensive backend API for The Daily Herald newspaper admin panel built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 📰 **Article Management** - Full CRUD operations for news articles
- 📂 **Category Management** - Create, update, and manage news categories
- 👥 **Admin Management** - Multi-admin support with different roles
- 📊 **Dashboard Analytics** - Comprehensive statistics and analytics
- 🔍 **Search & Filtering** - Advanced search and filtering capabilities
- 📄 **Pagination** - Efficient pagination for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env.example config.env
   ```
   
   Edit `config.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/thedailyherald
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/login` | Admin login | Public |
| POST | `/api/auth/register` | Register new admin | Public |
| GET | `/api/auth/profile` | Get admin profile | Private |
| PUT | `/api/auth/profile` | Update admin profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | Admin logout | Private |

### Articles

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/articles` | Get all articles (paginated) | Public |
| GET | `/api/articles/:id` | Get article by ID | Public |
| GET | `/api/articles/slug/:slug` | Get article by slug | Public |
| POST | `/api/articles` | Create new article | Private |
| PUT | `/api/articles/:id` | Update article | Private |
| DELETE | `/api/articles/:id` | Delete article | Private |
| PUT | `/api/articles/:id/publish` | Publish article | Private |
| PUT | `/api/articles/:id/unpublish` | Unpublish article | Private |

### Categories

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/:id` | Get category by ID | Public |
| GET | `/api/categories/slug/:slug` | Get category by slug | Public |
| POST | `/api/categories` | Create new category | Private |
| PUT | `/api/categories/:id` | Update category | Private |
| DELETE | `/api/categories/:id` | Delete category | Private |
| PUT | `/api/categories/:id/toggle` | Toggle category status | Private |
| PUT | `/api/categories/reorder` | Reorder categories | Private |

### Admin Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/dashboard` | Get dashboard statistics | Private |
| GET | `/api/admin/admins` | Get all admins | Private |
| POST | `/api/admin/admins` | Create new admin | Private |
| PUT | `/api/admin/admins/:id` | Update admin | Private |
| DELETE | `/api/admin/admins/:id` | Delete admin | Private |
| GET | `/api/admin/analytics` | Get analytics data | Private |
| GET | `/api/admin/system` | Get system information | Private |

## Authentication

All private endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

- **Admin**: Full access to all features
- **Editor**: Can create, edit, and publish articles, but cannot manage admins or categories

## Database Models

### Article
- Title, content, excerpt
- Category and author references
- Status (draft, published, archived)
- SEO fields (title, description, keywords)
- View tracking and read time calculation

### Category
- Name, description, slug
- Color and icon for UI
- Article count tracking
- Active/inactive status

### Admin
- Email, password, name
- Role-based permissions
- Active/inactive status
- Last login tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/thedailyherald` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## Development

### Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (if configured)
```

### File Structure

```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── config.env       # Environment variables
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return consistent JSON responses with error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 