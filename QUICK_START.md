# Quick Start Guide

## No API Keys Required! 🎉

**The app works immediately without any API keys** - it uses mock flight data automatically.

## Start the App

```bash
./start_all_simple.sh
```

Then open: **http://localhost:5173**

## Test Flight Search

1. Go to **"Search Flights"**
2. Enter:
   - **Origin**: JFK (or any airport code)
   - **Destination**: LAX (or any airport code)
   - **Departure Date**: Any future date
   - **Passengers**: 1
3. Click **"Search Flights"**

You'll see mock flight results immediately!

## Optional: Add Amadeus API for Real Data

If you want real flight data instead of mock data:

1. **Get free API credentials:**
   - Visit: https://developers.amadeus.com/
   - Sign up (free, no credit card)
   - Create a new app
   - Copy your Client ID and Client Secret

2. **Add to .env file:**
```bash
AMADEUS_CLIENT_ID=your-client-id-here
AMADEUS_CLIENT_SECRET=your-client-secret-here
AMADEUS_USE_PRODUCTION=false
```

3. **Restart server:**
```bash
# Stop (Ctrl+C) and restart
./start_all_simple.sh
```

## Troubleshooting "Search Failed"

If you see "Search failed" error:

1. **Check backend logs** - look for error messages
2. **Try without API keys first** - mock data should work
3. **Verify .env file** exists in project root
4. **Check airport codes** - use IATA codes (JFK, LAX, etc.)

## Mock Data Features

Even without API keys, you get:
- ✅ Realistic flight prices
- ✅ Multiple airlines
- ✅ Various flight times
- ✅ Direct and connecting flights
- ✅ All search types (one-way, return, multi-city)

**You can develop and test everything without API keys!**

