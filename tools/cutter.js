const $ = require('jquery')

const rulerEl = $('.ruler')
const wraperEl = $('.cutter-wrap')
const canvasWrap = $('#canvas-wrap')

let cutter, cutters = []
let canvasTop, canvasBottom, canvasLeft
let canvasEl

const cutterTool = {
  init() {
    this.bindEvent()
  },
  createFirstCutter() {
    cutter = this.createCutter()
    cutter.movable = false
    cutter.setLabelText('01')
    cutter.labelEl.removeClass('hide')
    this.setPos(cutter, canvasTop - 2)
  },
  bindEvent() {
    let active = false
    $(document).on('mousedown', (e) => {
      if (e.clientY > 0 && e.clientY <= 18) {
        cutter = this.createCutter()
        active = true
      } else {
        const el = $(e.target)
        const isCutter = el.hasClass('cutter')
        if (isCutter) {
          cutter = el.data('cutter')
          if (cutter.movable) {
            cutter.labelEl.addClass('hide')
            active = true
          }
        }
      }
    })
    $(document).on('mousemove', (e) => {
      if (active) {
        this.setTranslate(cutter, e.pageY)
      }
    })
    $(document).on('mouseup', (e) => {
      if (active) {
        if (e.clientY <= canvasTop || e.pageY >= canvasBottom) {
          this.removeCutter()
        } else {
          this.setPos(cutter, e.pageY)
          cutter.labelEl.removeClass('hide')
        }
        this.sortCutters()
        active = false
      }
    })
    $(window).on('load', () => {
      canvasEl = $('canvas')
      canvasTop = canvasEl.offset().top
      canvasLeft = canvasEl.offset().left + 1
      canvasBottom = canvasEl.height() + canvasTop
      this.createFirstCutter()
    })
  },
  sortCutters() {
    cutters.sort((a, b) => {
      return a.pos - b.pos
    })
    for (let i = 1; i <= cutters.length; i++) {
      const cutter = cutters[i - 1]
      const index = i < 10 ? '0' + i : i
      cutter.el.css({
        zIndex: i
      })
      cutter.setLabelText(index)
    }
  },
  setPos(cutter, y) {
    const pos = (y - canvasTop) / canvasEl.height()
    cutter.pos = pos.toFixed(2)
    this.setTranslate(cutter, y)
  },
  setTranslate(cutter, y) {
    cutter.el.css({
      transform: `translateY(${y}px)`
    })
  },
  resize() {
    const cw = canvasEl.width()
    const ch = canvasEl.height()
    const ww = window.innerWidth
    const w = Math.max(ww, cw)
    wraperEl.width(w)

    canvasBottom = canvasEl.height() + canvasTop
    canvasLeft = canvasEl.offset().left + 1

    for (let i = 0; i < cutters.length; i++) {
      const cutter = cutters[i]
      const y = (canvasTop + cutter.pos * ch) | 0
      if (cutter.movable) this.setTranslate(cutter, y)
      cutter.setLabelPos(canvasLeft)
    }
  },
  removeCutter() {
    for (let i = 0; i < cutters.length; i++) {
      const pos = cutters.indexOf(cutter)
      if (pos > -1) cutters.splice(pos, 1)
    }
    cutter.el.remove()
    cutter = null
  },
  createCutter() {
    const el = $('<div>').addClass('cutter')
    const labelEl = $('<div>').addClass('cutter-label hide')
    el.append(labelEl)
    wraperEl.append(el)
    const cutter = {
      movable: true,
      pos: 0,
      labelEl,
      el,
      setLabelPos(x) {
        this.labelEl.css({
          transform: `translateX(${x}px)`
        })
      },
      setLabelText(txt) {
        this.labelEl.text(txt)
      }
    }
    cutter.setLabelPos(canvasLeft)
    cutter.setLabelText('01')
    el.data('cutter', cutter)
    cutters.push(cutter)
    return cutter
  }
}

cutterTool.init()

module.exports = cutterTool