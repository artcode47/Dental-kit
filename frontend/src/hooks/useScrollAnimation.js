import { useState, useEffect, useRef } from 'react';

const useScrollAnimation = (threshold = 0.1, rootMargin = '0px') => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let observer;

    const observe = () => {
      if (observer) {
        observer.disconnect();
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        {
          threshold,
          rootMargin,
        }
      );
      if (ref.current) {
        observer.observe(ref.current);
      }
    };

    observe();

    const handleResize = () => {
      // Re-observe on resize/orientation changes to avoid stale viewport metrics
      observe();
      // If element is already within viewport after resize, ensure it is visible
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) setIsVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (observer) observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return [ref, isVisible];
};

export default useScrollAnimation;
