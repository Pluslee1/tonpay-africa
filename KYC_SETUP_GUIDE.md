# 🔐 KYC Setup Guide - Sumsub Integration

## Overview

The KYC (Know Your Customer) system is integrated with Sumsub for identity verification. Users who want to transfer more than ₦50,000 must:
1. Register an account
2. Complete KYC verification via Sumsub

## Setup Instructions

### 1. Get Sumsub Credentials

1. Sign up at [Sumsub](https://sumsub.com)
2. Create a new application
3. Get your credentials:
   - **App Token** (SUMSUB_APP_TOKEN)
   - **Secret Key** (SUMSUB_SECRET_KEY)
   - **Base URL** (usually `https://api.sumsub.com`)

### 2. Configure Environment Variables

Add to `server/.env`:

```env
SUMSUB_APP_TOKEN=your_app_token_here
SUMSUB_SECRET_KEY=your_secret_key_here
SUMSUB_BASE_URL=https://api.sumsub.com
```

### 3. Configure Sumsub Webhook

1. Go to Sumsub Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/kyc/webhook`
3. Select events:
   - `applicantReviewed`
   - `applicantStatusChanged`
4. Save webhook configuration

### 4. Test the Integration

1. Start your backend server
2. Register a new user
3. Navigate to Settings → KYC tab
4. Click "Start KYC Verification"
5. Complete the Sumsub verification flow

## How It Works

### User Flow

1. **Transfer Attempt > ₦50,000**
   - User tries to transfer more than ₦50,000
   - System checks if user is registered
   - If not registered → Prompt to register
   - If registered but not KYC verified → Prompt to complete KYC

2. **Registration**
   - User creates account
   - After registration, redirected to KYC page
   - Toast notification: "Complete KYC to transfer above ₦50,000"

3. **KYC Verification**
   - User clicks "Start KYC Verification" in Settings
   - System creates Sumsub access token
   - Sumsub widget loads in KYC page
   - User completes verification steps
   - Status updates via webhook

4. **Status Updates**
   - Webhook receives status from Sumsub
   - User KYC status updated in database
   - User can now transfer above ₦50,000

### API Endpoints

- `POST /api/kyc/init` - Initialize KYC (create access token)
- `GET /api/kyc/status` - Get current KYC status
- `POST /api/kyc/webhook` - Sumsub webhook handler

### KYC Statuses

- `pending` - KYC not started
- `initiated` - KYC started, in progress
- `verified` - KYC approved
- `rejected` - KYC rejected

## Files Created/Modified

### Backend
- `server/services/sumsub.js` - Sumsub API integration
- `server/routes/kyc.js` - KYC routes
- `server/models/User.js` - Added Sumsub fields to KYC schema

### Frontend
- `src/pages/KYC.jsx` - KYC verification page
- `src/pages/SendToBank.jsx` - Added transfer limit check
- `src/pages/Settings.jsx` - Updated KYC tab
- `src/pages/Register.jsx` - Added KYC prompt after registration

## Testing

### Test Transfer Limit

1. Try to transfer ₦60,000 without registration
   - Should show: "Registration Required"
   - Should have "Register Now" button

2. Register and try again
   - Should show: "KYC Verification Required"
   - Should have "Complete KYC" button

3. Complete KYC
   - Should be able to transfer above ₦50,000

### Test KYC Flow

1. Go to Settings → KYC tab
2. Click "Start KYC Verification"
3. Complete Sumsub verification
4. Check status updates
5. Verify transfer limit is lifted

## Troubleshooting

### KYC Widget Not Loading

- Check browser console for errors
- Verify Sumsub credentials are correct
- Check network tab for API calls

### Webhook Not Working

- Verify webhook URL is accessible
- Check webhook signature verification
- Check server logs for errors

### Status Not Updating

- Manually check status: `GET /api/kyc/status`
- Verify webhook is receiving events
- Check database for user KYC status

## Production Checklist

- [ ] Sumsub credentials configured
- [ ] Webhook URL configured in Sumsub
- [ ] Webhook signature verification enabled
- [ ] Test KYC flow end-to-end
- [ ] Monitor webhook logs
- [ ] Set up alerts for failed verifications

