# Amadeus API Setup Guide

## Getting Amadeus API Credentials

The app uses **Amadeus Self-Service API** for flight search. You can get free API credentials for testing.

### Step 1: Create Amadeus Developer Account

1. Visit: **https://developers.amadeus.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. Create a free account (no credit card required for test environment)

### Step 2: Create a New App

1. After logging in, go to **"My Self-Service"** → **"My Apps"**
2. Click **"Create New App"**
3. Fill in the form:
   - **App Name**: Prometheus Travel Planner (or any name)
   - **Description**: Travel booking application
   - **Category**: Travel
   - **Callback URL**: `http://localhost:8000` (for testing)
4. Click **"Create"**

### Step 3: Get Your API Credentials

After creating the app, you'll see:
- **API Key** (Client ID)
- **API Secret** (Client Secret)

**Note:** These are for the **Test environment** by default, which is perfect for development.

### Step 4: Add Credentials to .env File

1. Open or create `.env` file in the project root
2. Add your credentials:

```bash
# Amadeus API (Get free API key from https://developers.amadeus.com/)
AMADEUS_CLIENT_ID=your-client-id-here
AMADEUS_CLIENT_SECRET=your-client-secret-here
AMADEUS_USE_PRODUCTION=false
```

3. Replace `your-client-id-here` and `your-client-secret-here` with your actual credentials

### Step 5: Restart the Server

After adding credentials, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
./start_all_simple.sh
```

## Using Mock Data (No API Key Required)

**Good news!** The app works without API keys too. If no Amadeus credentials are provided, it will automatically use **mock flight data** for testing.

This means you can:
- Test the frontend immediately
- Develop and test features
- See how the app works

Mock data includes:
- Realistic flight prices ($200-$1500)
- Multiple airlines (American, Delta, United, Southwest, JetBlue)
- Various flight times and durations
- Direct and connecting flights

## API Limits

**Test Environment:**
- Free tier available
- Limited requests per month
- Perfect for development and testing

**Production Environment:**
- Requires approval from Amadeus
- Higher rate limits
- Set `AMADEUS_USE_PRODUCTION=true` when ready

## Troubleshooting

### "Search failed" Error

If you're getting search failed errors:

1. **Check if .env file exists** in project root
2. **Verify credentials are correct** (no extra spaces)
3. **Check server logs** for detailed error messages
4. **Try without API keys first** - mock data should work

### Mock Data Not Working

If mock data isn't showing:
- Check browser console for errors
- Check backend server logs
- Verify the search form is filled correctly

## Quick Test Without API Keys

You can test the app immediately without any API keys - it will use mock data automatically!

Just start the servers:
```bash
./start_all_simple.sh
```

Then search for flights (e.g., JFK to LAX) and you'll see mock flight results.

