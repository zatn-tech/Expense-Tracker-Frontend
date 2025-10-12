import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Get user preferences
export const getUserPreferences = async (userId) => {
  // Check if auth header is actually set
  if (!axios.defaults.headers.common['Authorization']) {
    throw new Error('No authentication token available');
  }
  
  try {
    const response = await axios.get(API_ENDPOINTS.USER_PREFERENCES(userId));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user preferences');
  }
};

// Update user preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await axios.put(API_ENDPOINTS.USER_PREFERENCES(userId), preferences);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user preferences');
  }
};

// Update specific section
export const updatePreferencesSection = async (userId, section, data) => {
  try {
    const response = await axios.patch(API_ENDPOINTS.USER_PREFERENCES_SECTION(userId, section), data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update preferences section');
  }
};

// Reset preferences to defaults
export const resetPreferences = async (userId) => {
  try {
    const response = await axios.post(API_ENDPOINTS.USER_PREFERENCES_RESET(userId));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset preferences');
  }
};

// Export preferences
export const exportPreferences = async (userId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.USER_PREFERENCES_EXPORT(userId));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export preferences');
  }
};

// Import preferences
export const importPreferences = async (userId, preferences) => {
  try {
    const response = await axios.post(API_ENDPOINTS.USER_PREFERENCES_IMPORT(userId), { preferences });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to import preferences');
  }
};

// Default preferences
export const defaultPreferences = {
  theme: {
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    accentColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    mode: 'auto'
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: 'medium',
    fontWeight: 'normal',
    lineHeight: 'normal'
  },
  layout: {
    sidebarWidth: 'normal',
    headerHeight: 'normal',
    borderRadius: 'medium',
    spacing: 'normal'
  },
  components: {
    buttonStyle: 'raised',
    cardStyle: 'elevated',
    animationSpeed: 'normal',
    showAnimations: true
  },
  dashboard: {
    layout: 'grid',
    widgets: [],
    defaultView: 'overview'
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 'medium'
  },
  export: {
    defaultFormat: 'csv',
    includeHeaders: true
  }
};

// Font families with their display names
export const fontFamilies = [
  // Modern Sans-Serif
  { value: 'Inter', label: 'Inter', preview: 'Inter', category: 'Modern' },
  { value: 'Roboto', label: 'Roboto', preview: 'Roboto', category: 'Modern' },
  { value: 'Open Sans', label: 'Open Sans', preview: 'Open Sans', category: 'Modern' },
  { value: 'Lato', label: 'Lato', preview: 'Lato', category: 'Modern' },
  { value: 'Montserrat', label: 'Montserrat', preview: 'Montserrat', category: 'Modern' },
  { value: 'Poppins', label: 'Poppins', preview: 'Poppins', category: 'Modern' },
  { value: 'Nunito', label: 'Nunito', preview: 'Nunito', category: 'Modern' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', preview: 'Source Sans Pro', category: 'Modern' },
  
  // Elegant & Stylish
  { value: 'Playfair Display', label: 'Playfair Display', preview: 'Playfair Display', category: 'Elegant' },
  { value: 'Merriweather', label: 'Merriweather', preview: 'Merriweather', category: 'Elegant' },
  { value: 'Crimson Text', label: 'Crimson Text', preview: 'Crimson Text', category: 'Elegant' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', preview: 'Libre Baskerville', category: 'Elegant' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', preview: 'Cormorant Garamond', category: 'Elegant' },
  
  // Tech & Futuristic
  { value: 'Orbitron', label: 'Orbitron', preview: 'Orbitron', category: 'Futuristic' },
  { value: 'Exo 2', label: 'Exo 2', preview: 'Exo 2', category: 'Futuristic' },
  { value: 'Rajdhani', label: 'Rajdhani', preview: 'Rajdhani', category: 'Futuristic' },
  { value: 'Audiowide', label: 'Audiowide', preview: 'Audiowide', category: 'Futuristic' },
  { value: 'Space Grotesk', label: 'Space Grotesk', preview: 'Space Grotesk', category: 'Futuristic' },
  
  // Creative & Artistic
  { value: 'Dancing Script', label: 'Dancing Script', preview: 'Dancing Script', category: 'Creative' },
  { value: 'Pacifico', label: 'Pacifico', preview: 'Pacifico', category: 'Creative' },
  { value: 'Lobster', label: 'Lobster', preview: 'Lobster', category: 'Creative' },
  { value: 'Righteous', label: 'Righteous', preview: 'Righteous', category: 'Creative' },
  { value: 'Fredoka One', label: 'Fredoka One', preview: 'Fredoka One', category: 'Creative' },
  
  // Monospace & Code
  { value: 'JetBrains Mono', label: 'JetBrains Mono', preview: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Fira Code', label: 'Fira Code', preview: 'Fira Code', category: 'Monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', preview: 'Source Code Pro', category: 'Monospace' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono', preview: 'IBM Plex Mono', category: 'Monospace' },
  { value: 'Cascadia Code', label: 'Cascadia Code', preview: 'Cascadia Code', category: 'Monospace' },
  
  // Handwriting & Casual
  { value: 'Caveat', label: 'Caveat', preview: 'Caveat', category: 'Handwriting' },
  { value: 'Kalam', label: 'Kalam', preview: 'Kalam', category: 'Handwriting' },
  { value: 'Comfortaa', label: 'Comfortaa', preview: 'Comfortaa', category: 'Handwriting' },
  { value: 'Quicksand', label: 'Quicksand', preview: 'Quicksand', category: 'Handwriting' },
  { value: 'Varela Round', label: 'Varela Round', preview: 'Varela Round', category: 'Handwriting' },
  
  // Professional & Business
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans', preview: 'IBM Plex Sans', category: 'Professional' },
  { value: 'Work Sans', label: 'Work Sans', preview: 'Work Sans', category: 'Professional' },
  { value: 'DM Sans', label: 'DM Sans', preview: 'DM Sans', category: 'Professional' },
  { value: 'Manrope', label: 'Manrope', preview: 'Manrope', category: 'Professional' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', preview: 'Plus Jakarta Sans', category: 'Professional' }
];

// Font sizes with their display names and CSS values
export const fontSizes = [
  { value: 'small', label: 'Small', cssValue: '0.875rem' },
  { value: 'medium', label: 'Medium', cssValue: '1rem' },
  { value: 'large', label: 'Large', cssValue: '1.125rem' },
  { value: 'extra-large', label: 'Extra Large', cssValue: '1.25rem' }
];

// Predefined color palettes
export const colorPalettes = [
  {
    name: 'Default Blue',
    colors: {
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED',
      accentColor: '#10B981'
    }
  },
  {
    name: 'Ocean',
    colors: {
      primaryColor: '#0EA5E9',
      secondaryColor: '#06B6D4',
      accentColor: '#8B5CF6'
    }
  },
  {
    name: 'Forest',
    colors: {
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B'
    }
  },
  {
    name: 'Sunset',
    colors: {
      primaryColor: '#DC2626',
      secondaryColor: '#EA580C',
      accentColor: '#F59E0B'
    }
  },
  {
    name: 'Purple Dreams',
    colors: {
      primaryColor: '#7C3AED',
      secondaryColor: '#A855F7',
      accentColor: '#EC4899'
    }
  },
  {
    name: 'Minimal Gray',
    colors: {
      primaryColor: '#374151',
      secondaryColor: '#6B7280',
      accentColor: '#10B981'
    }
  }
];

// Helper function to apply CSS variables and customization classes
export const applyCSSVariables = (preferences) => {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove existing customization classes
  body.classList.remove('customization-active', 'high-contrast', 'reduced-motion', 
                       'accessibility-small', 'accessibility-large', 'accessibility-extra-large',
                       'typography-small', 'typography-large', 'typography-extra-large',
                       'button-style-flat', 'button-style-raised', 'button-style-outlined', 'button-style-gradient',
                       'card-style-flat', 'card-style-elevated', 'card-style-bordered', 'card-style-gradient',
                       'animation-slow', 'animation-fast', 'animation-none');
  
  // Set CSS custom properties
  if (preferences.theme) {
    root.style.setProperty('--primary-color', preferences.theme.primaryColor);
    root.style.setProperty('--secondary-color', preferences.theme.secondaryColor);
    root.style.setProperty('--accent-color', preferences.theme.accentColor);
    root.style.setProperty('--background-color', preferences.theme.backgroundColor);
    root.style.setProperty('--text-color', preferences.theme.textColor);
  }
  
  if (preferences.typography) {
    const fontFamily = getFontFamilyCSS(preferences.typography.fontFamily);
    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-size', getFontSizeCSS(preferences.typography.fontSize));
    root.style.setProperty('--font-weight', getFontWeightCSS(preferences.typography.fontWeight));
    root.style.setProperty('--line-height', getLineHeightCSS(preferences.typography.lineHeight));
    
    // Add typography size classes
    if (preferences.typography.fontSize === 'small') {
      body.classList.add('typography-small');
    } else if (preferences.typography.fontSize === 'large') {
      body.classList.add('typography-large');
    } else if (preferences.typography.fontSize === 'extra-large') {
      body.classList.add('typography-extra-large');
    }
  }
  
  if (preferences.layout) {
    root.style.setProperty('--border-radius', getBorderRadiusCSS(preferences.layout.borderRadius));
    root.style.setProperty('--spacing', getSpacingCSS(preferences.layout.spacing));
  }
  
  if (preferences.components) {
    root.style.setProperty('--animation-duration', getAnimationSpeedCSS(preferences.components.animationSpeed));
    
    // Add animation speed classes
    if (preferences.components.animationSpeed === 'slow') {
      body.classList.add('animation-slow');
    } else if (preferences.components.animationSpeed === 'fast') {
      body.classList.add('animation-fast');
    } else if (preferences.components.animationSpeed === 'none') {
      body.classList.add('animation-none');
    }
  }

  // Apply accessibility settings
  if (preferences.accessibility) {
    if (preferences.accessibility.highContrast) {
      body.classList.add('high-contrast');
    }
    if (preferences.accessibility.reducedMotion) {
      body.classList.add('reduced-motion');
    }
    if (preferences.accessibility.fontSize === 'small') {
      body.classList.add('accessibility-small');
    } else if (preferences.accessibility.fontSize === 'large') {
      body.classList.add('accessibility-large');
    } else if (preferences.accessibility.fontSize === 'extra-large') {
      body.classList.add('accessibility-extra-large');
    }
  }

  // Apply component styles
  if (preferences.components) {
    // Button styles
    if (preferences.components.buttonStyle) {
      body.classList.add(`button-style-${preferences.components.buttonStyle}`);
    }
    
    // Card styles
    if (preferences.components.cardStyle) {
      body.classList.add(`card-style-${preferences.components.cardStyle}`);
    }
    
    // Animation settings
    if (preferences.components.showAnimations === false) {
      body.classList.add('reduced-motion');
    }
  }

  // Add the main customization active class
  body.classList.add('customization-active');

  // Apply theme mode - but only if it's not 'auto' or if user has explicitly set a preference
  // This allows the ThemeContext to handle the actual theme switching
  if (preferences.theme?.mode && preferences.theme.mode !== 'auto') {
    // Store the customization theme mode preference but don't override the ThemeContext
    // The ThemeContext will handle the actual dark/light class management
    // Note: We don't directly manipulate the dark class here to avoid conflicts with ThemeContext
  }

};

// Helper functions for CSS value conversion
const getFontSizeCSS = (size) => {
  const sizeMap = {
    'small': '0.875rem',
    'medium': '1rem',
    'large': '1.125rem',
    'extra-large': '1.25rem'
  };
  return sizeMap[size] || sizeMap['medium'];
};

const getFontWeightCSS = (weight) => {
  const weightMap = {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700'
  };
  return weightMap[weight] || weightMap['normal'];
};

const getLineHeightCSS = (height) => {
  const heightMap = {
    'tight': '1.25',
    'normal': '1.5',
    'relaxed': '1.75'
  };
  return heightMap[height] || heightMap['normal'];
};

const getBorderRadiusCSS = (radius) => {
  const radiusMap = {
    'none': '0',
    'small': '0.25rem',
    'medium': '0.5rem',
    'large': '0.75rem'
  };
  return radiusMap[radius] || radiusMap['medium'];
};

const getSpacingCSS = (spacing) => {
  const spacingMap = {
    'compact': '0.75rem',
    'normal': '1rem',
    'comfortable': '1.25rem'
  };
  return spacingMap[spacing] || spacingMap['normal'];
};

const getAnimationSpeedCSS = (speed) => {
  const speedMap = {
    'slow': '0.5s',
    'normal': '0.3s',
    'fast': '0.15s',
    'none': '0s'
  };
  return speedMap[speed] || speedMap['normal'];
};

// Helper function to get font family CSS
export const getFontFamilyCSS = (fontFamily) => {
  const fontMap = {
    // Modern Sans-Serif
    'Inter': '"Inter", sans-serif',
    'Roboto': '"Roboto", sans-serif',
    'Open Sans': '"Open Sans", sans-serif',
    'Lato': '"Lato", sans-serif',
    'Montserrat': '"Montserrat", sans-serif',
    'Poppins': '"Poppins", sans-serif',
    'Nunito': '"Nunito", sans-serif',
    'Source Sans Pro': '"Source Sans Pro", sans-serif',
    
    // Elegant & Stylish
    'Playfair Display': '"Playfair Display", serif',
    'Merriweather': '"Merriweather", serif',
    'Crimson Text': '"Crimson Text", serif',
    'Libre Baskerville': '"Libre Baskerville", serif',
    'Cormorant Garamond': '"Cormorant Garamond", serif',
    
    // Tech & Futuristic
    'Orbitron': '"Orbitron", sans-serif',
    'Exo 2': '"Exo 2", sans-serif',
    'Rajdhani': '"Rajdhani", sans-serif',
    'Audiowide': '"Audiowide", sans-serif',
    'Space Grotesk': '"Space Grotesk", sans-serif',
    
    // Creative & Artistic
    'Dancing Script': '"Dancing Script", cursive',
    'Pacifico': '"Pacifico", cursive',
    'Lobster': '"Lobster", cursive',
    'Righteous': '"Righteous", cursive',
    'Fredoka One': '"Fredoka One", cursive',
    
    // Monospace & Code
    'JetBrains Mono': '"JetBrains Mono", monospace',
    'Fira Code': '"Fira Code", monospace',
    'Source Code Pro': '"Source Code Pro", monospace',
    'IBM Plex Mono': '"IBM Plex Mono", monospace',
    'Cascadia Code': '"Cascadia Code", monospace',
    
    // Handwriting & Casual
    'Caveat': '"Caveat", cursive',
    'Kalam': '"Kalam", cursive',
    'Comfortaa': '"Comfortaa", cursive',
    'Quicksand': '"Quicksand", sans-serif',
    'Varela Round': '"Varela Round", sans-serif',
    
    // Professional & Business
    'IBM Plex Sans': '"IBM Plex Sans", sans-serif',
    'Work Sans': '"Work Sans", sans-serif',
    'DM Sans': '"DM Sans", sans-serif',
    'Manrope': '"Manrope", sans-serif',
    'Plus Jakarta Sans': '"Plus Jakarta Sans", sans-serif'
  };
  
  return fontMap[fontFamily] || fontMap['Inter'];
};
