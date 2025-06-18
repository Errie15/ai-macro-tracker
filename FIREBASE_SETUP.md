# Firebase Setup Instructions

## 1. Environment Variables Setup

Create a `.env.local` file in your project root and add your Firebase configuration:

```env
# Firebase Configuration
# Get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 2. How to Get Your Firebase Keys

1. Go to your Firebase project console
2. Click on the gear icon (⚙️) and select "Project settings"
3. Scroll down to "Your apps" section
4. If you don't have a web app, click "Add app" and select the web icon (</>)
5. Copy the configuration values to your `.env.local` file

## 3. Deploy Firestore Security Rules

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 4. Firestore Database Structure

Your app will create the following structure:

```
users/{userId}/
├── meals/{mealId}
├── goals/{goalId}
└── daily/{date}
```

## 5. Authentication Methods Enabled

Based on your Firebase console, you have these authentication methods enabled:
- ✅ Email/Password
- ✅ Google
- ✅ Anonymous

## 6. Security Rules Explanation

The Firestore rules ensure that:
- Users can only access their own data
- All data is stored under `/users/{userId}/`
- No cross-user data access is allowed
- Unauthenticated users cannot access any data

## 7. Important Notes

- **Never commit `.env.local`** to version control
- The `firestore.rules` file can be committed to version control
- Make sure to test your authentication flow before deploying to production
- Consider setting up Firebase Hosting for easy deployment

## 8. Testing Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. You should see the sign-in page
3. Try all three authentication methods:
   - Email/Password signup
   - Google sign-in
   - Anonymous sign-in

4. Verify that users can only see their own data in the Firebase console

## Troubleshooting

- If you get authentication errors, check your Firebase console for enabled sign-in methods
- If you get "Permission denied" errors, verify your Firestore rules are deployed
- Make sure all environment variables are properly set in `.env.local` 