# SMS Notification Subscription Feature

This document describes the SMS notification subscription feature for the UCSD Crime Logs webapp, which allows users to receive SMS alerts when new crime reports are added.

## Overview

The SMS notification system uses:
- **React** for the frontend UI components
- **Supabase** for database and authentication
- **Twilio** for sending SMS messages
- **Supabase Edge Functions** to securely handle Twilio API calls

## Features Implemented

### 1. Floating Widget Button
- ✅ Fixed position at bottom-left corner (20px from bottom, 20px from left)
- ✅ Circular button with bell icon (🔔) for unsubscribed users
- ✅ Checkmark icon (✓) for subscribed users
- ✅ Pulsing animation to draw attention
- ✅ High z-index to stay above other content
- ✅ Visible on all pages
- ✅ Responsive design (smaller on mobile)

### 2. Subscription Modal
- ✅ Modal overlay (reusing existing modal styling)
- ✅ Phone number input field with +1 prefix
- ✅ Real-time phone number formatting
- ✅ Phone number validation
- ✅ Loading state while sending SMS
- ✅ Error handling and display
- ✅ Privacy notice

### 3. SMS Verification Page
- ✅ Route: `/sms-verification`
- ✅ 6-digit code input (separate boxes for each digit)
- ✅ Auto-focus on next input
- ✅ Paste support for verification codes
- ✅ Resend code functionality with 60-second cooldown
- ✅ Edit phone number option
- ✅ Error states for invalid/expired codes
- ✅ Success state with automatic redirect
- ✅ Responsive design

### 4. Backend Integration
- ✅ Supabase database table: `sms_subscribers`
- ✅ Twilio integration via Supabase Edge Function
- ✅ Verification code generation (6-digit)
- ✅ Code expiry (10 minutes)
- ✅ Rate limiting (60-second resend cooldown)
- ✅ Phone number validation (E.164 format)
- ✅ Subscription status tracking

## File Structure

```
UCSD_Crimes/
├── app/
│   ├── src/
│   │   ├── components/
│   │   │   └── SMSWidget.jsx          # Floating widget component
│   │   ├── pages/
│   │   │   └── SMSVerification.jsx    # Verification page
│   │   ├── lib/
│   │   │   └── smsService.js          # SMS service functions
│   │   ├── App.jsx                     # Updated with SMS routes
│   │   ├── App.css                     # Widget styles
│   │   └── pages/Pages.css             # Verification page styles
│   └── .env.example                    # Environment variables template
└── supabase/
    ├── functions/
    │   └── send-sms/
    │       ├── index.ts                # Twilio Edge Function
    │       └── README.md               # Edge Function documentation
    └── .env.example                    # Edge Function env template
```

## Setup Instructions

### 1. Supabase Database Setup

The `sms_subscribers` table has already been created. If you need to recreate it, run:

```sql
CREATE TABLE sms_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  code_expires_at TIMESTAMP,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  last_notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phone_verified ON sms_subscribers(phone_number, verified);
```

### 2. Twilio Account Setup

1. Sign up for a Twilio account at https://www.twilio.com/try-twilio
2. Get a Twilio phone number (free trial includes one)
3. Find your Account SID and Auth Token in the Twilio Console Dashboard

**Note:** Free trial accounts can only send SMS to verified phone numbers. You'll need to verify recipient numbers in the Twilio Console, or upgrade your account.

### 3. Supabase Edge Function Deployment

#### Set Twilio Secrets in Supabase

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
3. Add the following secrets:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (e.g., +15551234567)

**Option B: Via Supabase CLI**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=your_phone_number
```

#### Deploy the Edge Function

```bash
# Deploy the send-sms function
supabase functions deploy send-sms
```

### 4. Local Development (Optional)

To test the Edge Function locally:

1. Create `supabase/.env.local`:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

2. Start Supabase locally:
```bash
supabase start
```

3. Serve the function:
```bash
supabase functions serve send-sms --env-file supabase/.env.local
```

4. Test with curl:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"phoneNumber":"+15551234567","message":"Test message"}'
```

## User Flow

1. **Widget Interaction**
   - User clicks the floating widget button on any page
   - Modal opens with phone number input

2. **Phone Number Submission**
   - User enters phone number (formatted automatically)
   - Clicks "Send Verification Code"
   - System generates 6-digit code
   - Code stored in database with 10-minute expiry
   - SMS sent via Twilio

3. **Verification**
   - User redirected to `/sms-verification` page
   - Enters 6-digit code received via SMS
   - System validates code and expiry
   - On success: User marked as verified subscriber

4. **Subscription Status**
   - Widget shows checkmark icon for subscribed users
   - Clicking widget shows subscription status
   - Option to unsubscribe available

## API Functions

### Frontend (smsService.js)

- **`sendVerificationCode(phoneNumber)`**
  - Generates 6-digit code
  - Stores in database with 10-min expiry
  - Sends SMS via Twilio Edge Function
  - Returns: `{ success: boolean, error?: string }`

- **`verifyCode(phoneNumber, code)`**
  - Validates code against database
  - Checks expiry
  - Marks subscriber as verified
  - Returns: `{ success: boolean, error?: string }`

- **`resendVerificationCode(phoneNumber)`**
  - Rate-limited resend (60-second cooldown)
  - Returns: `{ success: boolean, error?: string }`

- **`unsubscribe(phoneNumber)`**
  - Removes subscriber from database
  - Returns: `{ success: boolean, error?: string }`

- **`notifyAllSubscribers(crimeReport)`**
  - Sends SMS to all verified subscribers
  - Includes crime report details and link
  - Returns: `{ success: boolean, stats?: { total, successful, failed } }`

### Edge Function (send-sms)

**Endpoint:** `https://your-project.supabase.co/functions/v1/send-sms`

**Request:**
```json
{
  "phoneNumber": "+15551234567",
  "message": "Your verification code is: 123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "messageSid": "SM1234567890abcdef",
  "status": "queued"
}
```

**Response (Error):**
```json
{
  "error": "Invalid phone number format"
}
```

## Security Considerations

- ✅ Twilio credentials stored as Supabase secrets (not exposed to frontend)
- ✅ Phone numbers sanitized before storage
- ✅ Rate limiting on verification attempts (60-second cooldown)
- ✅ HTTPS for all API calls
- ✅ Verification codes expire after 10 minutes
- ✅ Phone number validation (E.164 format)

## Error Handling

The system handles the following error scenarios:

- Invalid phone number format
- Twilio API failures
- Network errors
- Expired verification codes
- Too many verification attempts
- Database connection issues
- Missing Twilio credentials

Each error displays a user-friendly message with appropriate guidance.

## Testing Checklist

- [ ] Widget appears on all pages
- [ ] Modal opens/closes correctly
- [ ] Phone number validation works
- [ ] Phone number formatting works
- [ ] SMS is sent successfully
- [ ] Verification code is received
- [ ] Code validation works
- [ ] Expired codes are rejected
- [ ] Resend functionality works with cooldown
- [ ] User can edit phone number
- [ ] Success state shows after verification
- [ ] Widget changes for subscribed users
- [ ] Unsubscribe functionality works
- [ ] Errors display properly
- [ ] Responsive design works on mobile
- [ ] Widget doesn't overlap other UI elements

## Twilio Cost Considerations

- Twilio charges per SMS sent (typically $0.0075 - $0.01 per message for US)
- Free trial accounts:
  - Have limited credits (~$15)
  - Can only send to verified numbers
  - Display "Sent from a Twilio Trial Account" in messages
- Monitor usage in Twilio Console to avoid unexpected charges
- Consider implementing daily/monthly SMS limits for production

## Future Enhancements

### Notification Trigger System
To actually send notifications when new reports are added:

1. **Option A: Database Trigger (Recommended)**
   - Create a Supabase database trigger on the `incidents` or `user_reports` table
   - Trigger calls the `send-sms` Edge Function for all verified subscribers
   - Automatic, real-time notifications

2. **Option B: Scheduled Cron Job**
   - Use Supabase Edge Functions with cron
   - Check for new reports every N minutes
   - Send batch notifications

3. **Option C: Manual Trigger**
   - Admin panel button to send notifications
   - Useful for testing and controlled notifications

### Additional Features
- Customizable notification preferences (categories, locations)
- Unsubscribe link in SMS messages
- SMS history/logs
- Multiple phone number support per user
- International phone number support

## Troubleshooting

### Widget Not Showing
- Check that `SMSWidget` is imported and rendered in `App.jsx`
- Verify CSS is loaded correctly
- Check browser console for errors

### SMS Not Sending
- Verify Twilio credentials are set correctly
- Check Twilio account balance
- Verify phone number format (+1XXXXXXXXXX)
- Check Edge Function logs in Supabase dashboard
- For trial accounts, verify recipient number in Twilio Console

### Verification Code Not Working
- Check code expiry (10 minutes)
- Verify code matches database record
- Check for typos in code entry
- Try resending code

### Database Errors
- Verify `sms_subscribers` table exists
- Check table permissions
- Review Supabase logs

## Support

For issues or questions:
1. Check Twilio Console for SMS delivery status
2. Review Supabase Edge Function logs
3. Check browser console for frontend errors
4. Review database logs in Supabase dashboard

## License

This feature is part of the UCSD Crime Logs webapp.
