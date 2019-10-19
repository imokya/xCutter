const PIXI = require('pixi.js')

const color = 0x4a84ff
const activeColor = 0xae2121
let pixi

class Link extends PIXI.Container {

  constructor(_pixi) {
    pixi = _pixi
    super()
    this.init()
  }

  init() {
    this.info = {
      href: '#',
      target: '_blank',
      tracking: ''
    }
    this.w = 0
    this.h = 0
    this.color = color
    this.graphic = new PIXI.Graphics()
    this.addChild(this.graphic)
    this.uiContainer = new PIXI.Container()
    this.addChild(this.uiContainer)
    this.interactive = true
    this.bindEvent()
    this.setActive(false)
  }

  restore(_link) {
    this.x = _link.x
    this.y = _link.y
    this.w = _link.w
    this.h = _link.h
    this.info.href = _link.href
    this.info.target = _link.target
    this.info.tracking = _link.tracking
    this.draw(_link.w, _link.h)
    this.createUI()
  }

  bindEvent() {
    let canMove, startPos, curPos, pos
    this.on('pointerdown', e => {
      if (e.target === this) {
        canMove = true
      }
    })
    this.on('pointermove', e => {
      if (canMove) {
        curPos = e.data.getLocalPosition(this)
        this.x += e.data.originalEvent.movementX
        this.y += e.data.originalEvent.movementY
      }
    })
    this.on('pointerup', e => {
      if (canMove) canMove = false
    })
    this.on('pointerupoutside', e => {
      if (this.x >= pixi.stage.width) {
        this.remove()
      }
      if (canMove) canMove = false
    })
  }

  createUI() {
    this.createDel()
    this.createDrag()
    this.createSetting()
    this.setActive(true)
  }

  createDel() {
    const del = new PIXI.Sprite.from('img/icons/close.png')
    del.interactive = true
    del.pivot = new PIXI.Point(9, 9)
    del.x = this.w
    this.uiContainer.addChild(del)
    del.on('click', e => {
      this.emit('remove')
    })
    this.del = del
  }

  createDrag() {
    const drag = new PIXI.Sprite.from('img/icons/move.png')
    drag.interactive = true
    drag.pivot = new PIXI.Point(9, 9)
    drag.x = this.w
    drag.y = this.h
    this.uiContainer.addChild(drag)
    let pos, canDrag = false
    drag.on('pointerdown', e => {
      pos = e.data.getLocalPosition(this.parent)
      canDrag = true
    })
    drag.on('pointermove', e => {
      if (canDrag) {
        const curPos = e.data.getLocalPosition(this.parent)
        drag.x += e.data.originalEvent.movementX
        drag.y += e.data.originalEvent.movementY
        drag.x = Math.max(drag.x, 30)
        drag.y = Math.max(drag.y, 30)
        this.draw(drag.x, drag.y)
        this.resize()
      }
    })
    drag.on('pointerup', e => {
      canDrag = false
    })
    drag.on('pointerupoutside', e => {
      canDrag = false
    })
    this.drag = drag
  }

  createSetting() {
    const setting = new PIXI.Sprite.from('img/icons/setting.png')
    setting.interactive = true
    setting.pivot = new PIXI.Point(9, 9)
    this.uiContainer.addChild(setting)
    setting.on('click', e => {
      this.emit('setting')
    })
    this.setting = setting
  }

  resize() {
    this.del.x = this.w
  }

  remove() {
    this.removeAllListeners()
    this.parent.removeChild(this)
  }

  setActive(_active) {
    this.color = _active ? activeColor : color
    this.draw(this.w, this.h)
    if (_active) {
      this.uiContainer.visible = true
      this.parent.addChild(this)
    } else {
      this.uiContainer.visible = false
    }
  }

  draw(_w, _h) {
    this.w = _w
    this.h = _h
    this.graphic.clear()
    this.graphic.beginFill(0x4a84ff, 0.5)
    this.graphic.lineStyle(2, this.color)
    this.graphic.drawRect(0, 0, _w, _h)
    this.graphic.endFill()
  }

}

module.exports = Link