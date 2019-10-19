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

global.restore = false

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
    if (!res.canceled) { 
      this.filePath = res.filePaths[0]
      const dirname = path.dirname(this.filePath)
      global.data.path = this.filePath.replace(dirname + path.sep, '')
      this.mainWindow.loadFile('./renderer/edit.html')
      global.restore = false
    }
  },

  async openImportDialog() {
    const res = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'project', extensions: ['json'] }
      ]
    })
    if (!res.canceled) { 
      const file  = res.filePaths[0]
      let data = fs.readFileSync(file, 'utf8')
      global.data = JSON.parse(data)
      this.filePath = path.join(path.dirname(file), global.data.path)
      if(!fs.existsSync(this.filePath)) {
        dialog.showMessageBox({
          type: 'error',
          message: '请确保设计稿图片在相同路径'
        })
      } else {
        this.mainWindow.loadFile('./renderer/edit.html')
        global.restore = true
      }
    }
  },

  async openExportDialog() {
    const res = await dialog.showSaveDialog({
      title: '导出项目文件',
      filters: [
        { name: 'project', extensions: ['json'] }
      ]
    })
    if (!res.canceled) { 
      fs.writeFileSync(res.filePath, JSON.stringify(global.data))
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
    ipcMain.on('import', (event, arg) => {
      this.openImportDialog()
    })
    ipcMain.on('export', (event, arg) => {
      this.mainWindow.webContents.send('pullData')
    })
    ipcMain.on('exportData', (event, arg) => {
      this.openExportDialog()
    })
  }
  
}

app.on('ready', () => {
  App.init()
})

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true