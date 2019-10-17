const $ = require('jquery')
const el = $('.toolbar')

const cutTool = require('../tools/cutter')

const tools = {
  "cut": cutTool
}

const toolbar = {
  init() {
    cutTool.init()
    this.bindEvent()
  },
  bindEvent() {
    el.on('click', 'li', (e) => {
      el.find('li').removeClass('active')
      const target = $(e.currentTarget)
      target.addClass('active')
      const tool = target.data('tool')
      for (let key in tools) {
        if (key === tool) {
          tools[key].setActive(true)
        } else {
          tools[key].setActive(false)
        }
      }
    })
  },
  resize() {
    cutTool.resize()
  }
}

module.exports = toolbar