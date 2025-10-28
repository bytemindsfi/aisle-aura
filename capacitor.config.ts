import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.byteminds.aisleAura',
  appName: 'Aisle-aura',
  webDir: 'dist'
  /*server: {
    url: "http://192.168.101.108:8080",
    cleartext: true
  }*/,
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