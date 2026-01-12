import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byteminds.aisleAura',
  appName: 'AisleAura',
  webDir: 'dist',
  server: {
      androidScheme: 'https',
  },
    ios: {
        contentInset: 'automatic', // Handles safe areas automatically
        minVersion: '15.0' // Required for @capgo/capacitor-social-login plugin
    },
    android: {
        allowMixedContent: false,
    },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;