const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const AppWindow = require('./objects/window')
const menu = require('./components/menu')
const path = require('path')
const fs = require('fs')

global.data = {
  title: '',
  size: null,
  path: '',
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
    global.data.path = this.filePath.replace(path.dirname(this.filePath) + path.sep, '')
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
    ipcMain.on('exportData', async (event, arg) => {
      const res = await dialog.showSaveDialog({
        title: '导出项目文件',
        filters: [
          { name: 'project', extensions: ['json'] }
        ]
      })
      if (!res.canceled) { 
        fs.writeFileSync(res.filePath, JSON.stringify(global.data))
      }
    })
  }
  
}

app.on('ready', () => {
  App.init()
})

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true