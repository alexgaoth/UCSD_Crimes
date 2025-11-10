# Send SMS Edge Function

This Supabase Edge Function sends SMS messages via Twilio. It's used for sending verification codes and crime alert notifications.

## Setup

### 1. Install Twilio (if testing locally)
This function uses Twilio's REST API, so no additional dependencies are needed in production.

### 2. Set Environment Variables in Supabase Dashboard

Go to your Supabase project dashboard:
1. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
2. Add the following secrets:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number (e.g., +15551234567)
```

### 3. Deploy the Function

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-sms
```

### 4. Set Secrets via CLI (Alternative)

```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=your_phone_number
```

## Testing Locally

### 1. Create `.env.local` file in `supabase/` directory:

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 2. Start Supabase locally:

```bash
supabase start
```

### 3. Serve the function:

```bash
supabase functions serve send-sms --env-file supabase/.env.local
```

### 4. Test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"phoneNumber":"+15551234567","message":"Test message from UCSD Crime Alerts"}'
```

## Usage

The function expects a JSON body with:
- `phoneNumber`: E.164 format phone number (e.g., `+15551234567`)
- `message`: The SMS message text

Example request:
```json
{
  "phoneNumber": "+15551234567",
  "message": "Your UCSD Crime Alerts verification code is: 123456. Valid for 10 minutes."
}
```

Example response (success):
```json
{
  "success": true,
  "messageSid": "SM1234567890abcdef",
  "status": "queued"
}
```

Example response (error):
```json
{
  "error": "Invalid phone number format. Must be in E.164 format (+1XXXXXXXXXX)"
}
```

## Twilio Setup

1. Sign up for a Twilio account at https://www.twilio.com/try-twilio
2. Get a Twilio phone number (free trial includes one)
3. Find your Account SID and Auth Token in the Twilio Console
4. For production, consider upgrading your Twilio account

## Security Notes

- Never commit `.env.local` or any files containing Twilio credentials
- Twilio credentials are stored as Supabase secrets and not exposed to the client
- The function validates phone number format to prevent abuse
- CORS is enabled for the frontend to call this function
- Consider adding rate limiting for production use

## Troubleshooting

### "Missing Twilio credentials" error
- Make sure you've set all three environment variables in Supabase dashboard or `.env.local`
- Redeploy the function after setting secrets

### "Invalid phone number format" error
- Ensure phone numbers are in E.164 format: `+1` followed by 10 digits
- Example: `+15551234567`

### "Failed to send SMS" error
- Check Twilio account balance
- Verify Twilio phone number is correct
- Check Twilio Console for detailed error messages
- For trial accounts, verify the recipient number is verified in Twilio

## Cost Considerations

- Twilio charges per SMS sent (typically $0.0075 - $0.01 per message for US)
- Free trial accounts have limited credits and can only send to verified numbers
- Monitor usage in Twilio Console to avoid unexpected charges
- Consider implementing daily/monthly SMS limits
