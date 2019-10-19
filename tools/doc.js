const { remote } = require('electron')

let active, dialog, title = ''
const data = remote.getGlobal('data')

const docTool = {

  init() {
    this.bindEvent()
  },

  bindEvent() {
    dialog = $('#docDialog')
    const apply = dialog.find('.apply')
    apply.on('click', e => {
      title = $.trim(dialog.find('#title').val())
      data.title = title
      dialog.modal('hide')
    })
  },

  restore() {
    title = data.title
    dialog.find('#title').val(title)
  },

  pushData() {
    remote.getGlobal('data').title = title
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