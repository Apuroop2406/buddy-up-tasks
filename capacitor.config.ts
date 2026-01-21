import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1048c9b155e04db090b7633a8896645c',
  appName: 'StudyLock',
  webDir: 'dist',
  server: {
    url: 'https://1048c9b1-55e0-4db0-90b7-633a8896645c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    App: {
      allowBackgroundTasks: true
    }
  }
};

export default config;
