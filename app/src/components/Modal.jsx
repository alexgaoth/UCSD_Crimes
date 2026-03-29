import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { getUpvoteCount, incrementUpvote, getComments, submitComment } from '../lib/supabaseClient';

// Helper function to check if a report is user-submitted
const isUserSubmitted = (caseNumber) => {
  return caseNumber && caseNumber.startsWith('USER-');
};

// Helper functions for localStorage management
const UPVOTED_CASES_KEY = 'upvoted_cases';

const getUpvotedCases = () => {
  try {
    const stored = localStorage.getItem(UPVOTED_CASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading upvoted cases from localStorage:', error);
    return [];
  }
};

const addUpvotedCase = (incidentCase) => {
  try {
    const upvoted = getUpvotedCases();
    if (!upvoted.includes(incidentCase)) {
      upvoted.push(incidentCase);
      localStorage.setItem(UPVOTED_CASES_KEY, JSON.stringify(upvoted));
    }
  } catch (error) {
    console.error('Error saving upvoted case to localStorage:', error);
  }
};

const hasUserUpvoted = (incidentCase) => {
  const upvoted = getUpvotedCases();
  return upvoted.includes(incidentCase);
};

const ANIMALS = [
  ['Otter',    '🦦'], ['Fox',      '🦊'], ['Bear',     '🐻'], ['Penguin',  '🐧'],
  ['Wolf',     '🐺'], ['Deer',     '🦌'], ['Rabbit',   '🐰'], ['Panda',    '🐼'],
  ['Koala',    '🐨'], ['Tiger',    '🐯'], ['Elephant', '🐘'], ['Dolphin',  '🐬'],
  ['Owl',      '🦉'], ['Eagle',    '🦅'], ['Seal',     '🦭'], ['Hedgehog', '🦔'],
  ['Raccoon',  '🦝'], ['Parrot',   '🦜'], ['Flamingo', '🦩'], ['Hawk',     '🐦'],
];

// Deterministic pick from UUID so same comment always gets same animal
function getAnonymousAnimal(id) {
  const hex = (id || '').replace(/-/g, '').slice(0, 8);
  const num = parseInt(hex, 16) || 0;
  return ANIMALS[num % ANIMALS.length];
}

function PersonAvatar() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <rect width="32" height="32" fill="#182B49"/>
      <circle cx="16" cy="13" r="5.5" fill="white"/>
      <path d="M4 30 C4 22 10 18 16 18 C22 18 28 22 28 30Z" fill="white"/>
    </svg>
  );
}

function formatCommentTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Modal({ isOpen, onClose, report }) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isLoadingUpvotes, setIsLoadingUpvotes] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvoteError, setUpvoteError] = useState(null);

  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // Fetch upvotes + comments when modal opens or report changes
  useEffect(() => {
    if (!isOpen || !report) return;

    setHasUpvoted(hasUserUpvoted(report.incident_case));

    const fetchUpvoteCount = async () => {
      setIsLoadingUpvotes(true);
      setUpvoteError(null);
      const result = await getUpvoteCount(report.incident_case);
      if (result.success) setUpvoteCount(result.count);
      else setUpvoteError('Failed to load upvote count');
      setIsLoadingUpvotes(false);
    };

    const fetchComments = async () => {
      setIsLoadingComments(true);
      const result = await getComments(report.incident_case);
      if (result.success) setComments(result.data);
      setIsLoadingComments(false);
    };

    // Reset comment form
    setCommentText('');
    setAuthorName('');
    setShowNameInput(false);
    setCommentError(null);

    fetchUpvoteCount();
    fetchComments();
  }, [isOpen, report]);

  const handleUpvote = async () => {
    if (hasUpvoted || isUpvoting || !report) return;

    setIsUpvoting(true);
    setUpvoteError(null);

    const result = await incrementUpvote(report.incident_case);

    if (result.success) {
      setUpvoteCount(result.count);
      setHasUpvoted(true);
      addUpvotedCase(report.incident_case);
    } else {
      setUpvoteError('Failed to upvote. Please try again.');
    }

    setIsUpvoting(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    const result = await submitComment(report.incident_case, commentText, authorName);

    if (result.success) {
      setComments(prev => [...prev, result.data]);
      setCommentText('');
      setAuthorName('');
      setShowNameInput(false);
    } else {
      setCommentError('Failed to post comment. Please try again.');
    }

    setIsSubmittingComment(false);
  };

  if (!isOpen || !report) return null;

  const userSubmitted = isUserSubmitted(report.incident_case);
  const websiteUrl = window.location.href.split('#')[0] + '#/';

  const handleShare = async (platform) => {
    const shareText = `UCSD Security Alert - ${report.category}\n` +
                      `Location: ${report.location}\n` +
                      `Date: ${report.date_occurred}\n` +
                      `Case #${report.incident_case}\n` +
                      `Summary: ${report.summary}\n\n` +
                      `View more incidents: ${websiteUrl}`;

    if (platform === 'sms') {
      const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
      window.location.href = smsUrl;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Incident details copied to clipboard! You can now paste this in Instagram DMs or any other app.');
      }).catch(() => {
        alert('Unable to copy. Please select and copy the text manually.');
      });
    } else if (platform === 'screenshot') {
      await handleScreenshot();
    }
  };

  const handleScreenshot = async () => {
    try {
      const modalElement = document.querySelector('.modal-content');
      if (!modalElement) return;

      const shareSection = modalElement.querySelector('.modal-share-section');
      const closeButton = modalElement.querySelector('.modal-close');

      if (shareSection) shareSection.style.display = 'none';
      if (closeButton) closeButton.style.display = 'none';

      const canvas = await html2canvas(modalElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const overlay = clonedDoc.querySelector('.modal-overlay');
          if (overlay) overlay.style.background = 'transparent';
        }
      });

      if (shareSection) shareSection.style.display = '';
      if (closeButton) closeButton.style.display = '';

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to create screenshot. Please try again.');
          return;
        }

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'incident.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], 'ucsd-incident.png', { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: `UCSD Security Alert - ${report.category}`,
              text: `Location: ${report.location}\nDate: ${report.date_occurred}\nView more: ${websiteUrl}`
            });
          } catch (err) {
            if (err.name !== 'AbortError') fallbackDownload(canvas);
          }
        } else {
          fallbackDownload(canvas);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to create screenshot. Please try again or use the copy/SMS options.');
    }
  };

  const fallbackDownload = (canvas) => {
    const link = document.createElement('a');
    link.download = `ucsd-incident-${report.incident_case}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    alert('Screenshot saved! You can now share it via Instagram, SMS, or any other app.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${userSubmitted ? 'modal-content-user-submitted' : 'modal-content-official'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{report.location}</h2>
          <div className="modal-meta">
            <span className="modal-badge">{report.category}</span>
            <span className="modal-case-id">#{report.incident_case}</span>
            {userSubmitted ? (
              <span className="badge-source badge-user-submitted">User-Submitted Report</span>
            ) : (
              <span className="badge-source badge-official">Official Police Report</span>
            )}
            <div className="upvote-container">
              <button
                className={`upvote-button-round ${hasUpvoted ? 'upvoted' : ''}`}
                onClick={handleUpvote}
                disabled={hasUpvoted || isUpvoting || isLoadingUpvotes}
                title={hasUpvoted ? 'You have already upvoted this report' : 'Upvote this report'}
              >
                <span className="upvote-icon">{hasUpvoted ? '\u2713' : '\u2191'}</span>
              </button>
              <div className="upvote-stats">
                <span className="upvote-count-modal">
                  {isLoadingUpvotes ? '...' : upvoteCount}
                </span>
                <span className="upvote-label-modal">
                  {upvoteCount === 1 ? 'upvote' : 'upvotes'}
                </span>
              </div>
            </div>
          </div>
          {upvoteError && (
            <div className="upvote-error">{upvoteError}</div>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Summary</h3>
            <p>{report.summary}</p>
          </div>

          <div className="modal-details">
            <div className="modal-detail-item">
              <span className="detail-label">Date Occurred</span>
              <span className="detail-value">{report.date_occurred}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Time Occurred</span>
              <span className="detail-value">{report.time_occurred || 'N/A'}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Date Reported</span>
              <span className="detail-value">{report.date_reported}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Status</span>
              <span className={`status status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
                {report.disposition}
              </span>
            </div>
          </div>

          <div className="modal-share-section">
            <h3>Share This Report</h3>
            <div className="share-buttons">
              <button className="share-button screenshot-button" onClick={() => handleShare('screenshot')}>
                <span className="share-icon"></span>
                Share Screenshot
              </button>
              <button className="share-button sms-button" onClick={() => handleShare('sms')}>
                <span className="share-icon"></span>
                Share via SMS
              </button>
              <button className="share-button copy-button" onClick={() => handleShare('copy')}>
                <span className="share-icon"></span>
                Copy Details
              </button>
            </div>
            <p className="share-note">Screenshot option works best on mobile devices for sharing to Instagram Stories or DMs</p>
          </div>

          {/* Comments section */}
          <div className="modal-comments-section">
            <h3>Comments {!isLoadingComments && `(${comments.length})`}</h3>

            {isLoadingComments ? (
              <p className="comments-loading">Loading comments...</p>
            ) : (
              <>
                {comments.length === 0 ? (
                  <p className="comments-empty">No comments yet. Be the first to comment.</p>
                ) : (
                  <div className="comments-list">
                    {comments.map((c) => {
                      const isAnon = !c.author_name;
                      const [animalName, animalEmoji] = getAnonymousAnimal(c.id);
                      const displayName = isAnon ? `Anonymous ${animalName}` : c.author_name;
                      return (
                        <div key={c.id} className="comment-item">
                          <div className="comment-header">
                            {isAnon ? (
                              <div className="comment-avatar comment-avatar-anon">
                                <span className="comment-avatar-emoji">{animalEmoji}</span>
                              </div>
                            ) : (
                              <div className="comment-avatar comment-avatar-named">
                                <PersonAvatar />
                              </div>
                            )}
                            <div className="comment-meta">
                              <span className={`comment-author${isAnon ? ' anonymous' : ''}`}>
                                {displayName}
                              </span>
                              <span className="comment-time">{formatCommentTime(c.created_at)}</span>
                            </div>
                          </div>
                          <p className="comment-text">{c.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <textarea
                    className="comment-textarea"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />

                  <div className="comment-form-footer">
                    <div className="comment-anon-toggle">
                      {showNameInput ? (
                        <input
                          type="text"
                          className="comment-name-input"
                          placeholder="Your name (optional)"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          maxLength={80}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="comment-anon-text"
                          onClick={() => setShowNameInput(true)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setShowNameInput(true)}
                        >
                          I dont want to be anonymous
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="comment-submit-btn"
                      disabled={!commentText.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>

                  {commentError && (
                    <div className="comment-error">{commentError}</div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
