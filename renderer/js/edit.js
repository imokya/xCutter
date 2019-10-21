const { ipcRenderer, nativeImage, remote } = require('electron')
const $ = require('jquery')
const PIXI = require('pixi.js')

const toolbar = require('../../components/toolbar')
const statusBar = require('../../components/status')

let pixi, size, img

let scales = [
  1.5, 2, 3, 4, 5, 6.25, 8.33, 12.5, 16.67, 25, 33.33, 50, 66.67, 100, 200, 300, 400, 500, 600
]

let scale, scaleID

const App = {
  init() {
    this.bindEvent()
  },
  bindEvent() {
    ipcRenderer.send('init')
    ipcRenderer.on('filePath', (event, arg) => {
      const ni = nativeImage.createFromPath(arg)
      img = new Image()
      img.onload = () => {
        this.onLoad()
      }
      img.src = ni.toDataURL()
      size = ni.getSize()
      remote.getGlobal('data').size = size
      let fixWidth = document.body.clientWidth - 100
      fixWidth = size.width > fixWidth ? fixWidth : 750
      scale = fixWidth / size.width * 100
      scale = (scale * 100 | 0) / 100
      scales = scales.filter(v => v !== scale)
      scales.push(scale)
      scales.sort((a, b) => a - b)
      scaleID = scales.indexOf(scale)
      statusBar.setScale(scale)
    })
    $(document).on('keydown', (e) => {
      const ctrlPressed = e.ctrlKey
      if (ctrlPressed && e.keyCode === 189) this.zoomOut()
      if (ctrlPressed && e.keyCode === 187) this.zoomIn()
    })
  },

  onLoad() {
    $('#spinner').remove()
    $('.tools').removeClass('hide')
    $('.ruler').removeClass('hide')
    $('.status-bar').removeClass('hide')
    
    this.setupCanvas()

    setTimeout(() => {
      toolbar.init(pixi)
      const restore = remote.getGlobal('restore')
      if(restore) toolbar.restore()
      $(window).on('resize', this.resize.bind(this))
      this.resize()
    })
  },
  resize() {
    const ww = window.innerWidth
    const w = size.width * scale / 100 | 0
    const h = size.height * scale / 100 | 0
    pixi.view.style.width = w + 'px'
    pixi.view.style.height = h + 'px'
    const dx = (w - ww) / 2 | 0
    $(window).scrollLeft(dx)
    statusBar.setScale(scale)
    toolbar.resize()
  },
  zoomIn() {
    scaleID += 1
    scaleID = (scaleID === scales.length) ? scales.length - 1 : scaleID
    scale = scales[scaleID]
    this.resize()
  },
  zoomOut() {
    scaleID -= 1
    scaleID = (scaleID < 0) ? 0 : scaleID
    scale = scales[scaleID]
    this.resize()
  },
  setupCanvas() {
    const el = $('#canvas-wrap')
    pixi = new PIXI.Application({
      width: size.width,
      height: size.height,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1
    })
    pixi.view.style.width = size.width + 'px'
    pixi.view.style.height = size.height + 'px'
    el[0].appendChild(pixi.view)
    const texture = new PIXI.Texture.from(img)
    const sprite = new PIXI.Sprite(texture)
    pixi.stage.addChild(sprite)
  }
}

ipcRenderer.on('pullData', (event, arg) => {
  toolbar.pushData()
  ipcRenderer.send('exportData')
})

ipcRenderer.on('getData', (event, arg) => {
  toolbar.pushData()
})

App.init()