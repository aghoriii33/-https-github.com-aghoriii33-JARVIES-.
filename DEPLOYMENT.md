# X33 Deployment & GitHub Migration Guide

This guide covers how to push your application from AI Studio to a GitHub repository, set up the required environment variables, and configure Firebase and the Gemini API for external hosting (e.g., Vercel, Netlify, Cloud Run).

---

## 1. Exporting to GitHub

AI Studio provides a built-in workflow to push your code directly to GitHub.

1. In the top-right corner of the **AI Studio Editor**, click **Share / Export** (or Settings menu).
2. Select **Export to GitHub**.
3. Authenticate with your GitHub account.
4. Provide a repository name and visibility (Public/Private), then click **Export**.

*(Alternatively, you can select **Export as ZIP**, extract it on your local machine, run `git init`, and push it to your repository manually.)*

---

## 2. Environment Variables & API Keys Setup

When deploying to platforms like Vercel, Netlify, or running locally, you must provide your API keys.

1. Copy `.env.example` to a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add your **Gemini API Key**:
   Create a new API key in Google AI Studio and place it in your `.env` file since server-side Gemini requires it:
   ```env
   GEMINI_API_KEY="AIzaSyYour...GeminiKeyHere"
   ```

---

## 3. Firebase Configuration

Your app is currently programmed to fetch its Firebase configuration at runtime from a `firebase-applet-config.json` file. 

For the app to run outside of AI Studio:

1. Locate the `firebase-applet-config.json` file in the root of your project. 
2. **Important for Vite Builds:** To ensure the JSON file is accessible by the client code after deployment, move it to the `public/` folder, or create the `public/` folder and place it there:
   ```bash
   mkdir -p public
   mv firebase-applet-config.json public/
   ```
3. Your `firebase-applet-config.json` looks like this:
   ```json
   {
     "projectId": "YOUR_PROJECT_ID",
     "appId": "YOUR_APP_ID",
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "firestoreDatabaseId": "YOUR_DATABASE_ID",
     "storageBucket": "YOUR_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_SENDER_ID"
   }
   ```
*(Note: Firebase Web API keys are designed to be public. If you prefer hiding them, you must refactor `src/firebase.ts` to consume them via `import.meta.env.VITE_FIREBASE_API_KEY` style variables instead of a JSON fetch.)*

---

## 4. Local Development

To run the project locally after cloning from GitHub:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Your app will be available at `http://localhost:3000`.

---

## 5. Production Deployment (Full-Stack Express App)

This application is **Full-Stack** and uses an Express.js backend (defined in `server.ts`). It cannot be deployed strictly as a static frontend on services like Vercel or Netlify without serverless function adaptations. 

Deploy it to a Node.js-compatible hosting service such as **Render**, **Railway**, **Heroku**, or **Google Cloud Run**.

**Deployment Settings for your Hosting Provider:**
1. **Environment:** Node.js
2. **Build Command:** `npm run build`
3. **Start Command:** `npm start` (or `node dist/server.cjs`)
4. **Environment Variables:** Provide `GEMINI_API_KEY` and any other secrets required.

*Note: Since the app relies on Firebase Auth and Firestore, ensure that within the Firebase Console, you add your new production domain (e.g., `your-app.onrender.com`) to the **Authorized Domains** under Authentication settings.*
