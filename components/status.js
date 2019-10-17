const $ = require('jquery')

const el = $('.status-bar')
const scaleEl = el.find('.status-scale')

const status = {
  setScale(scale) {
    scaleEl.text(`${scale}%`)
  }
}

module.exports = status