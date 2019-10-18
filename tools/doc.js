const { remote } = require('electron')

let active, dialog
let title = ''

const docTool = {

  init() {
    this.bindEvent()
  },

  bindEvent() {
    dialog = $('#docDialog')
    const apply = dialog.find('.apply')
    apply.on('click', e => {
      title = $.trim(dialog.find('#title').val())
      remote.getGlobal('data').title = title
      dialog.modal('hide')
    })
  },

  pushData() {
    return title
  },

  setActive(_active) {
    active = _active
    if (_active) {
      dialog.modal('show')
    } else　{
      dialog.modal('hide')
    }
  }

}

module.exports = docTool