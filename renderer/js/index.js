const { ipcRenderer } = require('electron')
const $ = require('jquery')

$('#btn-open').on('click', ()=> {
  ipcRenderer.send('open')
})