'use client';

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function Footer(): React.JSX.Element {
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackMsg.trim()) {
      alert('Please enter a message before sending.');
      return;
    }

    setIsSubmitting(true);
    emailjs.init('Kz9EVkEtNSW1p6E0Y');

    const params = {
      name: 'Client',
      email: 'teamfinixx@gmail.com',
      message: feedbackMsg,
    };

    const serviceID = 'service_a9sz0qu';
    const templateID = 'template_9q6eoie';

    try {
      await emailjs.send(serviceID, templateID, params);
      alert('Your message sent successfully!!');
      setSubmittedFeedback(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer" style={{ background: '#0e0c15', borderTop: '2px solid #1c1828', padding: '40px 20px 20px 20px', fontFamily: "'Jersey 10', sans-serif", letterSpacing: '1px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', maxWidth: '1000px', margin: '0 auto 30px auto', gap: '40px', textAlign: 'left' }}>
        
        {/* Developers Section */}
        <div style={{ flex: '1 1 180px' }}>
          <h4 style={{ color: '#dfc06f', fontSize: '20px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Developers</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="https://github.com/fts18" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#9692a8' }}>
              <i className="fab fa-github" style={{ marginRight: '8px', color: '#dfc06f' }}></i> Ananay Dubey
            </a>
            <a href="https://github.com/Arunjay126" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#9692a8' }}>
              <i className="fab fa-github" style={{ marginRight: '8px', color: '#dfc06f' }}></i> Arunjay
            </a>
          </div>
        </div>

        {/* Connect Section */}
        <div style={{ flex: '1 1 180px' }}>
          <h4 style={{ color: '#dfc06f', fontSize: '20px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Connect</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="mailto:teamfinixx@gmail.com" style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#9692a8' }}>
              <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#dfc06f' }}></i> Mail Us
            </a>
            <a href="https://chat.whatsapp.com/ECHJEEU1w901D89UMd0c3m" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#9692a8' }}>
              <i className="fab fa-whatsapp" style={{ marginRight: '8px', color: '#dfc06f' }}></i> Discuss Chat
            </a>
          </div>
        </div>

        {/* Feedback Section */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ color: '#dfc06f', fontSize: '20px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Send Feedback</h4>
          {submittedFeedback ? (
            <div style={{ color: '#00ff66', fontSize: '18px', padding: '10px 0' }}>
              ✓ Thank you for your feedback!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                placeholder="Type your message here..."
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                style={{
                  background: '#08060d',
                  border: '2px solid #282335',
                  color: '#fff',
                  padding: '10px',
                  fontSize: '16px',
                  fontFamily: "'Jersey 10', sans-serif",
                  outline: 'none',
                  resize: 'none',
                  height: '80px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting}
                style={{
                  background: '#dfc06f',
                  border: 'none',
                  color: '#0e0c15',
                  padding: '8px',
                  fontSize: '18px',
                  fontFamily: "'Jersey 10', sans-serif",
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                className="feedback-submit-btn"
              >
                {isSubmitting ? 'Sending...' : 'Submit Message'}
              </button>
            </div>
          )}
        </div>

      </div>

      <div style={{ borderTop: '1px solid #1c1828', paddingTop: '20px', color: '#55506a', fontSize: '14px', textAlign: 'center' }}>
        <span>Created By Ananay & Arunjay | </span>
        <span className="far fa-copyright"></span><span> 2026 FINIXX. All rights reserved.</span>
      </div>
    </footer>
  );
}
