import { useEffect } from 'react';

/**
 * Adds the .reveal class to all [data-reveal] elements, then observes them.
 * Content is visible by default — the hidden starting state is only applied
 * after JS confirms IntersectionObserver exists AND reduced motion is off.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

    // Add the hidden starting state now that we know JS+IO are available
    elements.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
