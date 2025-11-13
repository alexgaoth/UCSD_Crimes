import React, { useState, useEffect } from 'react';
import { getUpvoteCount } from '../lib/supabaseClient';

/**
 * UpvoteCount component
 * Displays upvote count for an incident case
 * Only renders if count > 0
 *
 * @param {string} incidentCase - The incident case number
 * @param {boolean} compact - Whether to use compact styling (default: false)
 */
export default function UpvoteCount({ incidentCase, compact = false }) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!incidentCase) {
      setIsLoading(false);
      return;
    }

    const fetchUpvoteCount = async () => {
      setIsLoading(true);

      const result = await getUpvoteCount(incidentCase);

      if (result.success) {
        setUpvoteCount(result.count);
      }

      setIsLoading(false);
    };

    fetchUpvoteCount();
  }, [incidentCase]);

  // Don't render if loading or count is 0
  if (isLoading || upvoteCount === 0) {
    return null;
  }

  const className = compact
    ? 'upvote-display upvote-display-compact'
    : 'upvote-display';

  return (
    <span className={className}>
      ↑ {upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}
    </span>
  );
}
