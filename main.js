const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs")

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-smooth-scrolling')
// Without disable-site-isolation-trials chrome will prevent the access to contentDocument for an iframe of different origin
app.commandLine.appendSwitch('disable-site-isolation-trials') 

let mainWindow

function createWindow()
{
  mainWindow = new BrowserWindow({
    title: "danbooru browser",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }
  })

  // This is to bypass danbooru's restriction on not being loaded in iframes
  mainWindow.webContents.session.webRequest.onHeadersReceived((detail, callback) =>
  {
    const xFrameOriginKey = Object.keys(detail.responseHeaders).find(header => String(header).match(/^x-frame-options$/i));
    if (xFrameOriginKey)
    {
      delete detail.responseHeaders[xFrameOriginKey];
    }
    callback({ cancel: false, responseHeaders: detail.responseHeaders });
  })
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function ()
  {
    mainWindow = null
  })
  mainWindow.loadFile('index.html')
}
app.on('ready', createWindow)

app.on('window-all-closed', function ()
{
  if (process.platform !== 'darwin')
  {
    app.quit()
  }
})

app.on('activate', function ()
{
  if (mainWindow === null)
  {
    createWindow()
  }
})

