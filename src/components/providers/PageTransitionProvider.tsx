'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageTransitionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayChildren, setDisplayChildren] = useState<React.ReactNode>(children);
  const prevPathRef = useRef(pathname);

  // Initial boot loader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.classList.remove('disabledScroll');
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  // Intercept global local clicks to trigger loader BEFORE page swaps
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      while (target && target.tagName !== 'A') {
        target = target.parentElement as HTMLElement;
      }

      if (!target || target.tagName !== 'A') return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external, target blank, mailto, tel, or command/control clicks
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return;
      }

      e.preventDefault();

      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath) return;

      // 1. Instantly trigger loader scale-down cover
      setLoading(true);
      document.body.classList.add('disabledScroll');

      // 2. Perform route change after screen is fully covered (450ms)
      setTimeout(() => {
        router.push(href);
      }, 450);
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, [router]);

  // Track path changes to update children and trigger wipe removal
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (prevPathRef.current !== currentPath) {
      // Swap content while covered
      setDisplayChildren(children);

      // Slide columns back up to reveal new page
      const transitionTimer = setTimeout(() => {
        setLoading(false);
        document.body.classList.remove('disabledScroll');
      }, 650);

      prevPathRef.current = currentPath;
      return () => clearTimeout(transitionTimer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, searchParams, children]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="global-loader"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              background: 'transparent',
              pointerEvents: 'all'
            }}
            exit={{ opacity: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{
                  delay: i * 0.04,
                  duration: 0.35,
                  ease: [0.76, 0, 0.24, 1]
                }}
                style={{
                  flex: 1,
                  background: '#0e0c15',
                  borderLeft: i > 0 ? '1px solid #1c1828' : 'none',
                  transformOrigin: 'top',
                  height: '100%'
                }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 1000000,
                fontFamily: "'Jersey 10', sans-serif",
              }}
            >
              <div style={{ fontSize: '38px', color: '#dfc06f', marginBottom: '8px', letterSpacing: '4px', fontWeight: 'bold' }}>
                FINIXX
              </div>
              <div style={{ fontSize: '18px', color: '#9692a8', letterSpacing: '2px' }}>
                LOADING...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {displayChildren}
    </>
  );
}
