const { screen, app, BrowserWindow } = require('electron');
const remoteMain = require('@electron/remote/main');
const isDev = require('electron-is-dev');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
remoteMain.initialize();
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width, height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    }
  });
  remoteMain.enable(win.webContents);
  win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname), '../build/index.html'}`);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length < 1) createWindow();
  })
});

app.on('ready', async () => {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS
  } = require('electron-devtools-installer');
  try {
    const name1 = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Added extension: ${name1}`);
    const name2 = await installExtension(REDUX_DEVTOOLS);
    console.log(`Added extension: ${name2}`);
  } catch (e) {
    console.log("ERRORS INSTALLING DEVELOPER TOOLS:: HERE\'s the stringified ERROR OBJ", e);
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

