/**
 * Typography System for Expense Tracker App
 * 
 * This file provides consistent typography classes and constants
 * that should be used across all components to maintain visual consistency.
 */

// Typography Classes - Use these classes instead of inline text-* classes
export const TYPOGRAPHY = {
  // Headings
  H1: 'text-h1 font-bold text-gray-900 dark:text-white',
  H2: 'text-h2 font-semibold text-gray-900 dark:text-white',
  H3: 'text-h3 font-semibold text-gray-900 dark:text-white',
  H4: 'text-h4 font-semibold text-gray-900 dark:text-white',
  H5: 'text-h5 font-semibold text-gray-900 dark:text-white',
  H6: 'text-h6 font-semibold text-gray-900 dark:text-white',
  
  // Page Titles (larger than regular headings)
  PAGE_TITLE: 'text-display font-bold text-gray-900 dark:text-white',
  
  // Body Text
  BODY_LG: 'text-body-lg text-gray-700 dark:text-gray-300',
  BODY: 'text-body text-gray-700 dark:text-gray-300',
  BODY_SM: 'text-body-sm text-gray-600 dark:text-gray-400',
  BODY_XS: 'text-body-xs text-gray-500 dark:text-gray-400',
  
  // Special Text
  LEAD: 'text-lead text-gray-700 dark:text-gray-300',
  CAPTION: 'text-caption text-gray-500 dark:text-gray-400',
  OVERLINE: 'text-overline text-gray-500 dark:text-gray-400',
  
  // Interactive Text
  LINK: 'text-body text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  LINK_SM: 'text-body-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  
  // Status Text
  SUCCESS: 'text-body-sm text-emerald-600 dark:text-emerald-400',
  WARNING: 'text-body-sm text-amber-600 dark:text-amber-400',
  ERROR: 'text-body-sm text-rose-600 dark:text-rose-400',
  INFO: 'text-body-sm text-blue-600 dark:text-blue-400',
  
  // Form Labels
  LABEL: 'text-body-sm font-medium text-gray-700 dark:text-gray-300',
  LABEL_REQUIRED: 'text-body-sm font-medium text-gray-700 dark:text-gray-300',
  
  // Button Text
  BUTTON_LG: 'text-body-lg font-semibold',
  BUTTON: 'text-body font-semibold',
  BUTTON_SM: 'text-body-sm font-medium',
  BUTTON_XS: 'text-body-xs font-medium',
  
  // Card Text
  CARD_TITLE: 'text-h4 font-semibold text-gray-900 dark:text-white',
  CARD_SUBTITLE: 'text-body-sm text-gray-600 dark:text-gray-400',
  CARD_BODY: 'text-body text-gray-700 dark:text-gray-300',
  
  // Navigation Text
  NAV_ITEM: 'text-body-sm font-medium text-gray-700 dark:text-gray-300',
  NAV_ITEM_ACTIVE: 'text-body-sm font-semibold text-blue-600 dark:text-blue-400',
  
  // Table Text
  TABLE_HEADER: 'text-body-sm font-semibold text-gray-900 dark:text-white',
  TABLE_CELL: 'text-body-sm text-gray-700 dark:text-gray-300',
  
  // Badge Text
  BADGE: 'text-body-xs font-medium',
  BADGE_SM: 'text-caption font-medium',
  
  // Amount Text
  AMOUNT_LG: 'text-h2 font-bold',
  AMOUNT: 'text-h3 font-bold',
  AMOUNT_SM: 'text-h4 font-bold',
  AMOUNT_XS: 'text-body-lg font-semibold',
  
  // Icon Text
  ICON_LG: 'text-4xl',
  ICON: 'text-2xl',
  ICON_SM: 'text-xl',
  ICON_XS: 'text-lg',
};

// Typography Variants for different contexts
export const TYPOGRAPHY_VARIANTS = {
  // Page Headers
  pageHeader: {
    title: TYPOGRAPHY.PAGE_TITLE,
    subtitle: TYPOGRAPHY.LEAD,
  },
  
  // Section Headers
  sectionHeader: {
    title: TYPOGRAPHY.H2,
    subtitle: TYPOGRAPHY.BODY_LG,
  },
  
  // Card Headers
  cardHeader: {
    title: TYPOGRAPHY.CARD_TITLE,
    subtitle: TYPOGRAPHY.CARD_SUBTITLE,
  },
  
  // Form Sections
  formSection: {
    title: TYPOGRAPHY.H4,
    description: TYPOGRAPHY.BODY_SM,
    label: TYPOGRAPHY.LABEL,
    help: TYPOGRAPHY.BODY_XS,
  },
  
  // Navigation
  navigation: {
    item: TYPOGRAPHY.NAV_ITEM,
    itemActive: TYPOGRAPHY.NAV_ITEM_ACTIVE,
    title: TYPOGRAPHY.H3,
  },
  
  // Data Display
  dataDisplay: {
    title: TYPOGRAPHY.H5,
    value: TYPOGRAPHY.AMOUNT,
    label: TYPOGRAPHY.BODY_SM,
    description: TYPOGRAPHY.BODY_XS,
  },
  
  // Status Messages
  status: {
    success: TYPOGRAPHY.SUCCESS,
    warning: TYPOGRAPHY.WARNING,
    error: TYPOGRAPHY.ERROR,
    info: TYPOGRAPHY.INFO,
  },
};

// Responsive Typography Classes
export const RESPONSIVE_TYPOGRAPHY = {
  // Responsive headings
  H1_RESPONSIVE: 'text-2xl sm:text-3xl lg:text-h1 font-bold text-gray-900 dark:text-white',
  H2_RESPONSIVE: 'text-xl sm:text-2xl lg:text-h2 font-semibold text-gray-900 dark:text-white',
  H3_RESPONSIVE: 'text-lg sm:text-xl lg:text-h3 font-semibold text-gray-900 dark:text-white',
  
  // Responsive body text
  BODY_LG_RESPONSIVE: 'text-base sm:text-body-lg text-gray-700 dark:text-gray-300',
  BODY_RESPONSIVE: 'text-sm sm:text-body text-gray-700 dark:text-gray-300',
  
  // Responsive amounts
  AMOUNT_RESPONSIVE: 'text-xl sm:text-2xl lg:text-h3 font-bold',
  AMOUNT_LG_RESPONSIVE: 'text-2xl sm:text-3xl lg:text-h2 font-bold',
};

// Typography Utilities
export const getTypographyClass = (variant, context = 'default') => {
  if (TYPOGRAPHY_VARIANTS[context] && TYPOGRAPHY_VARIANTS[context][variant]) {
    return TYPOGRAPHY_VARIANTS[context][variant];
  }
  
  if (TYPOGRAPHY[variant]) {
    return TYPOGRAPHY[variant];
  }
  
  // Fallback to body text
  return TYPOGRAPHY.BODY;
};

// Common Typography Combinations
export const TYPOGRAPHY_COMBINATIONS = {
  // Page Header
  pageHeader: {
    container: 'mb-8',
    title: TYPOGRAPHY.PAGE_TITLE + ' mb-3',
    subtitle: TYPOGRAPHY.LEAD,
  },
  
  // Section Header
  sectionHeader: {
    container: 'mb-6',
    title: TYPOGRAPHY.H2 + ' mb-2',
    subtitle: TYPOGRAPHY.BODY_LG,
  },
  
  // Card Header
  cardHeader: {
    container: 'mb-4',
    title: TYPOGRAPHY.CARD_TITLE + ' mb-2',
    subtitle: TYPOGRAPHY.CARD_SUBTITLE,
  },
  
  // Form Field
  formField: {
    container: 'mb-4',
    label: TYPOGRAPHY.LABEL + ' mb-2',
    help: TYPOGRAPHY.BODY_XS + ' mt-1',
    error: TYPOGRAPHY.ERROR + ' mt-1',
  },
  
  // Data Row
  dataRow: {
    container: 'flex justify-between items-center py-2',
    label: TYPOGRAPHY.BODY_SM + ' text-gray-600 dark:text-gray-400',
    value: TYPOGRAPHY.BODY + ' font-semibold text-gray-900 dark:text-white',
  },
};

// Export default for easy importing
export default {
  TYPOGRAPHY,
  TYPOGRAPHY_VARIANTS,
  RESPONSIVE_TYPOGRAPHY,
  TYPOGRAPHY_COMBINATIONS,
  getTypographyClass,
}; 