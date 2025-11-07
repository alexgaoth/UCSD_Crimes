import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabase.js';

// Create and export the Supabase client
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

/**
 * Generate the next incident case number in USER-YYYY-NNN format
 */
export async function generateIncidentCaseNumber() {
  try {
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

export async function submitCrimeReport(reportData) {
  try {
    const incidentCase = await generateIncidentCaseNumber();

    const reportToInsert = {
      incident_case: incidentCase,
      category: reportData.category,
      location: reportData.location,
      date_occurred: reportData.date,
      time_occurred: reportData.time || null,
      summary: reportData.summary,
      contact_info: reportData.contact || null,
      status: 'pending',
      processed: false
    };

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