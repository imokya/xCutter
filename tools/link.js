const PIXI = require('pixi.js')

let pixi, container

const linkTool = {
  init(_pixi) {
    pixi = _pixi
    container = new PIXI.Container()
    pixi.stage.add(container)
  },
  setActive(_active) {

  }
}

module.exports = linkTool