const { ipcRenderer } = require('electron')
let active


const build = {
  setActive(_active) {
    if(_active) {
      ipcRenderer.send('build')      
    }
    active = _active
  }
}

module.exports = build