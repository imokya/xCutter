const { Menu, ipcMain, dialog } = require('electron')
const package = require('../package.json')

const template = [
  {
    label: '文件',
    submenu: [
      { label: '打开', click:() => {
        ipcMain.emit('open')
      }},
      { type: 'separator' },
      { role: 'quit', label: '退出' }
    ]
  },

  {
    label: '项目',
    submenu: [
      { label: '导入', click:() => {
        ipcMain.emit('import')
      }},
      { type: 'separator' },
      { label: '导出', click:() => {
        ipcMain.emit('export')
      }},
    ]
  },

  {
    label: '关于',
    click: () => {
      dialog.showMessageBox(null, {
        type: 'info',
        title: `关于${package.name}`,
        message: `作者: xingway\nhttps://github.com/imokya/${package.name}\n`
      })
    }
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

module.exports = menu
