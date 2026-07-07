"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { gamesMap } from "../../../lib/games";
import { useAuth } from "../../../hooks/useAuth";

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function GamePage({ params }: GamePageProps): React.JSX.Element {
  const { slug } = use(params);
  const game = gamesMap[slug];
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = React.useState<
    Array<{ username: string; score: number }>
  >([]);
  const [showMobileScores, setShowMobileScores] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("finixx_muted") === "true") {
        setIsMuted(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FINIXX_MUTE', muted: isMuted }, '*');
    }
  }, [isMuted]);

  // Hide mobile top header on game page for max screen real estate
  React.useEffect(() => {
    const topHeader = document.querySelector('.mobile-top-header') as HTMLElement | null;
    if (topHeader) topHeader.style.display = 'none';
    return () => {
      if (topHeader) topHeader.style.display = '';
    };
  }, []);

  const configQuery = `?apiKey=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""}&authDomain=${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ""}&projectId=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}&storageBucket=${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""}&messagingSenderId=${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ""}&appId=${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""}`;
  const iframeSrc = game ? `${game.src}${configQuery}` : '';

  if (!game) notFound();

  const fetchScores = React.useCallback(async () => {
    if (
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_api_key_here"
    )
      return;
    try {
      const q = query(collection(db, "scores"), where("game", "==", slug));
      const querySnapshot = await getDocs(q);
      const list: Array<{ username: string; score: number }> = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ username: data.username, score: Number(data.score) });
      });
      list.sort((a, b) => b.score - a.score);
      setLeaderboard(list.slice(0, 5));
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  }, [slug]);

  React.useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  React.useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === "FINIXX_GAME_OVER") {
        const { game, score } = event.data;
        const username = currentUser
          ? currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Gamer"
          : "Guest";

        if (
          !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_api_key_here"
        )
          return;
        try {
          await addDoc(collection(db, "scores"), {
            username,
            game,
            score: Number(score),
            timestamp: new Date(),
          });
          console.log("Score uploaded successfully!");
          setTimeout(fetchScores, 1500);
        } catch (err) {
          console.error("Error writing score:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentUser, fetchScores]);

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("finixx_muted", String(newMuted));
    if (iframeRef.current?.contentWindow) {
      // Signal the game iframe
      iframeRef.current.contentWindow.postMessage({ type: 'FINIXX_MUTE', muted: newMuted }, '*');
      // Direct DOM muting for same-origin iframes (audio/video elements)
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.querySelectorAll('audio, video').forEach((el) => {
            (el as HTMLMediaElement).muted = newMuted;
          });
        }
      } catch {
        // cross-origin or restricted, ignore
      }
    }
  };

  const handleFullscreen = () => {
    const container = document.getElementById("cabinet-container");
    if (container) {
      if (!document.fullscreenElement) {
        container
          .requestFullscreen()
          .then(() => {
            if (
              window.screen &&
              window.screen.orientation &&
              window.screen.orientation.lock
            ) {
              window.screen.orientation
                .lock("landscape" as OrientationLockType)
                .catch((err) => {
                  console.log("Orientation lock failed:", err);
                });
            }
          })
          .catch((err) => {
            console.error("Fullscreen error:", err);
          });
      } else {
        document
          .exitFullscreen()
          .then(() => {
            if (
              window.screen &&
              window.screen.orientation &&
              window.screen.orientation.unlock
            ) {
              window.screen.orientation.unlock();
            }
          })
          .catch((err) => {
            console.log("Exit fullscreen or orientation unlock failed:", err);
          });
      }
    }
  };

  const leaderboardContent = (
    <>
      {leaderboard.length === 0 ? (
        <div
          style={{
            color: "#55506a",
            fontSize: "16px",
            textAlign: "center",
            marginTop: "30px",
            fontFamily: "'Jersey 10', sans-serif",
            letterSpacing: "1px",
          }}
        >
          NO RECORD YET
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {leaderboard.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#15002b",
                border: "2px solid #282335",
                padding: "8px 15px",
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "22px",
                color: "#fff",
                boxSizing: "border-box",
                letterSpacing: "1px",
              }}
            >
              <span>
                {idx + 1}. {item.username}
              </span>
              <span style={{ color: "#dfc06f" }}>{item.score}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <motion.main
      className="page"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0e0c15",
        position: "relative",
        overflow: "visible",
      }}
    >
      <style>{`
        /* ── Desktop layout ─────────────────────────────── */
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
            height: ${game.isSquare ? "80vh" : "72vh"};
            max-height: ${game.isSquare ? "850px" : "750px"};
            min-height: ${game.isSquare ? "400px" : "320px"};
            border: 2px solid #282335;
            flex-shrink: 0;
        }
        .leaderboard-panel {
            width: 100%;
            margin: 0 auto 40px auto;
            background: #111111;
            border: 2px solid #282335;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        .controller-bar {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #282335;
            z-index: 20;
        }
        .controller-btn {
            flex: 1 1 140px;
            min-width: 130px;
            max-width: 260px;
            text-align: center;
            padding: 10px 20px;
            font-size: 18px;
            font-weight: bold;
            font-family: 'Jersey 10', sans-serif;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.2s ease;
            letter-spacing: 1.5px;
            box-sizing: border-box;
        }

        /* Mobile action bar — hidden on desktop */
        .mobile-action-bar {
            display: none;
        }
        /* Mobile scores overlay — hidden by default */
        .mobile-scores-overlay {
            display: none;
        }

        /* ── Tablet (≤ 1024px) ──────────────────────────── */
        @media (max-width: 1024px) {
            .arcade-cabinet-screen {
                flex: none !important;
                height: auto !important;
                aspect-ratio: ${game.isSquare ? "1 / 1" : "16 / 9"} !important;
                min-height: unset !important;
                max-height: none !important;
            }
            .leaderboard-panel {
                width: 100% !important;
                margin-top: 0;
                min-height: auto;
            }
            .cabinet-header-active {
                display: none !important;
            }
            .cabinet-header-title {
                font-size: 18px !important;
            }
            #cabinet-container {
                padding: 10px 12px 30px 12px !important;
                overflow-y: visible !important;
            }
        }

        /* ── Mobile (≤ 900px): FULL-SCREEN GAME, NO SCROLL ─ */
        @media (max-width: 900px) {
            /* Page container: fixed to viewport, top header is hidden */
            #cabinet-container {
                position: fixed !important;
                top: 0 !important;          /* top header hidden via JS */
                bottom: 50px !important;    /* mobile-bottom-hud height */
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: unset !important;
                padding: 0 !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
            }
            /* Compact breadcrumb bar */
            .game-title-header {
                flex-shrink: 0 !important;
                padding: 4px 10px !important;
                margin-bottom: 0 !important;
                min-height: 34px !important;
            }
            .game-title-header .cabinet-header-title {
                font-size: 14px !important;
            }
            /* Game body takes all remaining height */
            .game-body-layout {
                flex: 1 !important;
                min-height: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                gap: 0 !important;
                display: flex !important;
                flex-direction: column !important;
            }
            /* Iframe fills all remaining space */
            .arcade-cabinet-screen {
                flex: 1 !important;
                height: 0 !important;
                min-height: 0 !important;
                max-height: none !important;
                aspect-ratio: unset !important;
                width: 100% !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: none !important;
            }
            .controller-bar {
                display: none !important;
            }
            .desktop-header-controls {
                display: none !important;
            }
            /* Mobile compact action bar */
            .mobile-action-bar {
                display: flex !important;
                flex-shrink: 0 !important;
                height: 38px !important;
                background: #0e0c15 !important;
                border-top: 1px solid #282335 !important;
                align-items: center !important;
                justify-content: space-around !important;
                gap: 0 !important;
                padding: 0 !important;
            }
            /* Mobile scores overlay — sits between top of screen and bottom nav */
            .mobile-scores-overlay {
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                bottom: 50px !important;
                left: 0 !important;
                right: 0 !important;
                background: rgba(14, 12, 21, 0.97) !important;
                z-index: 99997 !important;
                flex-direction: column !important;
                padding: 14px !important;
                overflow-y: auto !important;
            }
        }
      `}</style>

      {/* Background blur cover art */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${game.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(30px) opacity(0.12)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div
        id="cabinet-container"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
          height: "auto",
          boxSizing: "border-box",
          padding: "20px 40px",
          background: "#0e0c15",
          overflowY: "visible",
        }}
      >
        {/* Game Title Header */}
        <div
          className="game-title-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            borderBottom: "2px solid #282335",
            paddingBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Link
              href="/"
              style={{
                color: "#dfc06f",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <i className="fas fa-arrow-left"></i>
              <span
                className="cabinet-header-title"
                style={{ fontSize: "20px", fontWeight: "bold" }}
              >
                STORE
              </span>
            </Link>
            <span style={{ color: "#55506a", fontSize: "20px" }}>/</span>
            <span
              className="cabinet-header-title"
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              {game.title}
            </span>
          </div>

          {/* Desktop header action buttons */}
          <div className="desktop-header-controls" style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRestart}
              style={{
                background: "#dfc06f",
                color: "#0e0c15",
                border: "2px solid #dfc06f",
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "14px",
                fontWeight: "bold",
                padding: "4px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0e0c15";
                e.currentTarget.style.color = "#dfc06f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#dfc06f";
                e.currentTarget.style.color = "#0e0c15";
              }}
            >
              <i className="fas fa-redo"></i> RESTART
            </button>
            <button
              onClick={handleToggleMute}
              style={{
                background: isMuted ? "#ff4444" : "#0e0c15",
                color: isMuted ? "#ffffff" : "#dfc06f",
                border: isMuted ? "2px solid #ff4444" : "2px solid #dfc06f",
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "14px",
                fontWeight: "bold",
                padding: "4px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i> {isMuted ? 'MUTED' : 'SOUND'}
            </button>
            <button
              onClick={handleFullscreen}
              style={{
                background: "#0e0c15",
                color: "#dfc06f",
                border: "2px solid #dfc06f",
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "14px",
                fontWeight: "bold",
                padding: "4px 12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dfc06f";
                e.currentTarget.style.color = "#0e0c15";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0e0c15";
                e.currentTarget.style.color = "#dfc06f";
              }}
            >
              <i className="fas fa-expand"></i> FULLSCREEN
            </button>
          </div>
        </div>

        {/* Game Area Layout Shell */}
        <div className="game-body-layout">
          {/* Widescreen Arcade Frame Iframe Wrapper */}
          <div className="arcade-cabinet-screen">
            {/* Scanline CRT overlay */}
            {slug !== "scribble" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.18) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.015), rgba(0, 0, 255, 0.03))",
                  backgroundSize: "100% 4px, 6px 100%",
                  zIndex: 5,
                  pointerEvents: "none",
                }}
              />
            )}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              onLoad={() => {
                if (iframeRef.current?.contentWindow) {
                  iframeRef.current.contentWindow.postMessage({ type: 'FINIXX_MUTE', muted: isMuted }, '*');
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                overflow: "hidden",
              }}
              title={game.title}
              scrolling="no"
            />
          </div>

          {/* Desktop Leaderboard */}
          <div className="leaderboard-panel">
            <h2
              style={{
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "28px",
                color: "#dfc06f",
                borderBottom: "2px solid #282335",
                paddingBottom: "10px",
                marginTop: "0",
                letterSpacing: "1.5px",
                textAlign: "center",
              }}
            >
              <i className="fas fa-trophy" style={{ marginRight: "10px" }}></i> LEADERBOARD
            </h2>
            {leaderboardContent}
          </div>

          {/* Mobile Action Bar — compact controls pinned below the iframe */}
          <div className="mobile-action-bar">
            {/* Restart */}
            <button
              onClick={handleRestart}
              style={{ flex: 1, height: '100%', background: 'none', border: 'none', borderRight: '1px solid #282335', color: '#dfc06f', fontFamily: "'Jersey 10', sans-serif", fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <i className="fas fa-redo"></i> RESTART
            </button>
            {/* Scores */}
            <button
              onClick={() => setShowMobileScores(true)}
              style={{ flex: 1, height: '100%', background: 'none', border: 'none', borderRight: '1px solid #282335', color: '#9692a8', fontFamily: "'Jersey 10', sans-serif", fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <i className="fas fa-trophy"></i> SCORES
            </button>
            {/* Volume */}
            <button
              onClick={handleToggleMute}
              style={{ flex: 1, height: '100%', background: 'none', border: 'none', borderRight: '1px solid #282335', color: isMuted ? '#ff4444' : '#9692a8', fontFamily: "'Jersey 10', sans-serif", fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i> {isMuted ? 'MUTED' : 'SOUND'}
            </button>
            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              style={{ flex: 1, height: '100%', background: 'none', border: 'none', color: '#9692a8', fontFamily: "'Jersey 10', sans-serif", fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <i className="fas fa-expand"></i> FULL
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Scores Overlay (tap SCORES to open, ✕ to close) */}
      {showMobileScores && (
        <div className="mobile-scores-overlay">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "2px solid #282335",
              paddingBottom: "12px",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontFamily: "'Jersey 10', sans-serif",
                fontSize: "26px",
                color: "#dfc06f",
                letterSpacing: "1.5px",
                margin: 0,
              }}
            >
              <i className="fas fa-trophy" style={{ marginRight: "8px" }}></i> LEADERBOARD
            </h2>
            <button
              onClick={() => setShowMobileScores(false)}
              style={{
                background: "none",
                border: "2px solid #282335",
                color: "#9692a8",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px 12px",
                fontFamily: "'Jersey 10', sans-serif",
                letterSpacing: "1px",
              }}
            >
              <i className="fas fa-times"></i> CLOSE
            </button>
          </div>
          {leaderboardContent}
        </div>
      )}
    </motion.main>
  );
}
