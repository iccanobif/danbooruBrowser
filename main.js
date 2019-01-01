const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs")
const { getUrlList } = require("./getUrlList")

app.disableHardwareAcceleration()

let mainWindow

function createWindow()
{
  mainWindow = new BrowserWindow({ title: "danbooru browser", autoHideMenuBar: true })
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function ()
  {
    console.log("finestra chiusa")
    mainWindow = null
  })
  mainWindow.webContents.on("did-navigate", (ev) =>
  {
    if (!mainWindow.webContents.getURL().startsWith("file:///"))
    {
      const codeToInject = fs.readFileSync("codeToInject.js", { encoding: "utf8" })
      mainWindow.webContents.executeJavaScript(codeToInject)
    }
  })
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

//IPC

function openImagePage(url)
{
  // TODO instead of using loadURL, inject the page's HTML directly.
  // the html has to run "if (typeof module === 'object') {window.module = module; module = undefined;}" before attempting to load jquery

  // Use the "tmp" npm package to save the modified html to a temporary file

  // an alternative would be to intercept loadings of jquery.min.js or whatever it's called, and
  // inject "if (typeof module === 'object') {window.module = module; module = undefined;}" at the beginning of the script. 
  // dunno which event to listen to for doing this, probably it's not possibile

  // mainWindow.loadURL(url, { baseURLForDataURL: "https://danbooru.donmai.us/posts/" })
  mainWindow.loadURL(url)
  // const codeToInject = fs.readFileSync("codeToInject.js", { encoding: "utf8" })
  // mainWindow.webContents.executeJavaScript(codeToInject)
}

let currentTag
let linksForCurrentTag
let indexOfLinksForCurrentTag

ipcMain.on("asynchronous-message", (event, command, argument) =>
{
  console.log(command)
  console.log(argument)

  switch (command)
  {
    case "openTag":
      // argument is the tag to open
      currentTag = argument
      getUrlList(currentTag)
        .then(links =>
        {
          console.log("sto per cercare di aprire la pagina")
          linksForCurrentTag = links
          indexOfLinksForCurrentTag = 0
          openImagePage(linksForCurrentTag[0])
        })
        .catch(exc =>
        {
          throw new Error(exc)
        })
      break
    case "keyPressedFromImagePage":
      // argument is the key pressed
      switch (argument)      
      {
        case "a":
          if (indexOfLinksForCurrentTag == 0)
          {
            // TODO alert the user that there's no other pics to see
          }
          else
          {
            indexOfLinksForCurrentTag--
            openImagePage(linksForCurrentTag[indexOfLinksForCurrentTag])
          }
          break
        case "d":
          indexOfLinksForCurrentTag++
          if (indexOfLinksForCurrentTag >= linksForCurrentTag.length)
          {
            // TODO, should send a message to the render process to show an alert() or something, i guess
          }
          else
          {
            openImagePage(linksForCurrentTag[indexOfLinksForCurrentTag])
          }
          break
        case "e":
          // TODO save
          break
      }
  }
})
