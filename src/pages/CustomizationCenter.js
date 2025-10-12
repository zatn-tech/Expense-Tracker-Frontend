import React, { useState, useEffect, useCallback } from 'react';
import { 
  updatePreferencesSection, 
  resetPreferences,
  exportPreferences,
  importPreferences,
  defaultPreferences,
  applyCSSVariables,
  fontFamilies,
  fontSizes,
  colorPalettes
} from '../services/userPreferencesService';
import { useTheme } from '../context/ThemeContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CustomizationCenter = () => {
  const { theme, setThemeMode } = useTheme();
  const { preferences, loading: contextLoading, updatePreferences: updateContextPreferences } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('theme');
  const [showPreview, setShowPreview] = useState(false);
  
  // Use preferences from context if available, otherwise use local state (which starts as null until loaded)
  const currentPreferences = preferences || localPreferences || defaultPreferences;
  const isLoading = contextLoading || (!preferences && !localPreferences);

  // Initialize local preferences when context preferences are loaded
  useEffect(() => {
    if (preferences && !localPreferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences, localPreferences, isLoading]);

  // Update preferences
  const updatePreferences = useCallback(async (section, data) => {
    try {
      setSaving(true);
      const response = await updatePreferencesSection(section, data);
      if (response.status === 'success') {
        const newPreferences = { ...currentPreferences, [section]: { ...currentPreferences[section], ...data } };
        setLocalPreferences(newPreferences);
        applyCSSVariables(newPreferences);
        updateContextPreferences(newPreferences);
        
        // If theme mode is being updated, sync with ThemeContext
        if (section === 'theme' && data.mode && data.mode !== 'auto') {
          setThemeMode(data.mode);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [currentPreferences, setThemeMode, updateContextPreferences]);

  // Reset to defaults
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all preferences to defaults?')) {
      try {
        setSaving(true);
        const response = await resetPreferences();
        if (response.status === 'success') {
          setLocalPreferences(defaultPreferences);
          applyCSSVariables(defaultPreferences);
          updateContextPreferences(defaultPreferences);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  // Export preferences
  const handleExport = async () => {
    try {
      const response = await exportPreferences();
      const dataStr = JSON.stringify(response.data.preferences, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user-preferences.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  // Import preferences
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedPreferences = JSON.parse(e.target.result);
          const response = await importPreferences(importedPreferences);
          if (response.status === 'success') {
            setLocalPreferences(response.data.preferences);
            applyCSSVariables(response.data.preferences);
            updateContextPreferences(response.data.preferences);
          }
        } catch (err) {
          setError(err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Apply color palette
  const applyColorPalette = (palette) => {
    updatePreferences('theme', palette.colors);
  };


  const tabs = [
    { id: 'theme', label: 'Theme & Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'export', label: 'Export/Import', icon: '💾' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customization Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Personalize your app experience with custom themes, fonts, and layouts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => {
              const root = document.documentElement;
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Debug CSS
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg" style={{ backgroundColor: preferences.theme.primaryColor }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Primary Color</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg" style={{ backgroundColor: preferences.theme.secondaryColor }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Secondary Color</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg" style={{ backgroundColor: preferences.theme.accentColor }}></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Accent Color</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm" style={{ 
              fontFamily: preferences.typography.fontFamily,
              fontSize: preferences.typography.fontSize === 'small' ? '0.875rem' : 
                       preferences.typography.fontSize === 'medium' ? '1rem' :
                       preferences.typography.fontSize === 'large' ? '1.125rem' : '1.25rem',
              fontWeight: preferences.typography.fontWeight
            }}>
              Sample text with your selected font family and size.
            </p>
          </div>
          
          {/* Test CSS Variables */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">CSS Variables Test</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                Primary Color Test (CSS Variable)
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
                Accent Color Test (CSS Variable)
              </div>
              <p style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size)', color: 'var(--text-color)' }}>
                Typography Test (CSS Variables)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'theme' && (
          <ThemeCustomization 
            preferences={currentPreferences} 
            updatePreferences={updatePreferences}
            applyColorPalette={applyColorPalette}
            colorPalettes={colorPalettes}
            currentTheme={theme}
            setThemeMode={setThemeMode}
          />
        )}
        
        {activeTab === 'typography' && (
          <TypographyCustomization 
            preferences={currentPreferences} 
            updatePreferences={updatePreferences}
            fontFamilies={fontFamilies}
            fontSizes={fontSizes}
          />
        )}
        
        {activeTab === 'layout' && (
          <LayoutCustomization 
            preferences={currentPreferences} 
            updatePreferences={updatePreferences}
          />
        )}
        
        {activeTab === 'components' && (
          <ComponentsCustomization 
            preferences={currentPreferences} 
            updatePreferences={updatePreferences}
          />
        )}
        
        {activeTab === 'accessibility' && (
          <AccessibilityCustomization 
            preferences={currentPreferences} 
            updatePreferences={updatePreferences}
          />
        )}
        
        {activeTab === 'export' && (
          <ExportImportSection 
            handleExport={handleExport}
            handleImport={handleImport}
          />
        )}
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Saving preferences...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Customization Component
const ThemeCustomization = ({ preferences, updatePreferences, applyColorPalette, colorPalettes, currentTheme, setThemeMode }) => {
  const [customColors, setCustomColors] = useState({
    primaryColor: preferences.theme.primaryColor,
    secondaryColor: preferences.theme.secondaryColor,
    accentColor: preferences.theme.accentColor,
    backgroundColor: preferences.theme.backgroundColor,
    textColor: preferences.theme.textColor
  });

  const handleColorChange = (colorType, value) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }));
    updatePreferences('theme', { [colorType]: value });
  };

  const colorInputs = [
    { key: 'primaryColor', label: 'Primary Color', description: 'Main brand color for buttons and links' },
    { key: 'secondaryColor', label: 'Secondary Color', description: 'Secondary accent color' },
    { key: 'accentColor', label: 'Accent Color', description: 'Highlight color for important elements' },
    { key: 'backgroundColor', label: 'Background Color', description: 'Main background color' },
    { key: 'textColor', label: 'Text Color', description: 'Primary text color' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Color Palettes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose from predefined color schemes</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {colorPalettes.map((palette, index) => (
            <button
              key={index}
              onClick={() => applyColorPalette(palette)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
            >
              <div className="flex gap-2 mb-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.colors.primaryColor }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.colors.secondaryColor }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.colors.accentColor }}></div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{palette.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Colors</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Fine-tune individual colors</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorInputs.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={customColors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Theme Mode</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Current theme: <span className="font-medium">{currentTheme}</span>
        </p>
        <div className="flex gap-4">
          {['light', 'dark', 'auto'].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="themeMode"
                value={mode}
                checked={preferences.theme.mode === mode}
                onChange={() => {
                  updatePreferences('theme', { mode });
                  if (mode !== 'auto') {
                    setThemeMode(mode);
                  }
                }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{mode}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Use the theme toggle in the header for quick switching. This setting affects your customization preferences.
        </p>
      </div>
    </div>
  );
};

// Typography Customization Component
const TypographyCustomization = ({ preferences, updatePreferences, fontFamilies, fontSizes }) => {
  // Group fonts by category
  const groupedFonts = fontFamilies.reduce((groups, font) => {
    const category = font.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(font);
    return groups;
  }, {});

  const [selectedCategory, setSelectedCategory] = useState('Modern');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Font Family</h3>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(groupedFonts).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Font Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {groupedFonts[selectedCategory]?.map((font) => (
            <button
              key={font.value}
              onClick={() => updatePreferences('typography', { fontFamily: font.value })}
              className={`p-3 border rounded-lg transition-all duration-200 hover:shadow-md ${
                preferences.typography.fontFamily === font.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-200 dark:ring-indigo-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{ fontFamily: font.value }}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{font.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{ fontFamily: font.value }}>
                Aa Bb Cc
              </p>
              {preferences.typography.fontFamily === font.value && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Current Selection */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Selection:</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white" style={{ 
            fontFamily: preferences.typography.fontFamily 
          }}>
            {preferences.typography.fontFamily}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Font Size
          </label>
          <select
            value={preferences.typography.fontSize}
            onChange={(e) => updatePreferences('typography', { fontSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Font Weight
          </label>
          <select
            value={preferences.typography.fontWeight}
            onChange={(e) => updatePreferences('typography', { fontWeight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semibold</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Line Height
          </label>
          <select
            value={preferences.typography.lineHeight}
            onChange={(e) => updatePreferences('typography', { lineHeight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Layout Customization Component
const LayoutCustomization = ({ preferences, updatePreferences }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sidebar Width
          </label>
          <select
            value={preferences.layout.sidebarWidth}
            onChange={(e) => updatePreferences('layout', { sidebarWidth: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Header Height
          </label>
          <select
            value={preferences.layout.headerHeight}
            onChange={(e) => updatePreferences('layout', { headerHeight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Border Radius
          </label>
          <select
            value={preferences.layout.borderRadius}
            onChange={(e) => updatePreferences('layout', { borderRadius: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Spacing
          </label>
          <select
            value={preferences.layout.spacing}
            onChange={(e) => updatePreferences('layout', { spacing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Components Customization Component
const ComponentsCustomization = ({ preferences, updatePreferences }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Button Style
          </label>
          <select
            value={preferences.components.buttonStyle}
            onChange={(e) => updatePreferences('components', { buttonStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="flat">Flat</option>
            <option value="raised">Raised</option>
            <option value="outlined">Outlined</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Style
          </label>
          <select
            value={preferences.components.cardStyle}
            onChange={(e) => updatePreferences('components', { cardStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="flat">Flat</option>
            <option value="elevated">Elevated</option>
            <option value="bordered">Bordered</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Animation Speed
          </label>
          <select
            value={preferences.components.animationSpeed}
            onChange={(e) => updatePreferences('components', { animationSpeed: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showAnimations"
            checked={preferences.components.showAnimations}
            onChange={(e) => updatePreferences('components', { showAnimations: e.target.checked })}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="showAnimations" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Animations
          </label>
        </div>
      </div>
    </div>
  );
};

// Accessibility Customization Component
const AccessibilityCustomization = ({ preferences, updatePreferences }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="highContrast"
            checked={preferences.accessibility.highContrast}
            onChange={(e) => updatePreferences('accessibility', { highContrast: e.target.checked })}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="highContrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            High Contrast Mode
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="reducedMotion"
            checked={preferences.accessibility.reducedMotion}
            onChange={(e) => updatePreferences('accessibility', { reducedMotion: e.target.checked })}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="reducedMotion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Reduced Motion
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="screenReader"
            checked={preferences.accessibility.screenReader}
            onChange={(e) => updatePreferences('accessibility', { screenReader: e.target.checked })}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="screenReader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Screen Reader Optimized
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Accessibility Font Size
        </label>
        <select
          value={preferences.accessibility.fontSize}
          onChange={(e) => updatePreferences('accessibility', { fontSize: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="extra-large">Extra Large</option>
        </select>
      </div>
    </div>
  );
};

// Export/Import Section Component
const ExportImportSection = ({ handleExport, handleImport }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download your current preferences as a JSON file to backup or share your settings.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Preferences
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Upload a JSON file to restore your preferences from a backup.
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
    </div>
  );
};

export default CustomizationCenter;
