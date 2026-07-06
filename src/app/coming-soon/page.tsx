'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ComingSoon(): React.JSX.Element {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter a valid email address.');
      return;
    }
    alert(`Thank you! ${email} has been registered for updates.`);
    setEmail('');
  };

  return (
    <>
      <div className="ripple"></div>

      <motion.main 
        className="page"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '100vh',
          background: 'url(/assets/images/backgrounds/08.webp) no-repeat center',
          backgroundSize: 'cover',
          color: '#fff',
          fontFamily: "'Jersey 10', sans-serif !important",
        }}
      >
        <div className="box-coming-canvas" style={{ width: '100%', padding: '15px' }}>
          <div className="inner-box" style={{ width: '100%' }}>
            <div className="logo" style={{ marginBottom: '2rem' }}>
              <Link href="/">
                <img 
                  alt="back" 
                  className="lazy" 
                  src="https://img.icons8.com/external-simple-solid-edt.graphics/100/000000/external-Back-arrows-simple-solid-edt.graphics.png" 
                  style={{
                    position: 'fixed',
                    bottom: '25px',
                    right: '15px',
                    maxWidth: '60px',
                    filter: 'invert(100%)',
                    cursor: 'pointer',
                  }}
                />
              </Link>
            </div>
            <h1 className="title" style={{ marginBottom: '3rem', fontWeight: 900, fontSize: '72px', color: '#dfc06f' }}>Coming Soon</h1>
            <form 
              onSubmit={handleSubscribe}
              className="box-sub" 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '570px',
                width: '100%',
                margin: 'auto',
                padding: '10px',
                borderRadius: '0px', /* Flat, Boxy */
                backgroundColor: '#111111', /* Solid background */
                marginBottom: '4rem',
                border: '2px solid #333333', /* Solid border */
              }}
            >
              <input 
                type="email" 
                className="form-control" 
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  backgroundColor: 'transparent',
                  border: '0px',
                  outline: '0px',
                  fontSize: '1.2rem',
                  color: '#fff',
                  fontFamily: "'Jersey 10', sans-serif",
                }}
              />
              <button 
                type="submit" 
                className="btn btn-submit"
                style={{
                  padding: '10px 25px',
                  background: '#dfc06f', /* Soft gold */
                  borderRadius: '0px', /* Flat, Boxy */
                  color: '#0e0c15', /* Contrast dark text */
                  border: '2px solid #dfc06f',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: "'Jersey 10', sans-serif",
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0e0c15';
                  e.currentTarget.style.color = '#dfc06f';
                  e.currentTarget.style.borderColor = '#dfc06f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dfc06f';
                  e.currentTarget.style.color = '#0e0c15';
                  e.currentTarget.style.borderColor = '#dfc06f';
                }}
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </motion.main>
    </>
  );
}
