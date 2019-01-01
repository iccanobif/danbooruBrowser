const { ipcRenderer } = require('electron')

document.addEventListener("keypress", (ev) =>
{
    ipcRenderer.send("asynchronous-message", "keyPressedFromImagePage", ev.key)
})