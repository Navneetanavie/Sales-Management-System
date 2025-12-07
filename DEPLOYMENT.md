# Deployment Guide

Follow these steps to deploy your Sales Management System.

## Prerequisites
- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account (for Frontend).
- A [Render](https://render.com/) account (for Backend).

## Step 1: Push to GitHub
Since I have already initialized Git locally, you need to push this to a remote repository.

1.  **Create a new repository** on GitHub (e.g., `sales-ms`).
2.  **Run these commands** in your terminal (replace `YOUR_USERNAME` and `REPO_NAME`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render
1.  Log in to your **Render** dashboard.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    - **Name**: `salesms-backend` (or similar)
    - **Root Directory**: `backend`
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
5.  Click **Create Web Service**.
6.  **Copy the URL** provided by Render (e.g., `https://salesms-backend.onrender.com`). You will need this for the frontend.

## Step 3: Configure Frontend for Production
Before deploying the frontend, we need to tell it where the backend lives.

1.  Open `frontend/src/services/api.js`.
2.  Change the `API_BASE_URL` to use an environment variable:
    ```javascript
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/sales';
    ```
    *(I will make this change for you automatically in the next step)*.

## Step 4: Deploy Frontend to Vercel
1.  Log in to your **Vercel** dashboard.
2.  Click **Add New...** > **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    - **Framework Preset**: Vite
    - **Root Directory**: `frontend`
5.  **Environment Variables**:
    - Add a new variable:
        - **Name**: `VITE_API_URL`
        - **Value**: The Render Backend URL from Step 2 (e.g., `https://salesms-backend.onrender.com/api/sales`)
6.  Click **Deploy**.

## Done!
Your application should now be live.
- **Frontend**: Accessible via the Vercel URL.
- **Backend**: Running on Render.
