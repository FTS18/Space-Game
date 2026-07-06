'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion as framerMotion } from 'framer-motion';
import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import Footer from '../../../components/layout/Footer';

export default function Profile(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.remove('disabledScroll');
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && !loading) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, loading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully.");
      router.push('/login');
    } catch (err: any) {
      alert(`Logout Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="cabinet-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0e0c15' }}>
        <div style={{ color: '#dfc06f', fontSize: '28px', fontFamily: "'Jersey 10', sans-serif" }}>LOADING PROFILE...</div>
      </div>
    );
  }

  if (!user) {
    return null; // redirecting
  }

  const usernameResolved = user.displayName || user.email?.split('@')[0] || 'Gamer';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .cabinet-bg {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: #0d0d0d url(/assets/images/backgrounds/13.webp) no-repeat center;
          background-size: cover;
          position: relative;
          overflow: hidden;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .cabinet-bg::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 4px, 6px 100%;
          pointer-events: none;
        }

        .cabinet-frame {
          width: 420px;
          max-width: 100%;
          background: rgba(17, 17, 17, 0.92);
          backdrop-filter: blur(10px);
          border: 2px solid #282335;
          border-radius: 0px;
          position: relative;
          z-index: 10;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.9);
          box-sizing: border-box;
        }

        .marquee-title {
          font-family: 'Jersey 10', sans-serif !important;
          font-size: 34px;
          color: #dfc06f;
          text-align: center;
          margin-bottom: 20px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          text-shadow: none;
        }

        .arcade-btn {
          width: 100%;
          background: #dfc06f;
          border: 2px solid #dfc06f;
          color: #0e0c15;
          padding: 12px;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          font-family: 'Jersey 10', sans-serif !important;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.2s ease;
          margin-top: 25px;
          box-sizing: border-box;
        }

        .arcade-btn:hover {
          background: #0e0c15;
          color: #dfc06f;
          border-color: #dfc06f;
        }

        .insert-coin-note {
          font-family: 'Jersey 10', sans-serif !important;
          font-size: 18px;
          color: #dfc06f;
          margin-top: 25px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          animation: retro-blink 1.2s infinite step-end;
        }

        @keyframes retro-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      ` }} />

      <framerMotion.main 
        className="cabinet-bg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'space-between', padding: '40px 20px 0 20px' }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <div className="cabinet-frame">
            <div className="marquee-title">
              PLAYER PROFILE
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#dfc06f', fontFamily: "'Jersey 10', sans-serif", letterSpacing: '1px', marginBottom: '5px' }}>
                WELCOME BACK,
              </div>
              <div style={{ fontSize: '32px', color: '#fff', fontFamily: "'Jersey 10', sans-serif", letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>
                {usernameResolved}
              </div>

              <div style={{ width: '100%', borderTop: '2px solid #282335', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '20px', fontFamily: "'Jersey 10', sans-serif", color: '#9692a8', textAlign: 'left' }}>
                <div>
                  <span style={{ color: '#dfc06f', marginRight: '10px' }}>EMAIL:</span> 
                  <span style={{ color: '#fff' }}>{user.email || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: '#dfc06f', marginRight: '10px' }}>ACCOUNT TYPE:</span> 
                  <span style={{ color: '#fff', textTransform: 'uppercase' }}>{user.providerData[0]?.providerId === 'google.com' ? 'Google Auth' : 'Finixx Account'}</span>
                </div>
                <div>
                  <span style={{ color: '#dfc06f', marginRight: '10px' }}>STATUS:</span> 
                  <span style={{ color: '#00ff66' }}>ACTIVE</span>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="arcade-btn"
              >
                LOGOUT
              </button>
            </div>
            
            <div className="insert-coin-note">
              PLAYER VERIFIED
            </div>
          </div>
        </div>
        <Footer />
      </framerMotion.main>
    </>
  );
}
