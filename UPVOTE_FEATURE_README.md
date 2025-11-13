# Upvote Feature Implementation

This document describes the upvote feature added to the UCSD Crimes website.

## Overview

The upvote feature allows users to upvote crime reports across the website. Each user can upvote a report once, and the upvote count is displayed next to the upvote button in the modal.

## Implementation Details

### 1. Database Setup

A new Supabase table `report_upvotes` was created to store upvote counts for each incident case.

**To set up the database table:**
1. Go to your Supabase project's SQL Editor
2. Run the SQL script in `create_upvotes_table.sql`
3. This will create the table with proper Row Level Security (RLS) policies

**Table Schema:**
- `incident_case` (text, primary key) - Stores case numbers for both user-submitted (USER-YYYY-NNN) and official reports
- `upvote_count` (integer, default 0) - Number of upvotes for the report
- `created_at` (timestamp) - When the record was created
- `updated_at` (timestamp) - Automatically updated on each change

### 2. Service Layer Functions

Added to `app/src/lib/supabaseClient.js`:

- `getUpvoteCount(incidentCase)` - Fetches the current upvote count for a case
  - Returns `{ success: true, count: number }` on success
  - Returns 0 if record doesn't exist
  - Returns `{ success: false, error }` on error

- `incrementUpvote(incidentCase)` - Increments the upvote count for a case
  - Creates a new record with count 1 if it doesn't exist
  - Increments existing record by 1
  - Returns `{ success: true, count: number }` on success
  - Returns `{ success: false, error }` on error

### 3. Modal Component Updates

Updated `app/src/components/Modal.jsx` to include:

- **State Management:**
  - `upvoteCount` - Current upvote count
  - `isLoadingUpvotes` - Loading state while fetching
  - `hasUpvoted` - Whether the user has already upvoted
  - `isUpvoting` - Loading state while upvoting
  - `upvoteError` - Error message if upvote fails

- **localStorage Integration:**
  - Key: `upvoted_cases`
  - Stores an array of case numbers the user has upvoted
  - Prevents users from upvoting the same case multiple times

- **UI Components:**
  - Upvote button with arrow up icon (↑) or checkmark (✓) when upvoted
  - Displays current upvote count
  - Shows "upvote" or "upvotes" based on count
  - Disabled state after upvoting
  - Error message display

### 4. CSS Styling

Added to `app/src/App.css`:

- `.upvote-button` - Main button styling with green theme matching existing design
- `.upvote-button:hover` - Hover effect with lift animation
- `.upvote-button.upvoted` - Darker green background when upvoted
- `.upvote-button:disabled` - Disabled state styling
- `.upvote-icon`, `.upvote-count`, `.upvote-label` - Component styling
- `.upvote-error` - Error message styling
- `@keyframes upvoteSuccess` - Success animation on upvote
- Mobile responsive styles in media queries

## User Experience

1. **Viewing Upvotes:**
   - When a user opens a crime report modal, the upvote count is automatically fetched and displayed
   - Shows "..." while loading

2. **Upvoting:**
   - Click the upvote button to upvote a report
   - Button changes from "↑" to "✓" after upvoting
   - Background color changes to darker green
   - Button is disabled after upvoting
   - Success animation plays on upvote

3. **Restrictions:**
   - Users can only upvote each case once
   - Upvoted cases are stored in localStorage
   - Button is disabled for cases the user has already upvoted

4. **Error Handling:**
   - If upvote fails, an error message is displayed
   - If loading fails, a default count of 0 is shown
   - Errors are logged to the console for debugging

## Files Modified

1. `create_upvotes_table.sql` - NEW - SQL script to create the Supabase table
2. `app/src/lib/supabaseClient.js` - Added upvote service functions
3. `app/src/components/Modal.jsx` - Added upvote functionality
4. `app/src/App.css` - Added upvote button styles

## Testing Checklist

- [ ] Supabase table created successfully
- [ ] Upvote button appears in modal
- [ ] Upvote count displays correctly
- [ ] User can upvote a case
- [ ] Count increments on upvote
- [ ] Button changes to upvoted state
- [ ] User cannot upvote the same case twice
- [ ] localStorage persists upvoted cases
- [ ] Upvotes work for both user-submitted and official reports
- [ ] Error messages display when upvote fails
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings

## Browser Compatibility

The feature uses:
- localStorage (supported in all modern browsers)
- ES6+ JavaScript (async/await, arrow functions)
- CSS animations and transitions
- React Hooks (useState, useEffect)

All features are supported in:
- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## Future Enhancements

Potential improvements:
- Add downvote functionality
- Show trending reports based on upvotes
- Add sorting by upvote count
- Display total upvotes on cards (not just in modal)
- Add backend validation to prevent abuse
- Rate limiting for upvotes
- Analytics dashboard for most upvoted reports
