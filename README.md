<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/54adf7b8-3b3d-4f8b-8ec0-9814631c7699

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Connect your own Firebase database

1. Copy `.env.example` to `.env.local`.
2. Fill all `VITE_FIREBASE_*` variables from your Firebase project settings.
3. (Optional fallback) If no `VITE_FIREBASE_*` values are provided, the app uses `firebase-applet-config.json`.
4. Start the app with `npm run dev` and confirm Firestore reads/writes work.

