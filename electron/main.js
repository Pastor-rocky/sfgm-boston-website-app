import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let serverProcess;
const PORT = 56000;
const SERVER_URL = `http://localhost:${PORT}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    title: 'SFGM Boston Website',
    show: false, // Don't show until ready
  });

  // Note: The CSP warning in development is expected and harmless.
  // Electron shows this warning when no CSP is set, but it will NOT appear in packaged/production builds.
  // Setting CSP in development would block Vite's dev server (HMR, module loading, etc.)


  // Prevent navigation away from localhost
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== SERVER_URL) {
      event.preventDefault();
    }
  });

  // Wait for server to be ready, then load
  waitForServer(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(SERVER_URL).then(() => {
        mainWindow.show(); // Show window after loading
      }).catch((err) => {
        console.error('Failed to load URL:', err);
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Also allow opening DevTools with keyboard shortcut (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows/Linux)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'i' && (input.meta || input.control) && input.shift) {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

function startServer() {
  const projectRoot = path.resolve(__dirname, '..');
  const isWindows = process.platform === 'win32';
  
  console.log('🚀 Starting Express server...');
  console.log(`📁 Project root: ${projectRoot}`);
  
  // Start the server using npm run dev
  serverProcess = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        PORT: PORT.toString(),
        NODE_ENV: 'development',
      },
      stdio: 'inherit',
      shell: true,
    }
  );

  serverProcess.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    app.quit();
  });

  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`⚠️  Server exited with code ${code}`);
    }
  });
}

function waitForServer(callback, maxAttempts = 90) {
  let attempts = 0;
  let callbackCalled = false;
  
  const checkServer = () => {
    if (callbackCalled) return; // Prevent multiple callbacks
    
    attempts++;
    
    const req = http.get(SERVER_URL + '/api/health', (res) => {
      // Accept any 2xx status code, or even if we get a response (server is up)
      if ((res.statusCode >= 200 && res.statusCode < 300) && !callbackCalled) {
        console.log('✅ Server is ready!');
        callbackCalled = true;
        callback();
      } else if (!callbackCalled && attempts < maxAttempts) {
        // Server responded but not with 200, keep trying
        setTimeout(checkServer, 1000);
      } else if (!callbackCalled && attempts >= maxAttempts) {
        console.error('❌ Server failed to start in time');
        if (mainWindow && !callbackCalled) {
          callbackCalled = true;
          // Still try to load - server might be up but health check is failing
          callback();
        }
      }
    });
    
    req.on('error', (err) => {
      if (callbackCalled) return;
      
      // If we've tried many times and server is still not responding, give up
      if (attempts >= maxAttempts) {
        console.error('❌ Server failed to start in time');
        if (mainWindow && !callbackCalled) {
          callbackCalled = true;
          mainWindow.loadURL('data:text/html,<h1>Server failed to start</h1><p>Please check the terminal for errors.</p>');
        }
      } else {
        // Keep trying
        setTimeout(checkServer, 1000);
      }
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      if (!callbackCalled && attempts < maxAttempts) {
        setTimeout(checkServer, 1000);
      } else if (!callbackCalled && attempts >= maxAttempts) {
        console.error('❌ Server failed to start in time');
        // Still try to load - might work anyway
        if (mainWindow && !callbackCalled) {
          callbackCalled = true;
          callback();
        }
      }
    });
  };
  
  // Start checking after a short delay to give server time to start
  setTimeout(checkServer, 2000);
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('🛑 Shutting down server...');
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Handle app termination
process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});
