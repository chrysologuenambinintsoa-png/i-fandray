'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './Splashscreen.module.css';
import { useTranslation } from '@/components/TranslationProvider';

export function Splashscreen() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = prev + 2;
        if (progressRef.current) {
          progressRef.current.style.width = `${newProgress}%`;
        }
        return newProgress;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.splashContainer}>
      <div className="text-center">
        {/* Logo */}
        <div className={styles.logo}>
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white/10 rounded-full shadow-xl border border-white/10">
            <img src="/logo.svg" alt="i-fandray Logo" className="w-16 h-16" />
          </div>
        </div>

        {/* App Name */}
        <h1 className={styles.appName}>
          i-fandray
        </h1>

        {/* Tagline */}
        <p className={styles.tagline} data-testid="splash-tagline">
          {t('splash.tagline')}
        </p>

        {/* Loading Progress */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              ref={progressRef}
              className={styles.progressFill}
            ></div>
          </div>
          <p className="mt-2 text-sm text-green-100">
            Loading... {progress}%
          </p>
        </div>

        {/* Loading Dots */}
        <div className={styles.dots}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
}