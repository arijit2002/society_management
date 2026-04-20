const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

const { registerAuthHandlers }      = require('./handlers/auth');
const { registerResidentHandlers }  = require('./handlers/residents');
const { registerFeeHandlers }       = require('./handlers/fees');
const { registerComplaintHandlers } = require('./handlers/complaints');
const { registerNoticeHandlers }    = require('./handlers/notices');
const { registerVisitorHandlers }   = require('./handlers/visitors');
const { registerAmenityHandlers }   = require('./handlers/amenities');
const { registerTaskHandlers }      = require('./handlers/tasks');
const { registerStaffHandlers }     = require('./handlers/staff');
const { registerStatsHandlers }     = require('./handlers/stats');

function registerAllHandlers() {
  registerAuthHandlers();
  registerResidentHandlers();
  registerFeeHandlers();
  registerComplaintHandlers();
  registerNoticeHandlers();
  registerVisitorHandlers();
  registerAmenityHandlers();
  registerTaskHandlers();
  registerStaffHandlers();
  registerStatsHandlers();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Society Management System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f8fafc',
    show: false,
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => win.show());

  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  registerAllHandlers();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
