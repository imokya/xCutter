const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const AppWindow = require('./objects/window')
const menu = require('./components/menu')

global.data = {
  title: '',
  cuts: [],
  links: []
}

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
    ipcMain.on('export', (event, arg) => {
      this.mainWindow.webContents.send('pullData')
    })
  }
  
}

app.on('ready', () => {
  App.init()
})

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true