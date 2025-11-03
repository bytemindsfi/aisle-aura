import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byteminds.aisleAura',
  appName: 'AisleAura',
  webDir: 'dist'
  /*server: {
    url: "http://192.168.101.108:8080",
    cleartext: true
  }*/,
    ios: {
        contentInset: 'automatic' // Handles safe areas automatically
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