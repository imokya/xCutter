const $ = require('jquery')

const rulerEl = $('.ruler')
const wraperEl = $('.cutter-wrap')
const canvasWrap = $('#canvas-wrap')

let cutter, cutters = []
let canvasTop, canvasBottom, canvasLeft
let canvasEl
let active = false

const cutterTool = {

  init() {
    this.initCutter()
    this.bindEvent()
  },

  initCutter() {
    canvasEl = $('canvas')
    canvasTop = canvasEl.offset().top
    canvasLeft = canvasEl.offset().left + 1
    canvasBottom = canvasEl.height() + canvasTop
    this.createFirstCutter()
  },

  createFirstCutter() {
    cutter = this.createCutter()
    cutter.movable = false
    cutter.setLabelText('01')
    cutter.labelEl.removeClass('hide')
    this.setPos(cutter, canvasTop - 2)
  },
  
  bindEvent() {
    let canTouch = false
    $(document).on('mousedown', (e) => {
      if (!active) return
      if (e.clientY > 0 && e.clientY <= 18) {
        cutter = this.createCutter()
        canTouch = true
      } else {
        const el = $(e.target)
        const isCutter = el.hasClass('cutter')
        if (isCutter) {
          cutter = el.data('cutter')
          if (cutter.movable) {
            cutter.labelEl.addClass('hide')
            canTouch = true
          }
        }
      }
    })
    $(document).on('mousemove', (e) => {
      if (canTouch) {
        this.setTranslate(cutter, e.pageY)
      }
    })
    $(document).on('mouseup', (e) => {
      if (canTouch) {
        if (e.clientY <= canvasTop || e.pageY >= canvasBottom) {
          this.removeCutter()
        } else {
          this.setPos(cutter, e.pageY)
          cutter.labelEl.removeClass('hide')
        }
        this.sortCutters()
        canTouch = false
      }
    })
  },
  
  sortCutters() {
    cutters.sort((a, b) => a.pos - b.pos)
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

  setActive(_active) {
    active = _active
    if (active) {
      wraperEl.removeClass('hide')
    } else {
      wraperEl.addClass('hide')
    }
  },

  setTranslate(cutter, y) {
    cutter.el.css({
      transform: `translateY(${y}px)`
    })
  },

  resize() {
    const cw = canvasEl.width()
    const ch = canvasEl.height()
    const ww = document.body.clientWidth
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

module.exports = cutterTool