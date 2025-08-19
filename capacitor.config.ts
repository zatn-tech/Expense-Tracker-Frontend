import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.expensetracker.app',
  appName: 'ExpenseTracker',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3b82f6',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      url: 'http://localhost:3000',
      title: 'ExpenseTracker',
      backgroundColor: '#3b82f6',
    }
  },
  ios: {
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: false,
    scheme: 'expensetracker',
    backgroundColor: '#3b82f6',
  },
  android: {
    backgroundColor: '#3b82f6',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    initialFocus: false,
    mixedContentMode: 'compatibility',
    overrideUserAgent: 'ExpenseTracker Mobile App',
  }
};

export default config;
