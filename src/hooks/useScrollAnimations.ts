import { useState, useEffect, useRef, MutableRefObject } from 'react';

interface UseScrollAnimationsProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface ScrollAnimationResult {
  isInView: boolean;
  ref: MutableRefObject<null | HTMLElement>;
  scrollToNext: () => void;
  scrollToPrevious: () => void;
}

/**
 * A custom hook for handling scroll-based animations
 */
export const useScrollAnimations = ({
  threshold = 0.3,
  root = null,
  rootMargin = '0px',
  triggerOnce = false,
}: UseScrollAnimationsProps = {}): ScrollAnimationResult => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const wasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Don't trigger again if triggerOnce is true and already triggered
        if (triggerOnce && wasTriggered.current) return;
        
        const isVisible = entry.isIntersecting;
        setIsInView(isVisible);
        
        if (isVisible && triggerOnce) {
          wasTriggered.current = true;
        }
      },
      { 
        threshold, 
        root,
        rootMargin,
      }
    );

    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  // Function to scroll to next section
  const scrollToNext = () => {
    if (ref.current) {
      const nextSection = ref.current.nextElementSibling as HTMLElement;
      if (nextSection) {
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Function to scroll to previous section
  const scrollToPrevious = () => {
    if (ref.current) {
      const previousSection = ref.current.previousElementSibling as HTMLElement;
      if (previousSection) {
        previousSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return { isInView, ref, scrollToNext, scrollToPrevious };
};

export default useScrollAnimations; 