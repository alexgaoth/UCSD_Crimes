import { supabase } from './supabaseClient.js';

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code to phone number
 * This calls the Supabase Edge Function which handles Twilio integration
 */
export async function sendVerificationCode(phoneNumber) {
  try {
    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Calculate expiry time (10 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    // Check if subscriber already exists
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('sms_subscribers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      console.error('Error checking existing subscriber:', fetchError);
      return { success: false, error: 'Database error. Please try again.' };
    }

    // Upsert subscriber record with new verification code
    const { error: upsertError } = await supabase
      .from('sms_subscribers')
      .upsert({
        phone_number: phoneNumber,
        verification_code: verificationCode,
        code_expires_at: expiryTime.toISOString(),
        verified: false,
      }, {
        onConflict: 'phone_number'
      });

    if (upsertError) {
      console.error('Error storing verification code:', upsertError);
      return { success: false, error: 'Failed to store verification code. Please try again.' };
    }

    // Call Supabase Edge Function to send SMS via Twilio
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        phoneNumber,
        message: `Your UCSD Crime Alerts verification code is: ${verificationCode}. Valid for 10 minutes.`
      }
    });

    if (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: 'Failed to send SMS. Please check your phone number and try again.'
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in sendVerificationCode:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Verify the code entered by user
 */
export async function verifyCode(phoneNumber, code) {
  try {
    // Fetch subscriber record
    const { data: subscriber, error: fetchError } = await supabase
      .from('sms_subscribers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError || !subscriber) {
      console.error('Error fetching subscriber:', fetchError);
      return { success: false, error: 'Phone number not found. Please request a new code.' };
    }

    // Check if code has expired
    const expiryTime = new Date(subscriber.code_expires_at);
    const now = new Date();

    if (now > expiryTime) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Verify the code
    if (subscriber.verification_code !== code) {
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Mark subscriber as verified
    const { error: updateError } = await supabase
      .from('sms_subscribers')
      .update({
        verified: true,
        subscribed_at: new Date().toISOString(),
        verification_code: null,
        code_expires_at: null
      })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('Error updating subscriber:', updateError);
      return { success: false, error: 'Failed to verify subscription. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in verifyCode:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(phoneNumber) {
  try {
    // Check rate limiting - allow max 3 attempts per hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: subscriber, error: fetchError } = await supabase
      .from('sms_subscribers')
      .select('created_at, code_expires_at')
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking subscriber:', fetchError);
      return { success: false, error: 'Database error. Please try again.' };
    }

    // Simple rate limiting: if last code was sent less than 60 seconds ago, deny
    if (subscriber && subscriber.code_expires_at) {
      const lastCodeTime = new Date(subscriber.code_expires_at);
      lastCodeTime.setMinutes(lastCodeTime.getMinutes() - 10); // Subtract the 10 min validity to get send time
      const now = new Date();
      const secondsSinceLastCode = (now - lastCodeTime) / 1000;

      if (secondsSinceLastCode < 60) {
        return {
          success: false,
          error: 'Please wait at least 60 seconds before requesting a new code.'
        };
      }
    }

    // Reuse sendVerificationCode
    return await sendVerificationCode(phoneNumber);
  } catch (error) {
    console.error('Unexpected error in resendVerificationCode:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Unsubscribe from SMS notifications
 */
export async function unsubscribe(phoneNumber) {
  try {
    const { error } = await supabase
      .from('sms_subscribers')
      .delete()
      .eq('phone_number', phoneNumber);

    if (error) {
      console.error('Error unsubscribing:', error);
      return { success: false, error: 'Failed to unsubscribe. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in unsubscribe:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Send notification to all verified subscribers
 * This should be called when a new crime report is added
 * Note: This is typically called from the backend/admin panel, not from client
 */
export async function notifyAllSubscribers(crimeReport) {
  try {
    // Fetch all verified subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('sms_subscribers')
      .select('phone_number')
      .eq('verified', true);

    if (fetchError) {
      console.error('Error fetching subscribers:', fetchError);
      return { success: false, error: 'Failed to fetch subscribers.' };
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, message: 'No subscribers to notify.' };
    }

    // Construct notification message
    const message = `New crime report at UCSD: ${crimeReport.category} at ${crimeReport.location}. View details: ${window.location.origin}`;

    // Send SMS to all subscribers via Edge Function
    const results = await Promise.allSettled(
      subscribers.map(subscriber =>
        supabase.functions.invoke('send-sms', {
          body: {
            phoneNumber: subscriber.phone_number,
            message
          }
        })
      )
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`SMS notifications sent: ${successful} successful, ${failed} failed`);

    return {
      success: true,
      stats: {
        total: subscribers.length,
        successful,
        failed
      }
    };
  } catch (error) {
    console.error('Unexpected error in notifyAllSubscribers:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while sending notifications.'
    };
  }
}
