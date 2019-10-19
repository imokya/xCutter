const { remote } = require('electron')
const PIXI = require('pixi.js')
const Link = require('../objects/link')


let pixi, stage, container
let canTouch = false
let pos, link, curLink
let w, h, x, y
let del, active = false
let links = []

const linkTool = {

  init(_pixi) {
    pixi = _pixi
    stage = pixi.stage
    container = new PIXI.Container()
    container.interactive = true
    container.interactiveChildren = true
    stage.addChild(container)
    this.bindEvent()
    this.bindModelEvent()
    this.setActive(false)
  },

  pushData() {
    const data = links.map(link => {
      return {
        x: link.x | 0,
        y: link.y | 0,
        w: link.width | 0,
        h: link.height | 0,
        href: link.info.href,
        target: link.info.target,
        tracking: link.info.tracking
      }
    })

    remote.getGlobal('data').links = data
    return data
  },

  bindModelEvent() {
    const dialog = $('#propDialog')
    dialog.find('.apply').on('click', e => {
      const href = $.trim(dialog.find('#link').val())
      const target = dialog.find('#target').val()
      const tracking = $.trim(dialog.find('#tracking').val())
      curLink.info = { href, target, tracking }
      dialog.modal('hide')
    })
    dialog.on('show.bs.modal', e => {
      dialog.find('#link').val(curLink.info.href)
      dialog.find('#target').val(curLink.info.target)
      dialog.find('#tracking').val(curLink.info.tracking)
    })
  },

  bindEvent() {
    stage.interactive = true
    stage.on('pointerdown', this.onTouchBegan.bind(this))
    stage.on('pointermove', this.onTouchMoved.bind(this))
    stage.on('pointerup', this.onTouchEnded.bind(this))
    stage.on('pointerupoutside', this.onTouchOuted.bind(this))
  },

  createLink() {
    link = new Link(pixi)
    container.addChild(link)
    links.push(link)
    link.on('pointerdown', e => {
      if (e.target instanceof Link) {
        curLink && curLink.setActive(false)
        e.target.setActive(true)
        curLink = e.target
      }
    })
    link.on('setting', e => {
      $('#propDialog').modal({
        keyboard: false
      })
    })
    link.on('remove', e => {
      this.removeLink(curLink)
    })
  },

  onTouchBegan(e) {
    if (!active) return
    if (e.target === stage) {
      w = h = 0
      pos = e.data.getLocalPosition(stage)
      this.createLink()
      canTouch = true
    }
  },

  onTouchMoved(e) {
    if (canTouch) {
      const curPos = e.data.getLocalPosition(stage)
      w = Math.abs(curPos.x - pos.x)
      h = Math.abs(curPos.y - pos.y)
      x = Math.min(pos.x, curPos.x)
      y = Math.min(pos.y, curPos.y)
      link.x = x
      link.y = y
      link.draw(w, h)
    }
  },

  onTouchEnded(e) {
    if (canTouch) {
      if (w < 30 || h < 30) {
        this.removeLink(link)
      } else {
        curLink && curLink.setActive(false)
        link.createUI()
        curLink = link
      }
      canTouch = false
    }
  },

  onTouchOuted(e) {
    if (canTouch) {
      this.removeLink(link)
      canTouch = false
    }
  },

  removeLink(_link) {
    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      if (link === _link) {
        links.splice(i, 1)
      }
    }
    _link && _link.remove()
  },

  setActive(_active) {
    active = _active
    container.visible = _active
    if (!active) {
      curLink && curLink.setActive(false)
    }
  }

}

module.exports = linkTool