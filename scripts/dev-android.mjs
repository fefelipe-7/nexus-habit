import { spawn } from 'child_process';
import os from 'os';

// Get local IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const url = `http://${ip}:3000`;
console.log(`\n🚀 Starting Android Live Reload on ${url}...\n`);

// Run Vite dev server in background
const vite = spawn('npx', ['vite', '--port', '3000', '--host', '0.0.0.0'], { stdio: 'inherit', shell: true });

// Sync Capacitor with environment variable
console.log('🔄 Syncing Capacitor to point to Dev Server...');
const capSync = spawn('npx', ['cap', 'sync', 'android'], { 
  stdio: 'inherit', 
  shell: true,
  env: { ...process.env, VITE_DEV_SERVER_URL: url }
});

capSync.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Sync complete. Opening Android Studio...');
    console.log('📱 The Android app will now automatically reload when you save files in VS Code!');
    spawn('npx', ['cap', 'open', 'android'], { stdio: 'inherit', shell: true });
  } else {
    console.error(`\n❌ Capacitor Sync failed with code ${code}`);
  }
});

process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
