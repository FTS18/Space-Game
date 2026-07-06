'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion as framerMotion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import Footer from '../../components/layout/Footer';

export default function History(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ game: string; score: number; date: string }>>([]);

  useEffect(() => {
    document.body.classList.remove('disabledScroll');
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const usernameResolved = currentUser.displayName || currentUser.email?.split('@')[0] || 'Gamer';
        fetchUserHistory(usernameResolved);
      } else {
        setHistory([]);
        if (!loading) router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, loading]);

  const fetchUserHistory = async (usernameResolved: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'scores'),
        where('username', '==', usernameResolved),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          game: data.game,
          score: data.score,
          date: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleDateString() : new Date().toLocaleDateString()
        });
      });
      setHistory(list);
    } catch (err) {
      console.error("Error fetching user history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cabinet-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0e0c15' }}>
        <div style={{ color: '#dfc06f', fontSize: '28px', fontFamily: "'Jersey 10', sans-serif" }}>LOADING SESSIONS...</div>
      </div>
    );
  }

  if (!user) {
    return null; // redirecting
  }

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
          width: 460px;
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

        .history-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .history-scroll::-webkit-scrollbar-track {
          background: #0e0c15;
        }
        .history-scroll::-webkit-scrollbar-thumb {
          background: #282335;
          border: 1px solid #0e0c15;
        }
        .history-scroll::-webkit-scrollbar-thumb:hover {
          background: #dfc06f;
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
              SCORE LOGS
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '20px', color: '#dfc06f', fontFamily: "'Jersey 10', sans-serif", letterSpacing: '1.5px', marginBottom: '15px', textTransform: 'uppercase', textAlign: 'center' }}>
                🎮 PLAYER HISTORY
              </div>
              
              {history.length === 0 ? (
                <p style={{ color: '#55506a', fontSize: '18px', fontFamily: "'Jersey 10', sans-serif", textAlign: 'center', margin: '30px 0', letterSpacing: '0.5px' }}>
                  NO GAMEPLAY LOGS RECORDED YET
                </p>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', paddingRight: '5px' }} className="history-scroll">
                  {history.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: '#0e0c15', 
                        border: '2px solid #282335', 
                        padding: '10px 15px',
                        fontFamily: "'Jersey 10', sans-serif",
                        fontSize: '22px',
                        color: '#fff',
                        letterSpacing: '1px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ textTransform: 'uppercase', color: '#fff' }}>{item.game}</span>
                        <span style={{ fontSize: '14px', color: '#55506a', letterSpacing: '0.5px' }}>{item.date}</span>
                      </div>
                      <span style={{ color: '#dfc06f', fontSize: '28px', fontWeight: 'bold' }}>{item.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="insert-coin-note">
              INSERT COIN TO CONTINUE
            </div>
          </div>
        </div>
        <Footer />
      </framerMotion.main>
    </>
  );
}
