# Environment Setup for Admin Profile Features

## Environment Variable Configuration

To use environment variables for the API base URL, create a `.env.local` file in the frontend directory:

### 1. Create Environment File

Create `frontend/.env.local` with the following content:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

### 2. Alternative: Use .env

If `.env.local` is not working, you can also create `frontend/.env`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

### 3. Production Configuration

For production, you can set different values:

```bash
# Production API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## How It Works

The admin settings page (`frontend/src/app/admin/settings/page.tsx`) now uses:

```typescript
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

This means:
- If `NEXT_PUBLIC_API_URL` is set in the environment, it will use that value
- If not set, it will fallback to `http://localhost:5000`

## Important Notes

1. **NEXT_PUBLIC_ prefix**: This prefix is required for Next.js to expose the variable to the browser
2. **Restart required**: After creating/modifying environment files, restart the development server
3. **Git ignore**: The `.env.local` file should be in `.gitignore` to avoid committing sensitive data

## Testing

After setting up the environment variable:

1. Restart the frontend development server
2. Go to `http://localhost:3000/admin/settings`
3. Try uploading a profile picture
4. Check the browser console to see the API URL being used

The console should show:
```
Uploading to: http://localhost:5000/api/auth/profile-picture
```

If you change the environment variable, it should show the new URL. 