# Firebase Realtime Database Setup Instructions

## 1. Environment Variables Setup

Add this to your `.env.local` file (you're missing the database URL):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZrd-O0TwimDR3YERcoY3n1BRZ60heQEc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-macro-by-ee.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://my-macro-by-ee-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-macro-by-ee
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-macro-by-ee.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=111627339748
NEXT_PUBLIC_FIREBASE_APP_ID=1:111627339748:web:8c66dc62a0b36ac0efe9f1
```

## 2. Deploy Realtime Database Security Rules

**Option 1: Firebase Console (Easiest)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `my-macro-by-ee`
3. Go to **Realtime Database** → **Rules**
4. Replace the existing rules with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

5. Click **"Publish"**

**Option 2: Firebase CLI**
```bash
firebase deploy --only database
```

## 3. Realtime Database Structure

Your app will create this structure:

```
my-macro-by-ee-default-rtdb/
└── users/
    └── {userId}/
        ├── goals/
        │   ├── calories: 2000
        │   ├── protein: 150
        │   ├── carbs: 200
        │   └── fat: 70
        └── meals/
            └── {auto-generated-id}/
                ├── id: "123..."
                ├── date: "2024-06-18"
                ├── timestamp: "2024-06-18T..."
                ├── originalText: "chicken and rice"
                └── macros/
                    ├── protein: 30
                    ├── carbs: 45
                    ├── fat: 5
                    └── calories: 340
```

## 4. Security Rules Explanation

The Realtime Database rules ensure that:
- ✅ Users can only access their own data under `/users/{their-uid}/`
- ✅ No cross-user data access is allowed
- ✅ Unauthenticated users cannot access any data
- ✅ Simple JSON format that's easy to understand

## 5. Testing Your Setup

1. **Add the DATABASE_URL** to your `.env.local` file
2. **Deploy the rules** using Firebase Console
3. **Test your app** - meals should now save to Realtime Database

Your data will be visible in the Firebase Console under Realtime Database! 