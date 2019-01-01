const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs")

app.disableHardwareAcceleration()

let mainWindow

function createWindow()
{
  mainWindow = new BrowserWindow({ title: "danbooru browser", autoHideMenuBar: true })

  // This is to bypass danbooru's restriction on not being loaded in iframes
  mainWindow.webContents.session.webRequest.onHeadersReceived({}, (detail, callback) =>
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
    console.log("finestra chiusa")
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

