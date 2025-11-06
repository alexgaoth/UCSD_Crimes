/**
 * Supabase Client Configuration
 *
 * This file initializes the Supabase client for the UCSD Crime Logs application.
 * The client is used to submit user crime reports to the Supabase database.
 *
 * Environment Variables (set in Vite):
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables (Vite uses VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set. ' +
    'User report submissions will not work. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create and export the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Generate the next incident case number in USER-YYYY-NNN format
 *
 * @returns {Promise<string>} The next case number (e.g., "USER-2025-001")
 */
export async function generateIncidentCaseNumber() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  try {
    // Call the database function to generate the next case number
    const { data, error } = await supabase.rpc('get_next_incident_case');

    if (error) {
      console.error('Error generating case number:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to generate incident case number:', error);
    // Fallback: generate a temporary case number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999) + 1;
    return `USER-${year}-${String(random).padStart(3, '0')}`;
  }
}

/**
 * Submit a user crime report to Supabase
 *
 * @param {Object} reportData - The report data to submit
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export async function submitCrimeReport(reportData) {
  if (!supabase) {
    return {
      success: false,
      error: { message: 'Supabase client is not configured' }
    };
  }

  try {
    // Generate incident case number
    const incidentCase = await generateIncidentCaseNumber();

    // Prepare the data for insertion
    const reportToInsert = {
      incident_case: incidentCase,
      category: reportData.category,
      location: reportData.location,
      date_occurred: reportData.date,
      time_occurred: reportData.time || null,
      summary: reportData.summary,
      contact_info: reportData.contact || null,
      status: 'pending', // All submissions start as pending
      processed: false
    };

    // Insert the report
    const { data, error } = await supabase
      .from('user_reports')
      .insert([reportToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error submitting report:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to submit report:', error);
    return { success: false, error };
  }
}
