// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

interface SMSRequest {
  phoneNumber: string;
  message: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials in environment variables')
      return new Response(
        JSON.stringify({
          error: 'Server configuration error. Please contact administrator.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { phoneNumber, message }: SMSRequest = await req.json()

    // Validate input
    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: phoneNumber and message'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+1\d{10}$/
    if (!phoneRegex.test(phoneNumber)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid phone number format. Must be in E.164 format (+1XXXXXXXXXX)'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Sending SMS to ${phoneNumber}`)

    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

    const formData = new URLSearchParams({
      To: phoneNumber,
      From: TWILIO_PHONE_NUMBER,
      Body: message
    })

    // Create basic auth header
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    // Send SMS via Twilio API
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const twilioData = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioData)
      return new Response(
        JSON.stringify({
          error: twilioData.message || 'Failed to send SMS',
          details: twilioData
        }),
        {
          status: twilioResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`SMS sent successfully. SID: ${twilioData.sid}`)

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioData.sid,
        status: twilioData.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke this function locally (for testing):

  1. Run `supabase start` (if not already started)
  2. Set environment variables:
     export TWILIO_ACCOUNT_SID=your_account_sid
     export TWILIO_AUTH_TOKEN=your_auth_token
     export TWILIO_PHONE_NUMBER=your_twilio_number
  3. Run `supabase functions serve send-sms --env-file supabase/.env.local`
  4. Make a POST request:

  curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"phoneNumber":"+15551234567","message":"Test message"}'
*/
