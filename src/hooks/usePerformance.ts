import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce, throttle, prefersReducedMotion } from '@/lib/performance';

/**
 * Hook for lazy loading images
 */
export const useLazyLoad = () => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const image = entry.target as HTMLImageElement;
              const src = image.dataset.src;
              if (src) {
                image.src = src;
                image.classList.add('loaded');
                observer.unobserve(image);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.observe(img);

      return () => observer.disconnect();
    } else {
      // Fallback
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.classList.add('loaded');
      }
    }
  }, []);

  return imgRef;
};

/**
 * Hook for debounced callbacks
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay]
  );
};

/**
 * Hook for throttled callbacks
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit]
  );
};

/**
 * Hook to check if user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(prefersReducedMotion());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      setPrefersReduced(mediaQuery.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReduced;
};

/**
 * Hook for intersection observer
 */
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        },
        options
      );

      observer.observe(element);

      return () => observer.disconnect();
    } else {
      // Fallback: assume element is visible
      setIsIntersecting(true);
    }
  }, [options]);

  return { elementRef, isIntersecting };
};

