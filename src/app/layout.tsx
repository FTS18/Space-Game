import './globals.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { Suspense } from 'react';
import Header from '../components/layout/Header';
import PageTransitionProvider from '../components/providers/PageTransitionProvider';

export const metadata = {
  title: "Finixx | Let's Play",
  description: 'Come and Play!!!',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100..900;1,100..900&family=Jersey+10&family=Material+Icons&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="disabledScroll" style={{ color: 'white', background: '#121212' }}>
        <Suspense fallback={null}>
          <PageTransitionProvider>
            <div className="main-layout-container">
              <Header />
              <div className="main-content-wrapper">
                {children}
              </div>
            </div>
          </PageTransitionProvider>
        </Suspense>
      </body>
    </html>
  );
}
