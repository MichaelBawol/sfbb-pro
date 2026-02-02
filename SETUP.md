# SFBB Pro - Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization (or create one)
4. Enter project details:
   - **Name**: SFBB Pro (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for it to provision (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" - this means it worked!

## Step 3: Configure Authentication

1. Go to **Authentication** > **Providers** (left sidebar)
2. Make sure **Email** is enabled (it should be by default)
3. Optionally, go to **Authentication** > **URL Configuration**:
   - Set **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
   - Add any redirect URLs needed

## Step 4: Get Your API Keys

1. Go to **Settings** > **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Your App

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` and try:
1. Register a new account
2. Check your email for verification link
3. Sign in after verifying

## Step 7: Deploy to Vercel (Recommended)

### Option A: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts, then add environment variables:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

## Step 8: Update Supabase URLs

After deploying, update your Supabase settings:

1. Go to Supabase > **Authentication** > **URL Configuration**
2. Update **Site URL** to your Vercel URL (e.g., `https://sfbb-pro.vercel.app`)
3. Add your Vercel URL to **Redirect URLs**

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists and has the correct values
- Restart your dev server after adding/changing `.env`

### "Invalid credentials" on login
- Make sure you verified your email after registration
- Check that your password is at least 6 characters

### Data not saving
- Check the browser console for errors
- Verify your Supabase RLS policies are correctly set up

### Email verification not received
- Check spam folder
- In Supabase, go to **Authentication** > **Email Templates** to customize

## Disabling Email Verification (Development Only)

For faster testing during development:

1. Go to Supabase > **Authentication** > **Providers** > **Email**
2. Toggle off "Confirm email"

**Note**: Re-enable this for production!

## Custom Domain (Optional)

To use a custom domain:

1. In Vercel, go to your project > **Settings** > **Domains**
2. Add your domain and follow DNS instructions
3. Update Supabase URL Configuration with your new domain
