# MongoDB Cloud Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier is sufficient for development)

## Step 2: Get Connection String
1. In your MongoDB Atlas dashboard, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>`, `<password>`, and `<dbname>` with your actual values

## Step 3: Create .env File
Create a `.env` file in the backend directory with the following content:

```env
# MongoDB Cloud Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/thedailyherald?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Step 4: Install Dependencies
```bash
npm install
```

## Step 5: Seed the Database
```bash
node seed.js
```

## Step 6: Start the Server
```bash
npm start
```

## Sample MongoDB Atlas Connection String Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/thedailyherald?retryWrites=true&w=majority
```

## Important Notes:
- Replace `username` with your MongoDB Atlas username
- Replace `password` with your MongoDB Atlas password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- The database name `thedailyherald` will be created automatically
- Make sure your IP address is whitelisted in MongoDB Atlas Network Access 