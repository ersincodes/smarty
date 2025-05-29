# Smarty AI Note App - API Deployment Guide

## 🚀 Quick Fix for 405 Error

Your React Native app is getting a **405 Method Not Allowed** error because the API endpoints don't exist on your deployed Next.js app. I've created the missing API routes for you.

## 📁 Project Structure

```
smarty-ai-note-app-backend/
├── pages/
│   └── api/
│       ├── notes.ts       # Notes CRUD operations
│       ├── categories.ts  # Categories management
│       └── chat.ts        # AI chat functionality
├── package.json           # Next.js dependencies
├── next.config.js         # Next.js configuration with CORS
├── tsconfig.json          # TypeScript configuration
└── README.md
```

## 🛠️ Setup Instructions

### 1. Create a New Next.js Project Directory

Since you have a React Native app, you need to create a separate directory for the Next.js API:

```bash
# Navigate to your project root
cd /Users/ersinbahar/Documents/smarty

# Create a new directory for the backend
mkdir smarty-backend
cd smarty-backend

# Copy the API files I created
cp ../pages ./pages -r
cp ../package.json ./
cp ../next.config.js ./
cp ../tsconfig.json ./
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the backend directory:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here

# OpenAI (for future AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone (for vector embeddings)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Database (if using Prisma)
DATABASE_URL=your_database_url_here
```

### 4. Local Development

```bash
npm run dev
```

Your API will be available at `http://localhost:3000/api`

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial API setup"
   git remote add origin https://github.com/ersincodes/smarty-backend.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update React Native App:**
   ```typescript
   // In smartyAIApp/app/config/env.ts
   export const ENV = {
     // ... other vars
     API_BASE_URL: "https://your-vercel-app.vercel.app/api",
   };
   ```

### Option 2: Manual Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 3: Other Platforms

- **Netlify**: Deploy as a Next.js site
- **Railway**: Connect GitHub repo
- **Heroku**: Use Next.js buildpack

## 🔧 API Endpoints

### Notes API

- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes` - Update a note
- `DELETE /api/notes` - Delete a note

### Categories API

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category
- `DELETE /api/categories` - Delete a category

### Chat API

- `POST /api/chat` - AI chat with streaming response

## 🐛 Troubleshooting

### 405 Method Not Allowed

- ✅ **Fixed!** The API routes now handle all required HTTP methods

### CORS Issues

- ✅ **Fixed!** CORS headers are configured in `next.config.js`

### Authentication Issues

- Ensure Clerk is properly configured with your secret key
- Check that the React Native app is passing the correct Bearer token

### Deployment Issues

1. Check environment variables are set
2. Verify build succeeds with `npm run build`
3. Check Vercel function logs

## 🔄 Next Steps

### 1. Database Integration (Recommended)

Replace in-memory storage with a real database:

```typescript
// Install Prisma
npm install prisma @prisma/client

// Initialize Prisma
npx prisma init
```

### 2. Vector Embeddings

Add OpenAI embeddings for semantic search:

```typescript
// In notes.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings when creating/updating notes
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: note.content,
});
```

### 3. Production Optimizations

- Add rate limiting
- Implement caching
- Add request validation with Zod
- Set up monitoring with Sentry

## 🧪 Testing the Fix

1. **Deploy the API** to Vercel
2. **Update your React Native app** environment variable
3. **Test the endpoints:**

```bash
# Test GET notes
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-api.vercel.app/api/notes

# Test POST notes
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Test Note","content":"Test content"}' \
     https://your-api.vercel.app/api/notes
```

## 📞 Support

If you encounter any issues:

1. Check the Vercel function logs
2. Verify environment variables are set
3. Test endpoints with curl or Postman
4. Ensure Clerk authentication is working

The 405 error should be completely resolved once you deploy these API routes! 🎉
