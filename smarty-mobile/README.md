# Smarty AI - Mobile App

An intelligent self-development mobile app with AI integration, built with React Native and Expo.

## Features

### 📝 Smart Notes Management

- Create, edit, and delete notes with rich text content
- Organize notes with categories
- Search through notes with intelligent filtering
- Real-time synchronization with the web app

### 🤖 AI Assistant

- Chat with AI about your notes and get insights
- Ask questions and get intelligent responses
- Powered by OpenAI's GPT models
- Context-aware conversations

### 🔍 Smart Search

- Search notes by title, content, or category
- Semantic search powered by Pinecone vector database
- Find relevant notes quickly and efficiently

### 📱 Mobile-First Design

- Beautiful, responsive UI built with React Native Paper
- Smooth animations and transitions
- Optimized for both iOS and Android
- Dark and light theme support

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Native Paper** - Material Design components
- **Zustand** - State management
- **Axios** - HTTP client for API calls
- **Date-fns** - Date formatting utilities

## Backend Integration

This mobile app connects to the same backend as the web application:

- **Next.js API** - RESTful API endpoints
- **OpenAI** - AI chat functionality
- **Pinecone** - Vector database for semantic search
- **Prisma** - Database ORM
- **MongoDB** - Database storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd smartyAIApp
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Run on your preferred platform:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Configuration

The app is configured to connect to the production API at `https://smarty-teal.vercel.app/api`.

To use a different backend:

1. Update the `API_BASE_URL` in `app/config/api.ts`
2. Ensure your backend has the required API endpoints

## Project Structure

```
smartyAIApp/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab navigation screens
│   ├── config/            # Configuration files
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── _layout.tsx        # Root layout component
├── components/            # Reusable UI components
│   ├── Note.tsx          # Individual note component
│   ├── AddEditNoteModal.tsx # Note creation/editing modal
│   └── AIChatModal.tsx   # AI chat interface
├── constants/            # App constants
└── assets/              # Static assets
```

## Key Components

### State Management (Zustand)

- **notesStore.ts** - Manages notes CRUD operations
- **categoriesStore.ts** - Handles category management
- **chatStore.ts** - Controls AI chat functionality

### API Integration

- **api.ts** - Centralized API client with axios
- Handles authentication, error handling, and request/response formatting

### UI Components

- **Note.tsx** - Displays individual notes with expand/collapse
- **AddEditNoteModal.tsx** - Modal for creating and editing notes
- **AIChatModal.tsx** - Full-screen AI chat interface

## Features in Detail

### Notes Management

- Pull-to-refresh for syncing latest notes
- Optimistic updates for better UX
- Error handling with user-friendly messages
- Category filtering and organization

### AI Chat

- Real-time messaging interface
- Message history persistence
- Loading states and error handling
- Context-aware responses about your notes

### Search & Filtering

- Real-time search as you type
- Search across title, content, and categories
- Clear and intuitive search interface

## Development

### Adding New Features

1. **New API Endpoints**: Add to `app/config/api.ts`
2. **State Management**: Create new stores in `app/store/`
3. **UI Components**: Add to `components/` directory
4. **Screens**: Add to `app/(tabs)/` for tab screens

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use React Native Paper components for consistency
- Implement proper error handling and loading states

## Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### Publishing Updates

```bash
expo publish
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
