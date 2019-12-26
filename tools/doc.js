const { remote } = require('electron')

let active, dialog
let title = '', contentWidth = '100%'
let mobile = true
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
      mobile = dialog.find('#mobile').val()
      mobile = mobile === 'true' ? true : false
      contentWidth = $.trim(dialog.find('#content-width').val())
      data.title = title
      data.mobile = mobile ? true : false
      data.contentWidth = contentWidth
      dialog.modal('hide')
    })
  },

  restore() {
    title = data.title
    contentWidth = data.contentWidth
    mobile = data.mobile
    dialog.find('#title').val(title)
    dialog.find('#content-width').val(contentWidth)
    dialog.find('#mobile').val(mobile.toString())
  },

  pushData() {
    const data = remote.getGlobal('data')
    data.title = title
    data.mobile = mobile
    data.contentWidth = contentWidth
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