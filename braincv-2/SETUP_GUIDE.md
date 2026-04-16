# 🚀 BrainCV — Complete Setup Guide
**From zero to live at brainresume.site — no coding knowledge needed**

---

## Overview of steps
1. Create Firebase project (5 min)
2. Create GitHub account + upload project (5 min)  
3. Create Vercel account + deploy (3 min)
4. Add secret keys to Vercel (2 min)
5. Connect domain brainresume.site (5 min)

Total time: ~20 minutes

---

## STEP 1 — Create your Firebase project

Firebase handles your user accounts and data storage. It's free.

1. Go to: **https://console.firebase.google.com**
2. Click **"Create a project"**
3. Project name: type **braincv** → click Continue
4. Disable Google Analytics (toggle it off) → click **Create project**
5. Wait ~30 seconds → click **Continue**

### 1a. Enable Authentication
1. In the left sidebar, click **Authentication**
2. Click **"Get started"**
3. Click **Email/Password** → toggle **Enable** → click Save
4. Click **"Add new provider"** → click **Google** → toggle Enable → enter your email → click Save

### 1b. Create the database
1. In the left sidebar, click **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** → click Next
4. Choose location: **asia-northeast3 (Seoul)** → click Enable
5. Wait ~30 seconds for it to create

### 1c. Set the security rules
1. In Firestore, click the **Rules** tab (at the top)
2. Delete everything in the box
3. Copy and paste this exactly:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /resumes/{resumeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /analytics/{resumeId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

### 1d. Register your web app + get keys
1. In the left sidebar, click the **gear icon (⚙)** next to "Project Overview" → **Project settings**
2. Scroll down to **"Your apps"**
3. Click the **`</>`** (web) icon
4. App nickname: type **braincv-web** → click **Register app**
5. You'll see a block of code like this:
```
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "braincv-xxxx.firebaseapp.com",
  projectId: "braincv-xxxx",
  storageBucket: "braincv-xxxx.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345...:web:abc..."
};
```
6. **SAVE THESE VALUES** — copy them to a text file. You'll need them in Step 4.
7. Click **Continue to console**

---

## STEP 2 — Create GitHub account + upload project

GitHub stores your code so Vercel can deploy it.

### 2a. Create GitHub account (skip if you already have one)
1. Go to **https://github.com**
2. Click **Sign up** → enter your email → create password → choose username
3. Verify your email

### 2b. Create a new repository
1. After login, click the **+** button (top right) → **New repository**
2. Repository name: **braincv**
3. Set to **Private** (important — keeps your code safe)
4. Click **Create repository**

### 2c. Upload the project files
1. On the repository page, click **uploading an existing file**
2. Open the **braincv** folder on your computer
3. Select ALL files and folders inside it:
   - `.gitignore`
   - `.env.local.example`
   - `next.config.js`
   - `package.json`
   - `firestore.rules`
   - `lib/` folder
   - `pages/` folder
   - `styles/` folder
4. Drag them ALL into the GitHub upload area
5. Scroll down → click **Commit changes**

✅ Your code is now on GitHub.

---

## STEP 3 — Create Vercel account + deploy

Vercel hosts your website for free.

1. Go to **https://vercel.com**
2. Click **Sign Up** → click **Continue with GitHub** → authorize it
3. On your Vercel dashboard, click **"Add New Project"**
4. You'll see your **braincv** repo listed → click **Import**
5. Leave all settings as default
6. Click **Deploy**

Wait ~2 minutes. You'll see a green ✅ and a preview URL like `braincv-xxxx.vercel.app`.

> ⚠️ The site will show errors right now — that's normal! You need to add your secret keys first (Step 4).

---

## STEP 4 — Add your secret keys to Vercel

This is where you paste the Firebase values you saved in Step 1d, plus your Anthropic API key.

### 4a. Get your Anthropic API key
1. Go to **https://console.anthropic.com**
2. Sign up (or sign in)
3. Click **API Keys** in the left sidebar
4. Click **Create Key** → name it **braincv** → click Create
5. Copy the key that starts with `sk-ant-...` → save it

### 4b. Add all keys to Vercel
1. In Vercel, go to your **braincv** project
2. Click **Settings** (top navigation)
3. Click **Environment Variables** (left sidebar)
4. Add each variable below one by one:

| Name | Value (from your notes) |
|------|------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | The `apiKey` value |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | The `authDomain` value |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | The `projectId` value |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | The `storageBucket` value |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | The `messagingSenderId` value |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | The `appId` value |
| `ANTHROPIC_API_KEY` | Your `sk-ant-...` key |

For each one:
- Paste the Name into the "Key" field
- Paste the Value into the "Value" field
- Make sure **Production**, **Preview**, **Development** are all checked
- Click **Save**

5. After adding all 7 variables, go to **Deployments** tab → click the **3 dots (⋯)** on the latest deployment → click **Redeploy**
6. Wait ~2 minutes

✅ Your app is now fully working at `braincv-xxxx.vercel.app`!

---

## STEP 5 — Connect your domain brainresume.site

### 5a. Add domain in Vercel
1. In Vercel → your project → click **Settings** → **Domains**
2. Type **brainresume.site** → click **Add**
3. Also add **www.brainresume.site** → click **Add**
4. Vercel will show you DNS records to add. Keep this page open.

### 5b. Update DNS at domain.com

You need to point your domain to Vercel's servers.

1. Go to **https://www.domain.com**
2. Sign in → go to **My Account** → **My Domains**
3. Click on **brainresume.site** → click **Manage**
4. Look for **DNS** or **DNS Management** → click it
5. You need to add/edit these records:

**Record 1 — A Record (root domain):**
| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 76.76.21.21 | 3600 |

**Record 2 — CNAME Record (www):**
| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| CNAME | www | cname.vercel-dns.com | 3600 |

> ⚠️ If there's already an A record pointing somewhere else, delete it first, then add the new one.

6. Click **Save** after each record

### 5c. Wait for DNS to propagate

DNS changes take **10 minutes to 48 hours** to go live globally.

To check: go to **https://dnschecker.org** → type **brainresume.site** → see green checkmarks appear

Once live, your site will be at:
- **https://brainresume.site** ✅
- **https://www.brainresume.site** ✅
- User resumes at: **https://brainresume.site/r/username** ✅

---

## STEP 6 — Add your domain to Firebase (important!)

Firebase needs to know your real domain to allow Google login.

1. Go to **Firebase Console** → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Type: **brainresume.site** → click Add
5. Also add: **www.brainresume.site** → click Add

---

## ✅ You're live!

Test your site:
1. Go to **https://brainresume.site**
2. Click "Start for Free"
3. Create an account
4. Complete the brainstorm chat
5. See your resume at **https://brainresume.site/r/your-name**

---

## 🆘 Troubleshooting

**"Module not found" error in Vercel:**
→ Make sure all files were uploaded to GitHub including the `lib/` folder

**"Firebase: Error (auth/unauthorized-domain)":**
→ Go to Firebase → Authentication → Settings → Authorized domains → add your domain

**AI not responding / just showing demo:**
→ Check that `ANTHROPIC_API_KEY` is set correctly in Vercel environment variables → Redeploy

**Domain not loading after 48 hours:**
→ Go to domain.com → DNS → double-check the A record points to exactly `76.76.21.21`

**"Page not found" on resume links:**
→ This is normal until someone creates a resume. Test with your own account first.

---

## 📞 Need help?

Contact: yxmmm.private@gmail.com

---

*BrainCV — Built by Jumaydullaev Mukhammadsiddik*
