import { useEffect, useState } from 'react';

/**
 * Animated count-up hook for KPI numbers.
 * Respects prefers-reduced-motion.
 */
export function useCountUp(targetNumber, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(targetNumber);
      return;
    }

    let start = 0;
    const end = parseInt(targetNumber, 10);
    if (isNaN(end)) {
      setCount(targetNumber);
      return;
    }

    if (start === end) {
      setCount(end);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    const animFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animFrame);
  }, [targetNumber, duration]);

  return count;
}

