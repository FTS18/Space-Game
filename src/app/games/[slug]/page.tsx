'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { gamesMap } from '../../../lib/games';
import { useAuth } from '../../../hooks/useAuth';

interface GamePageProps {
  params: {
    slug: string;
  };
}

export default function GamePage({ params }: GamePageProps): React.JSX.Element {
  const game = gamesMap[params.slug];
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = React.useState<Array<{ username: string; score: number }>>([]);

  if (!game) {
    notFound();
  }

  const configQuery = `?apiKey=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}&authDomain=${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}&projectId=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}&storageBucket=${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}&messagingSenderId=${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}&appId=${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}`;
  const iframeSrc = `${game.src}${configQuery}`;

  const fetchScores = React.useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') return;
    try {
      const q = query(
        collection(db, 'scores'),
        where('game', '==', params.slug)
      );
      const querySnapshot = await getDocs(q);
      const list: Array<{ username: string; score: number }> = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ username: data.username, score: Number(data.score) });
      });
      // Sort in-memory to prevent requiring composite index creation in Firebase Console!
      list.sort((a, b) => b.score - a.score);
      setLeaderboard(list.slice(0, 5));
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  }, [params.slug]);

  React.useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  React.useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'FINIXX_GAME_OVER') {
        const { game, score } = event.data;
        const username = currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0] || 'Gamer') : 'Guest';
        
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') return;
        try {
          await addDoc(collection(db, 'scores'), {
            username,
            game,
            score: Number(score),
            timestamp: new Date()
          });
          console.log("Score uploaded successfully!");
          setTimeout(fetchScores, 1500); // 1.5s delay to let indexer complete!
        } catch (err) {
          console.error("Error writing score:", err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser, fetchScores]);

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  const handleFullscreen = () => {
    const container = document.getElementById('cabinet-container');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
          if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock('landscape' as OrientationLockType).catch((err) => {
              console.log("Orientation lock failed:", err);
            });
          }
        }).catch((err) => {
          console.error("Fullscreen error:", err);
        });
      } else {
        document.exitFullscreen().then(() => {
          if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
            window.screen.orientation.unlock();
          }
        }).catch((err) => {
          console.log("Exit fullscreen or orientation unlock failed:", err);
        });
      }
    }
  };

  return (
    <motion.main
      className="page"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0e0c15',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .game-body-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
        }
        .arcade-cabinet-screen {
            position: relative;
            background: #000;
            overflow: hidden;
            width: 100%;
            height: ${game.isSquare ? '80vh' : '72vh'};
            max-height: ${game.isSquare ? '850px' : '750px'};
            min-height: ${game.isSquare ? '600px' : '500px'};
            border: 2px solid #282335;
            flex-shrink: 0;
        }
        .leaderboard-panel {
            width: 100%;
            margin: 20px auto 40px auto;
            background: #111111;
            border: 2px solid #282335;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        @media (max-width: 1024px) {
            .game-body-layout {
                flex-direction: column !important;
                overflow: visible !important;
            }
            .arcade-cabinet-screen {
                flex: none !important;
                height: auto !important;
                aspect-ratio: ${game.isSquare ? '1 / 1' : '16 / 9'} !important;
                border: 2px solid #282335;
            }
            .leaderboard-panel {
                width: 100% !important;
                margin-top: 15px;
                min-height: auto;
            }
            .cabinet-header-active {
                display: none !important;
            }
            .cabinet-header-title {
                font-size: 18px !important;
            }
            #cabinet-container {
                padding: 10px 15px !important;
            }
        }
      `}</style>

      {/* Background blur cover art */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${game.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px) opacity(0.12)',
          zIndex: 1,
        }}
      />

      <div
        id="cabinet-container"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: '100vh',
          height: 'auto',
          boxSizing: 'border-box',
          padding: '20px 40px',
          background: '#0e0c15',
          overflowY: 'auto'
        }}
      >
        {/* Game Title Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            borderBottom: '2px solid #282335',
            paddingBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href="/" style={{ color: '#dfc06f', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <i className="fas fa-arrow-left"></i>
              <span className="cabinet-header-title" style={{ fontSize: '20px', fontWeight: 'bold' }}>STORE</span>
            </Link>
            <span style={{ color: '#55506a', fontSize: '20px' }}>/</span>
            <span className="cabinet-header-title" style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
              {game.title}
            </span>
          </div>
        </div>

        {/* Game Area Layout Shell */}
        <div className="game-body-layout">
           {/* Widescreen Arcade Frame Iframe Wrapper */}
          <div className="arcade-cabinet-screen">
            {/* Scanline CRT overlay (hidden for scribble to keep canvas sketches clear) */}
            {params.slug !== 'scribble' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.18) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.015), rgba(0, 0, 255, 0.03))',
                  backgroundSize: '100% 4px, 6px 100%',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />
            )}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                overflow: 'hidden',
              }}
              title={game.title}
              scrolling="no"
            />
          </div>

          {/* Live Firestore Leaderboard */}
          <div className="leaderboard-panel">
            <h2 
              style={{ 
                fontFamily: "'Jersey 10', sans-serif", 
                fontSize: '28px', 
                color: '#dfc06f', 
                borderBottom: '2px solid #282335', 
                paddingBottom: '10px', 
                marginTop: '0', 
                letterSpacing: '1.5px',
                textAlign: 'center'
              }}
            >
              🏆 LEADERBOARD
            </h2>
            {leaderboard.length === 0 ? (
              <div 
                style={{ 
                  color: '#55506a', 
                  fontSize: '16px', 
                  textAlign: 'center', 
                  marginTop: '40px',
                  fontFamily: "'Jersey 10', sans-serif",
                  letterSpacing: '1px'
                }}
              >
                NO RECORD YET
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {leaderboard.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      background: '#15002b', 
                      border: '2px solid #282335', 
                      padding: '8px 15px',
                      fontFamily: "'Jersey 10', sans-serif",
                      fontSize: '22px',
                      color: '#fff',
                      boxSizing: 'border-box',
                      letterSpacing: '1px'
                    }}
                  >
                    <span>{idx + 1}. {item.username}</span>
                    <span style={{ color: '#dfc06f' }}>{item.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Retro Game Controller Bar */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '2px solid #282335',
            zIndex: 20,
          }}
        >
          <button
            onClick={handleRestart}
            style={{
              background: '#dfc06f',
              color: '#0e0c15',
              border: '2px solid #dfc06f',
              padding: '8px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: "'Jersey 10', sans-serif",
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
              letterSpacing: '1.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0e0c15';
              e.currentTarget.style.color = '#dfc06f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dfc06f';
              e.currentTarget.style.color = '#0e0c15';
            }}
          >
            RESTART GAME
          </button>
          <button
            onClick={handleFullscreen}
            style={{
              background: '#0e0c15',
              color: '#dfc06f',
              border: '2px solid #dfc06f',
              padding: '8px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: "'Jersey 10', sans-serif",
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
              letterSpacing: '1.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dfc06f';
              e.currentTarget.style.color = '#0e0c15';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0e0c15';
              e.currentTarget.style.color = '#dfc06f';
            }}
          >
            FULLSCREEN
          </button>
        </div>
      </div>
    </motion.main>
  );
}
