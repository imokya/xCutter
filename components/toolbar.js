const $ = require('jquery')
const el = $('.toolbar')

const cutterTool = require('../tools/cutter')

const toolbar = {
  init() {
    this.bindEvent()
  },
  bindEvent() {
    el.on('click', 'li', (e) => {
      el.find('li').removeClass('active')
      const target = $(e.currentTarget)
      target.addClass('active')
    })
  },
  resize() {
    cutterTool.resize()
  }
}

toolbar.init()

module.exports = toolbar