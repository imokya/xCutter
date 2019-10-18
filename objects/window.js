const { BrowserWindow } = require('electron')
const config = require('../app.json')

class AppWindow extends BrowserWindow {

  constructor(_config) {
    const defaultConfig = {
      width: config.width,
      height: config.height,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        //webSecurity: false
      }
    }
    const finalConfig = { ...defaultConfig, ..._config }
    super(finalConfig)
    this.loadFile(finalConfig.file)
    this.once('ready-to-show', () => {
      this.show()
    })
    this.webContents.openDevTools()
  }
  
}

module.exports = AppWindow