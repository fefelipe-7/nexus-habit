import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexus.habit',
  appName: 'nexus',
  webDir: 'dist',
  server: process.env.VITE_DEV_SERVER_URL ? {
    url: process.env.VITE_DEV_SERVER_URL,
    cleartext: true
  } : undefined
};

export default config;
