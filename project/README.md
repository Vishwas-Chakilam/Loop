# Loop - Habit Tracker App

A beautiful, production-ready habit tracking app built with Expo, React Native, and Supabase.

## Features

- 🎯 **Habit Creation & Management** - Create, edit, and delete habits with custom colors and icons
- 📅 **Calendar View** - Visual calendar showing your habit completion history
- 📊 **Analytics & Insights** - Detailed progress tracking and streak analytics
- 🔥 **Streak Tracking** - Monitor your consistency with streak counters
- 🌙 **Dark Mode Support** - Automatic theme switching with user preferences
- 🔔 **Smart Notifications** - Customizable reminders for your habits
- 👤 **User Authentication** - Secure sign up, sign in, and password reset
- ☁️ **Cloud Sync** - All data synced across devices with Supabase
- 📱 **Responsive Design** - Optimized for all screen sizes

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Navigation**: Expo Router
- **Icons**: Lucide React Native
- **Storage**: Supabase Database with Row Level Security
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/create_initial_schema.sql`
   - Copy your Supabase URL and anon key

4. Configure environment variables:
   ```bash
   # .env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The app uses three main tables:

- **habits**: Store habit information (title, description, color, icon, etc.)
- **habit_completions**: Track daily completions for each habit
- **user_preferences**: Store user settings (dark mode, notifications, etc.)

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## App Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main app tabs
├── _layout.tsx      # Root layout with AuthProvider
└── index.tsx        # Initial routing logic

components/          # Reusable UI components
contexts/           # React contexts (Auth)
hooks/              # Custom hooks
lib/                # Supabase client
types/              # TypeScript type definitions
utils/              # Utility functions
```

## Key Features Implementation

### Authentication Flow
- Onboarding screen for new users
- Sign up/Sign in with email and password
- Password reset functionality
- Automatic session management

### Habit Management
- Create habits with custom colors and icons
- Toggle completion status
- Real-time sync across devices
- Soft delete with archive functionality

### Analytics
- Daily, weekly, monthly, and yearly views
- Streak calculations
- Completion rate tracking
- Visual progress charts

### User Experience
- Auto-refresh when returning to Today tab
- Optimistic UI updates
- Error handling with user-friendly messages
- Loading states throughout the app

## Production Considerations

- ✅ Row Level Security implemented
- ✅ Input validation and sanitization
- ✅ Error handling and user feedback
- ✅ Responsive design for all devices
- ✅ Performance optimizations
- ✅ Secure authentication flow
- ✅ Data backup and export capabilities
- ✅ Offline-first architecture considerations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.