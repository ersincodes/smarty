#!/bin/bash

echo "🚀 Deploying Smarty AI Note App Backend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (will open browser if not logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployment URL"
echo "2. Update your React Native app's API_BASE_URL"
echo "3. Add environment variables in Vercel dashboard if needed"
echo ""
echo "🎉 Your backend is now live!" 