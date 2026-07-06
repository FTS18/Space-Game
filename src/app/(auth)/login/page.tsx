'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export default function Login(): React.JSX.Element {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPass, setSignUpPass] = useState('');
  const [signUpConfirmPass, setSignUpConfirmPass] = useState('');
  
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<Array<{ game: string; score: number; date: string }>>([]);

  // Mock databases
  const names = ['arunjay', 'ananay', 'ishan', 'vansh', 'arush', 'aditya', 'divyanshi', 'krishna'];
  const passwords = ['12345', '6789', 'ihan', 'vans', 'arus', 'akgvs', 'dvs', 'krishnagera584'];

  useEffect(() => {
    document.body.classList.remove('disabledScroll');
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push('/profile');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully.");
    } catch (err: any) {
      alert(`Logout Error: ${err.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const nameFormatted = result.user.displayName || 'Gamer';
        alert(`Welcome back (Google), ${nameFormatted}`);
        router.push('/');
      } catch (firebaseErr: any) {
        alert(`Google Sign-In Error: ${firebaseErr.message}`);
      }
    } else {
      alert("Local Fallback: Google Auth requires active Firebase credentials configured in .env.local!");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredName = username.trim().toLowerCase();
    const enteredPass = password.trim();
    const email = enteredName.includes('@') ? enteredName : `${enteredName}@finixx.com`;
    const nameFormatted = enteredName.split('@')[0];
    const nameFormattedCap = nameFormatted.charAt(0).toUpperCase() + nameFormatted.slice(1);

    // Try Firebase Authentication if config is present
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here') {
      try {
        await signInWithEmailAndPassword(auth, email, enteredPass);
        alert(`Welcome back (Firebase), ${nameFormattedCap}`);
        router.push('/');
        return;
      } catch (firebaseErr: any) {
        alert(`Firebase Auth Error: ${firebaseErr.message}`);
        return;
      }
    }

    // Local fallback check
    const index = names.indexOf(enteredName);
    if (index !== -1 && passwords[index] === enteredPass) {
      alert(`Welcome back (Local Account), ${nameFormattedCap}`);
      router.push('/');
    } else {
      alert('Error: Invalid credentials');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = signUpName.trim().toLowerCase();
    const email = name.includes('@') ? name : `${name}@finixx.com`;
    const pass = signUpPass.trim();

    if (!name || !pass) {
      alert('Error: Username and password are required');
      return;
    }
    if (signUpPass !== signUpConfirmPass) {
      alert('Error: Passwords do not match');
      return;
    }

    // Try Firebase Sign Up if config is present
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert(`Account created successfully on Firebase for ${signUpName}. Please sign in.`);
        setIsSignUp(false);
        return;
      } catch (firebaseErr: any) {
        alert(`Firebase Signup Error: ${firebaseErr.message}`);
        return;
      }
    }

    alert(`Account created successfully (Local Fallback) for ${signUpName}. Please sign in.`);
    setIsSignUp(false);
  };

  const handleGuestLogin = () => {
    router.push('/');
  };

  return (
    <>
      {/* Styled inline scoped stylesheet for flat, boxy, retro game cabinet look */}
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
          font-family: 'Pixelify Sans', sans-serif !important;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        /* Scanlines Overlay for retro monitor look */
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
          border-radius: 0px; /* Flat, Boxy */
          position: relative;
          z-index: 10;
          padding: 30px 24px;
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

        .tab-menu {
          display: flex;
          width: 100%;
          border-bottom: 2px solid #282335;
          margin-bottom: 20px;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #55506a;
          font-size: 18px;
          padding: 10px;
          cursor: pointer;
          font-family: 'Jersey 10', sans-serif !important;
          text-transform: uppercase;
          transition: all 0.2s ease;
          border-bottom: 4px solid transparent;
          margin: 0;
          border-radius: 0px; /* Flat, Boxy */
          letter-spacing: 1px;
        }

        .tab-btn.active {
          color: #dfc06f;
          border-bottom: 4px solid #dfc06f;
        }

        .arcade-form {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .input-group {
          margin-bottom: 15px;
          position: relative;
        }

        .input-group label {
          display: block;
          font-size: 15px;
          color: #837e96;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-family: 'Jersey 10', sans-serif !important;
        }

        .arcade-input {
          width: 100%;
          background: #000000;
          border: 2px solid #282335;
          border-radius: 0px; /* Flat, Boxy */
          padding: 10px 12px;
          font-size: 18px;
          color: #fff;
          font-family: 'Jersey 10', sans-serif !important;
          transition: all 0.2s ease;
          outline: none;
          box-shadow: none;
          box-sizing: border-box;
          letter-spacing: 1px;
        }

        .arcade-input:focus {
          border-color: #dfc06f;
          box-shadow: none;
          color: #dfc06f;
        }

        /* Flat Retro Arcade Buttons (No gradients, no rounded corners, inverted hover colors) */
        .arcade-btn {
          background: #dfc06f;
          border: 2px solid #dfc06f;
          border-radius: 0px; /* Flat, Boxy */
          color: #0e0c15;
          font-size: 18px;
          font-weight: bold;
          padding: 12px 20px;
          cursor: pointer;
          font-family: 'Jersey 10', sans-serif !important;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.2s ease;
          margin-top: 10px;
          margin-bottom: 15px;
          box-sizing: border-box;
        }

        .arcade-btn:hover {
          background: #0e0c15;
          color: #dfc06f;
          border-color: #dfc06f;
        }

        .arcade-btn.secondary {
          background: transparent;
          border-color: #282335;
          color: #837e96;
        }

        .arcade-btn.secondary:hover {
          background: #15002b;
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

      <motion.main 
        className="cabinet-bg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {user ? (
          /* Logged In Redirecting Frame */
          <div className="cabinet-frame">
            <div className="marquee-title" style={{ marginBottom: '10px' }}>
              PROFILE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '24px', color: '#dfc06f', fontFamily: "'Jersey 10', sans-serif", letterSpacing: '1px', marginBottom: '5px' }}>
                REDIRECTING...
              </div>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Forms */
          <div className="cabinet-frame">
            <div className="marquee-title">
              LOGIN
            </div>
            
            <div className="tab-menu">
              <button 
                className={`tab-btn ${!isSignUp ? 'active' : ''}`} 
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
              <button 
                className={`tab-btn ${isSignUp ? 'active' : ''}`} 
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>

            {!isSignUp ? (
              /* Sign In form */
              <form onSubmit={handleLogin} className="arcade-form">
                <div className="input-group">
                  <label htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username"
                    required 
                    className="arcade-input"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password"
                    required 
                    className="arcade-input"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="arcade-btn">
                  Sign In
                </button>
                <button 
                  type="button" 
                  className="arcade-btn secondary"
                  onClick={handleGuestLogin}
                >
                  Guest Play
                </button>
                <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', width: '100%' }}>
                  <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                  <span style={{ color: '#555', fontSize: '12px', padding: '0 10px', letterSpacing: '1px', fontFamily: "'Jersey 10', sans-serif" }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>
                <button 
                  type="button" 
                  className="arcade-btn secondary"
                  onClick={handleGoogleLogin}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <i className="fab fa-google"></i> Google Sign-In
                </button>
              </form>
            ) : (
              /* Sign Up form */
              <form onSubmit={handleSignUp} className="arcade-form">
                <div className="input-group">
                  <label htmlFor="signup-username">Username</label>
                  <input 
                    type="text" 
                    id="signup-username"
                    required 
                    className="arcade-input"
                    placeholder="Enter Username"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-password">Password</label>
                  <input 
                    type="password" 
                    id="signup-password"
                    required 
                    className="arcade-input"
                    placeholder="Enter Password"
                    value={signUpPass}
                    onChange={(e) => setSignUpPass(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <input 
                    type="password" 
                    id="signup-confirm-password"
                    required 
                    className="arcade-input"
                    placeholder="Confirm Password"
                    value={signUpConfirmPass}
                    onChange={(e) => setSignUpConfirmPass(e.target.value)}
                  />
                </div>
                <button type="submit" className="arcade-btn">
                  Sign Up
                </button>
              </form>
            )}
            <div className="insert-coin-note">
              INSERT COIN TO PLAY
            </div>
          </div>
        )}
      </motion.main>
    </>
  );
}
