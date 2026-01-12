/**
 * Scroll to top of the page with smooth animation
 * Base utility function for smooth scrolling to top
 */
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

