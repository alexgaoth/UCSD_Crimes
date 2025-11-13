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

/**
 * Get upvote count for a specific incident case
 */
export async function getUpvoteCount(incidentCase) {
  try {
    const { data, error } = await supabase
      .from('report_upvotes')
      .select('upvote_count')
      .eq('incident_case', incidentCase)
      .single();

    if (error) {
      // If record doesn't exist, return 0
      if (error.code === 'PGRST116') {
        return { success: true, count: 0 };
      }
      console.error('Error fetching upvote count:', error);
      return { success: false, error };
    }

    return { success: true, count: data.upvote_count };
  } catch (error) {
    console.error('Failed to fetch upvote count:', error);
    return { success: false, error };
  }
}

/**
 * Increment upvote count for a specific incident case
 * Creates the record if it doesn't exist
 */
export async function incrementUpvote(incidentCase) {
  try {
    // First, try to fetch the existing record
    const { data: existing, error: fetchError } = await supabase
      .from('report_upvotes')
      .select('upvote_count')
      .eq('incident_case', incidentCase)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing upvote:', fetchError);
      return { success: false, error: fetchError };
    }

    let newCount;

    if (existing) {
      // Record exists, increment it
      newCount = existing.upvote_count + 1;
      const { data, error } = await supabase
        .from('report_upvotes')
        .update({ upvote_count: newCount })
        .eq('incident_case', incidentCase)
        .select()
        .single();

      if (error) {
        console.error('Error incrementing upvote:', error);
        return { success: false, error };
      }

      return { success: true, count: data.upvote_count };
    } else {
      // Record doesn't exist, create it with count of 1
      const { data, error } = await supabase
        .from('report_upvotes')
        .insert([{ incident_case: incidentCase, upvote_count: 1 }])
        .select()
        .single();

      if (error) {
        console.error('Error creating upvote record:', error);
        return { success: false, error };
      }

      return { success: true, count: data.upvote_count };
    }
  } catch (error) {
    console.error('Failed to increment upvote:', error);
    return { success: false, error };
  }
}