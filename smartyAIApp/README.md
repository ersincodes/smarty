# 🤖 SmartyAI Notes App

A modern React Native notes application powered by AI, built with Expo and TypeScript.

## ✨ Features

### 🎯 Core Features

- **AI-Powered Note Generation**: Generate comprehensive notes using OpenAI's GPT models
- **Smart Summarization**: Automatic AI summaries for all notes
- **Intelligent Categorization**: AI-powered automatic categorization and tagging
- **Advanced Search**: Full-text search across all notes with filtering
- **Biometric Authentication**: Secure access with Face ID/Touch ID
- **Real-time Sync**: Local SQLite database with async storage backup

### 📱 Mobile-First Design

- **Modern UI**: Beautiful interface with React Native Paper components
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Haptic Feedback**: Native haptic responses for better UX
- **Push Notifications**: Background reminders and updates
- **Share Integration**: Native sharing capabilities
- **Offline Support**: Full functionality without internet connection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and Install**

   ```bash
   cd smartyAIApp
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start Development Server**

   ```bash
   npm start
   ```

4. **Run on Device/Simulator**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web (for testing)
   npm run web
   ```

## 🏗️ Architecture

### Tech Stack

- **Framework**: React Native 0.79.2 with Expo SDK 53
- **Language**: TypeScript
- **State Management**: Zustand with persistence
- **Database**: SQLite with Expo SQLite
- **UI Components**: React Native Paper
- **Navigation**: Expo Router v6 with typed routes
- **AI Integration**: OpenAI GPT-3.5-turbo API

### Project Structure

```
smartyAIApp/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── config/            # Configuration files
│   ├── services/          # API and external services
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── _layout.tsx        # Root layout component
├── components/            # Reusable UI components
├── constants/             # App constants and themes
├── assets/               # Images, fonts, and static assets
└── app.json              # Expo configuration
```

## 🔧 Configuration

### Environment Variables

The app uses the following environment variables:

| Variable                     | Description                    | Required |
| ---------------------------- | ------------------------------ | -------- |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key for AI features | Yes      |

### App Configuration

Key configurations in `app.json`:

- **New Architecture**: Enabled by default
- **Biometric Authentication**: Face ID/Touch ID support
- **Push Notifications**: Configured for production
- **SQLite**: Local database for offline support

## 🤖 AI Features

### Available AI Operations

1. **Generate Notes**: Create comprehensive notes from prompts
2. **Summarize Content**: Generate concise summaries
3. **Enhance Notes**: Improve existing note content
4. **Auto-Categorization**: Intelligent category suggestions
5. **Smart Tagging**: Relevant tag generation

### Usage Example

```typescript
import aiService from "./app/services/aiService";

// Generate a new note
const response = await aiService.generateNote(
  "Meeting notes about project planning"
);

// Summarize existing content
const summary = await aiService.summarizeText(noteContent);
```

## 📱 Mobile Features

### Biometric Authentication

```typescript
import * as LocalAuthentication from "expo-local-authentication";

const authenticateUser = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate to access your notes",
    biometryType: LocalAuthentication.BiometryType.FACE_ID,
  });
  return result.success;
};
```

### Push Notifications

Configured for both iOS and Android with proper permissions and channels.

### Background Tasks

Support for background sync and data updates using Expo Task Manager.

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm test           # Run tests
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: React Native and Expo configurations
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message standards

## 🚀 Deployment

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for production
eas build --platform all
```

### Local Building

```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## 🔒 Security

- **API Keys**: Environment variables with proper validation
- **Biometric Authentication**: Secure local authentication
- **Data Encryption**: SQLite database encryption support
- **Input Validation**: Comprehensive input sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**

   ```bash
   npx expo-doctor  # Check for issues
   npx expo start --clear  # Clear Metro cache
   ```

2. **Dependencies Issues**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **iOS Simulator Issues**
   ```bash
   xcrun simctl erase all  # Reset all simulators
   ```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for the open-source ecosystem
- **OpenAI** for powerful AI capabilities

---

Built with ❤️ using React Native and Expo
