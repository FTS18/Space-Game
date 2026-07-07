'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  useEffect(() => {
    // Enable scroll if disabled
    document.body.classList.remove('disabledScroll');
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');
        
        .bg-purple-container {
          background: url(/assets/images/backgrounds/13.webp) no-repeat center;
          background-size: cover;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'Jersey 10', sans-serif;
          position: relative;
        }

        .brand-logo {
            position: absolute;
            top: 0;
            left: 0;
            text-align: center;
            z-index: 50000;
            background: rgba(0, 0, 0, .1);
            backdrop-filter: blur(100px);
            width: 100%;
            height: 70px;
            padding-top: 25px;
            font-size: 40px;
            font-weight: 700;
            color: #fff;
        }

        .btn-go-home {
            position: fixed;
            z-index: 200;
            top: 50%;
            margin-top: 130px;
            left: 50%;
            width: 100px;
            height: auto;
            padding: 10px 15px;
            border: 1px solid #ff0030;
            background: rgba(255, 255, 255, .04);
            backdrop-filter: blur(100px);
            border-radius: 100px;
            font-weight: 400;
            display: block;
            color: white;
            text-align: center;
            text-decoration: none;
            letter-spacing: 2px;
            font-size: 11px;
            transform: translate(-50%, -50%);
            transition: all 0.3s ease-in;
        }
        
        .btn-go-home:hover {
            background-color: rgba(255, 0, 11, .19);
            backdrop-filter: Blur(100px);
            color: #fff;
            box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
        }

        .central-body {
            padding: 17% 5% 10% 5%;
            text-align: center;
        }

        .image-404 {
            position: absolute;
            z-index: 100;
            pointer-events: none;
            top: 50%;
            left: 50%;
            width: 250px;
            height: 200px;
            transform: translate(-50%, -50%)
        }

        .stars-container {
            background: url(http://salehriaz.com/404Page/img/overlay_stars.svg);
            background-repeat: repeat;
            background-size: contain;
            background-position: left top;
            height: 100%;
            width: 100%;
        }

        .objects img {
            z-index: 90;
            pointer-events: none;
        }
        
        .object_rocket {
            z-index: 95;
            position: absolute;
            transform: translateX(-50px);
            top: 75%;
            pointer-events: none;
            animation: rocket-movement 200s linear infinite both running;
        }

        .box_astronaut {
            z-index: 110 !important;
            position: absolute;
            top: 60%;
            right: 20%;
            will-change: transform;
            animation: move-astronaut 50s infinite linear both alternate;
        }

        .object_astronaut {
            animation: rotate-astronaut 200s infinite linear both alternate;
        }

        .glowing_stars .star {
            position: absolute;
            border-radius: 100%;
            background-color: #fff;
            width: 3px;
            height: 3px;
            opacity: 0.3;
            will-change: opacity;
        }

        .glowing_stars .star:nth-child(1) {
            top: 80%;
            left: 25%;
            animation: glow-star 2s infinite ease-in-out alternate 1s;
        }
        .glowing_stars .star:nth-child(2) {
            top: 20%;
            left: 40%;
            animation: glow-star 2s infinite ease-in-out alternate 3s;
        }
        .glowing_stars .star:nth-child(3) {
            top: 25%;
            left: 25%;
            animation: glow-star 2s infinite ease-in-out alternate 5s;
        }
        .glowing_stars .star:nth-child(4) {
            top: 75%;
            left: 80%;
            animation: glow-star 2s infinite ease-in-out alternate 7s;
        }
        .glowing_stars .star:nth-child(5) {
            top: 90%;
            left: 50%;
            animation: glow-star 2s infinite ease-in-out alternate 9s;
        }

        @keyframes rocket-movement {
            100% { transform: translate(1200px, -600px); }
        }
        @keyframes rotate-astronaut {
            100% { transform: rotate(-720deg); }
        }
        @keyframes move-astronaut {
            100% { transform: translate(-160px, -160px); }
        }
        @keyframes glow-star {
            40% { opacity: 0.3; }
            90%, 100% {
                opacity: 1;
                transform: scale(1.2);
            }
        }

        @media only screen and (max-width: 600px) {
            .box_astronaut { top: 70%; }
            .central-body { padding-top: 25%; }
        }
      ` }} />

      <div className="bg-purple-container">
        <div className="stars-container">
          <div className="brand-logo">
            FINIXX
          </div>
          <div className="central-body">
            <img alt="404" className="image-404" src="http://salehriaz.com/404Page/img/404.svg" width="300px" />
            <Link href="/" className="btn-go-home">
              Take Me Back
            </Link>
          </div>
          <div className="objects">
            <img alt="rocket" className="object_rocket" src="http://salehriaz.com/404Page/img/rocket.svg" width="40px" />
            <div className="box_astronaut">
              <img alt="astronaut" className="object_astronaut" src="http://salehriaz.com/404Page/img/astronaut.svg" width="140px" />
            </div>
          </div>
          <div className="glowing_stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
      </div>
    </>
  );
}
