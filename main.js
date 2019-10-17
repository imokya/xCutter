const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const AppWindow = require('./utils/window')
const menu = require('./components/menu')   

const App = {
  init() {
    this.createMainWindow()
    this.bindEvents()
  },
  async openDialog() {
    const res = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png'] }
      ]
    })
    this.filePath = res.filePaths[0]
    if (!res.canceled) { 
      this.mainWindow.loadFile('./renderer/edit.html')
    }
  },
  createMainWindow() {
    this.mainWindow = new AppWindow({
      file: './renderer/index.html'
    })
  },
  bindEvents() {
    ipcMain.on('open', (event, arg) => {
      this.openDialog()
    })
    ipcMain.on('init', (event, arg) => {
      event.reply('filePath', this.filePath)
    })
  }
}

app.on('ready', () => {
  App.init()
})



