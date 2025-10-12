// Accessibility utility functions and constants

/**
 * Generate unique IDs for ARIA attributes
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Screen reader only class for visually hidden content
 */
export const srOnlyClass = 'sr-only';

/**
 * Screen reader only styles
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Focus visible class for keyboard navigation
 */
export const focusVisibleClass = 'focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2';

/**
 * Common ARIA attributes for form validation
 */
export const getFormFieldAria = (fieldName, hasError, errorMessage) => ({
  'aria-describedby': hasError ? `${fieldName}-error` : undefined,
  'aria-invalid': hasError ? 'true' : 'false',
  'aria-required': 'true',
});

/**
 * ARIA attributes for buttons with state
 */
export const getButtonAria = (pressed, expanded, controls) => {
  const aria = {};
  if (pressed !== undefined) aria['aria-pressed'] = pressed;
  if (expanded !== undefined) aria['aria-expanded'] = expanded;
  if (controls) aria['aria-controls'] = controls;
  return aria;
};

/**
 * ARIA attributes for navigation
 */
export const getNavigationAria = (current, label) => ({
  'aria-current': current ? 'page' : undefined,
  'aria-label': label,
});

/**
 * ARIA attributes for live regions
 */
export const getLiveRegionAria = (polite = true, atomic = true) => ({
  'aria-live': polite ? 'polite' : 'assertive',
  'aria-atomic': atomic,
});

/**
 * Generate error message ID
 */
export const getErrorId = (fieldName) => `${fieldName}-error`;

/**
 * Generate help text ID
 */
export const getHelpId = (fieldName) => `${fieldName}-help`;

/**
 * Common accessibility props for interactive elements
 */
export const getInteractiveProps = (label, disabled = false, describedBy = null) => ({
  'aria-label': label,
  'aria-disabled': disabled,
  'aria-describedby': describedBy,
});

/**
 * Accessibility props for modal dialogs
 */
export const getModalAria = (title, description = null) => ({
  role: 'dialog',
  'aria-modal': 'true',
  'aria-labelledby': title,
  'aria-describedby': description,
});

/**
 * Keyboard event handlers for accessibility
 */
export const handleKeyDown = {
  enter: (callback) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      callback(e);
    }
  },
  escape: (callback) => (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback(e);
    }
  },
  arrow: (callback) => (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      callback(e);
    }
  },
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  trap: (containerRef) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    return (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
  },
  restore: (previousElement) => {
    if (previousElement) {
      previousElement.focus();
    }
  },
};

/**
 * Announce to screen readers
 */
export const announce = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnlyClass;
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element) => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
};

/**
 * Get accessible name for element
 */
export const getAccessibleName = (element) => {
  // Check aria-label first
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    return labelElement ? labelElement.textContent : '';
  }
  
  // Check for associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label.textContent;
    }
  }
  
  // Fallback to title attribute
  return element.getAttribute('title') || element.textContent || '';
};

export default {
  generateId,
  srOnlyClass,
  srOnlyStyles,
  focusVisibleClass,
  getFormFieldAria,
  getButtonAria,
  getNavigationAria,
  getLiveRegionAria,
  getErrorId,
  getHelpId,
  getInteractiveProps,
  getModalAria,
  handleKeyDown,
  focusManagement,
  announce,
  isVisibleToScreenReader,
  getAccessibleName,
};

