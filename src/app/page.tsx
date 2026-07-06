'use client';

import React, { useEffect, useState } from 'react';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { allGames } from '../lib/games';

// Configure which game IDs to showcase in the top featured banner slider
const featuredGameIds = [0, 1, 2, 3, 4, 5, 6];

// Filter master library to dynamically construct the featured games list
const featuredGames = allGames.filter(game => featuredGameIds.includes(game.id));

export default function Home(): React.JSX.Element {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // Auto-cycle featured games every 5 seconds (Epic storefront style)
    const cycleInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredGames.length);
    }, 5000);

    // Dynamic jQuery import for game frame scripts compatibility
    const initJQuery = async () => {
      const { default: $ } = await import('jquery');
      window.jQuery = window.$ = $;
    };
    initJQuery();

    return () => {
      clearInterval(cycleInterval);
    };
  }, []);

  return (
    <>
      <div className="ripple"></div>

      <motion.main 
        className="page"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        
        {/* Epic Games Store Style Featured Showcase Layout */}
        <section className="featured-storefront">
          <div className="showcase-banner">
            <div className="banner-image-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="banner-slide"
                  style={{
                    backgroundImage: `url(${featuredGames[activeSlide].image})`
                  }}
                />
              </AnimatePresence>
              <div className="banner-fade-bottom"></div>
            </div>

            <div className="showcase-details">
              <span className="details-badge">
                {featuredGames[activeSlide].badge}
              </span>
              <h2>{featuredGames[activeSlide].title}</h2>
              <p>{featuredGames[activeSlide].description}</p>
              {featuredGames[activeSlide].isComingSoon ? (
                <button disabled className="play-now-btn disabled">
                  COMING SOON
                </button>
              ) : (
                <a href={featuredGames[activeSlide].link} className="play-now-btn">
                  PLAY NOW
                </a>
              )}
            </div>
          </div>

          {/* Right Panel Preview Tabs (Epic Store Deck) */}
          <div className="storefront-thumbs">
            {featuredGames.map((game, idx) => (
              <div 
                key={game.id} 
                className={`thumb-card ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
              >
                <div className="thumb-img">
                  <img src={game.image} alt={game.title} />
                </div>
                <div className="thumb-info">
                  <h4>{game.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content (Vertical Library List) */}
        <section className="main-content">
          <div className="vertical-library">
            <h3 className="library-title">LIBRARY</h3>
            <div className="games-list-vertical">
              {allGames.map((game) => (
                <div key={game.id} className="list-item">
                  <div className="item-img-container">
                    <img src={game.image} alt={game.title} />
                  </div>
                  <div className="item-details">
                    <h4>{game.title}</h4>
                    <p>{game.description}</p>
                    <span className="item-platforms">{game.platforms}</span>
                  </div>
                  <div className="item-actions">
                    <a href={game.link} className="item-play-btn">
                      PLAY
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Footer />
        </section>
      </motion.main>
    </>
  );
}
