import React, { useState } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a server
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        location: '',
        category: '',
        date: '',
        time: '',
        summary: '',
        contact: ''
      });
    }, 3000);
  };

  return (
    <PageLayout
      title="Report an Incident"
      subtitle="Help Keep Campus Safe"
    >
      <section className="report-form-section">
        <SectionTitle>Submit Your Report</SectionTitle>
        
        {submitted ? (
          <div className="success-message">
            <h3>Thank you for your report!</h3>
            <p>Your submission has been received and will be reviewed by campus security.</p>
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
              <button type="submit" className="submit-button">
                Submit Report
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
  );
}