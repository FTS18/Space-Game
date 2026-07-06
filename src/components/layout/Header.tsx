'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { allGames } from '../../lib/games';

export default function Header(): React.JSX.Element {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Auto-detect active pages
  const isHomeActive = pathname === '/';
  const isLoginActive = pathname === '/login';

  return (
    <>
      {/* ==============================================
         1. DESKTOP SIDEBAR NAVIGATION (width > 900px)
         ============================================== */}
      <aside className="nav-sidebar">
        <div className="logo-container">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '8px', marginLeft: '5px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Triangle (Gold) */}
              <div style={{
                position: 'absolute',
                top: '0',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '8px solid #dfc06f'
              }}></div>
              {/* Cross (Gold) */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                width: '8px',
                height: '8px'
              }}>
                <div style={{ position: 'absolute', width: '8px', height: '2px', background: '#dfc06f', top: '3px', transform: 'rotate(45deg)' }}></div>
                <div style={{ position: 'absolute', width: '8px', height: '2px', background: '#dfc06f', top: '3px', transform: 'rotate(-45deg)' }}></div>
              </div>
              {/* Circle (Gold) */}
              <div style={{
                position: 'absolute',
                right: '0',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: '2px solid #dfc06f',
                boxSizing: 'border-box'
              }}></div>
              {/* Square (Gold) */}
              <div style={{
                position: 'absolute',
                left: '0',
                width: '8px',
                height: '8px',
                border: '2px solid #dfc06f',
                boxSizing: 'border-box'
              }}></div>
            </div>
            <span style={{ 
              fontFamily: "'Space Grotesk', sans-serif", 
              fontWeight: 900, 
              fontSize: '28px', 
              color: '#dfc06f', 
              letterSpacing: '3px'
            }}>FINIXX</span>
          </Link>
        </div>

        {/* Clean search bar */}
        <div className="search-container">
          <form onSubmit={(e) => { e.preventDefault(); alert(`Searching for: ${searchQuery}`); }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav className="menu-links">
          <Link href="/" className={isHomeActive ? 'active' : ''}>
            <i className="fas fa-gamepad" style={{ marginRight: '12px' }}></i>Home
          </Link>

          {!user && (
            <Link href="/login" className={isLoginActive ? 'active' : ''}>
              <i className="fas fa-user-circle" style={{ marginRight: '12px' }}></i>Player Login
            </Link>
          )}

          {/* Styled category title and lists */}
          <span className="submenu-title">Games</span>
          {allGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.link} 
              className={pathname === game.link ? 'active' : ''}
            >
              <i className={game.icon} style={{ marginRight: '12px' }}></i>{game.title}
            </Link>
          ))}

          {user && (
            <>
              <span className="submenu-title">Player Console</span>
              <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
                <i className="fas fa-user-astronaut" style={{ marginRight: '12px' }}></i>Profile
              </Link>
              <Link href="/history" className={pathname === '/history' ? 'active' : ''}>
                <i className="fas fa-history" style={{ marginRight: '12px' }}></i>Score History
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* ==============================================
         2. MOBILE TOP HEADER (logo only) (width <= 900px)
         ============================================== */}
      <header className="mobile-top-header">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '6px' }}>
          <div style={{
            width: '22px',
            height: '22px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Triangle (Gold) */}
            <div style={{
              position: 'absolute',
              top: '0',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '6px solid #dfc06f'
            }}></div>
            {/* Cross (Gold) */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              width: '6px',
              height: '6px'
            }}>
              <div style={{ position: 'absolute', width: '6px', height: '1.5px', background: '#dfc06f', top: '2.25px', transform: 'rotate(45deg)' }}></div>
              <div style={{ position: 'absolute', width: '6px', height: '1.5px', background: '#dfc06f', top: '2.25px', transform: 'rotate(-45deg)' }}></div>
            </div>
            {/* Circle (Gold) */}
            <div style={{
              position: 'absolute',
              right: '0',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              border: '1.5px solid #dfc06f',
              boxSizing: 'border-box'
            }}></div>
            {/* Square (Gold) */}
            <div style={{
              position: 'absolute',
              left: '0',
              width: '6px',
              height: '6px',
              border: '1.5px solid #dfc06f',
              boxSizing: 'border-box'
            }}></div>
          </div>
          <span style={{ 
            fontFamily: "'Space Grotesk', sans-serif", 
            fontWeight: 900, 
            fontSize: '22px', 
            color: '#dfc06f', 
            letterSpacing: '2px'
          }}>FINIXX</span>
        </Link>
      </header>

      {/* ==============================================
         3. MOBILE BOTTOM HUD NAVIGATION (width <= 900px)
         ============================================== */}
      <nav className="mobile-bottom-hud">
        <Link href="/" className={isHomeActive ? 'active' : ''}>
          <i className="fas fa-gamepad" style={{ fontSize: '18px', marginBottom: '4px' }}></i>
          <span>Home</span>
        </Link>
        {user ? (
          <>
            <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
              <i className="fas fa-user-astronaut" style={{ fontSize: '18px', marginBottom: '4px' }}></i>
              <span>Profile</span>
            </Link>
            <Link href="/history" className={pathname === '/history' ? 'active' : ''}>
              <i className="fas fa-history" style={{ fontSize: '18px', marginBottom: '4px' }}></i>
              <span>History</span>
            </Link>
          </>
        ) : (
          <Link href="/login" className={isLoginActive ? 'active' : ''}>
            <i className="fas fa-user-circle" style={{ fontSize: '18px', marginBottom: '4px' }}></i>
            <span>Login</span>
          </Link>
        )}
        <a href="https://chat.whatsapp.com/ECHJEEU1w901D89UMd0c3m" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-comments" style={{ fontSize: '18px', marginBottom: '4px' }}></i>
          <span>Chat</span>
        </a>
      </nav>
    </>
  );
}
