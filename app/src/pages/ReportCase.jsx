import React, { useState } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { submitCrimeReport } from '../lib/supabaseClient.js';
import '../pages/Pages.css';

export default function ReportCase() {
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    date: '',
    time: '',
    summary: '',
    contact: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [caseNumber, setCaseNumber] = useState(null);

  const categories = [
    'Theft',
    'Vandalism',
    'Suspicious Activity',
    'Safety Concern',
    'Lost Property',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Submit the report to Supabase
      const result = await submitCrimeReport(formData);

      if (result.success) {
        // Success! Show the case number
        setCaseNumber(result.data.incident_case);
        setSubmitted(true);

        // Reset form after 5 seconds
        setTimeout(() => {
          setSubmitted(false);
          setCaseNumber(null);
          setFormData({
            location: '',
            category: '',
            date: '',
            time: '',
            summary: '',
            contact: ''
          });
        }, 5000);
      } else {
        // Handle error
        setSubmitError(
          result.error?.message ||
          'Failed to submit report. Please try again or contact UCSD Police directly.'
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitError(
        'An unexpected error occurred. Please try again or contact UCSD Police directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Report an Incident"
        description="Report suspicious activity, safety concerns, or incidents at UCSD. Help keep the campus community safe by sharing important information about campus security matters at UC San Diego."
        path="/report-case"
      />
      <Breadcrumbs items={[{ name: 'Report an Incident', path: '/report-case' }]} />
      <PageLayout
        title="Report an Incident"
        subtitle="Help Keep Campus Safe"
      >
      <section className="report-form-section">
        <SectionTitle>Submit Your Report</SectionTitle>
        
        {submitError && (
          <div className="error-message" style={{
            backgroundColor: '#fee',
            border: '1px solid #c33',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            <h3>Submission Error</h3>
            <p>{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#c33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {submitted ? (
          <div className="success-message">
            <h3>Thank you for your report!</h3>
            <p>Your submission has been received and will be reviewed by campus security.</p>
            {caseNumber && (
              <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.1em' }}>
                Case Number: {caseNumber}
              </p>
            )}
            <p style={{ marginTop: '10px', fontSize: '0.9em', opacity: 0.8 }}>
              Your report will be reviewed within 24-48 hours. Approved reports will be displayed on the website.
            </p>
          </div>
        ) : (
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Geisel Library, Warren Lecture Hall"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date Occurred *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time Occurred</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="summary">Incident Description *</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Please provide a detailed description of the incident..."
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Information (Optional)</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email or phone number (if you wish to be contacted)"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <p className="form-note">
                * Required fields. For emergencies, call UCSD Police at (858) 534-4357
              </p>
            </div>
          </form>
        )}
      </section>

      <section className="report-info">
        <SectionTitle>Important Information</SectionTitle>
        <div className="info-cards">
          <div className="info-card">
            <h3>Emergency Contacts</h3>
            <p><strong>UCSD Police:</strong> (858) 534-4357</p>
            <p><strong>Emergency:</strong> 911</p>
          </div>
          <div className="info-card">
            <h3>What to Report</h3>
            <p>• Suspicious activity or persons</p>
            <p>• Theft or vandalism</p>
            <p>• Safety concerns</p>
            <p>• Lost or found property</p>
          </div>
          <div className="info-card">
            <h3>Response Time</h3>
            <p>This website has not yet in collabortion with the UCSD PD yet. Crimes posted will be displayed, but not dcoumented in the Police Department.
               For any matters requiring police action, please call UCSD Police directly.</p>
          </div>
        </div>
      </section>
    </PageLayout>
    </>
  );
}