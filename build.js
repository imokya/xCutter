const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const pretty = require('pretty')
const log = require('electron-log')

let src, des, data
let slices = []

const builder = {

  async build(_des) {
    des = _des
    data = global.data
    src = path.join(__dirname, './src')
    await fs.ensureDir(path.join(_des, './img'))
    await fs.ensureDir(path.join(_des, './css'))
    await fs.copy(path.join(src, './js'), path.join(_des, './js'))
    await this.buildSlices()
    await this.buildHtml()
    await this.buildCss()
  },

  async buildCss() {
    const file = path.join(src, './css/style.css')
    let res = fs.readFileSync(file, 'utf8')
    let placeholder = ''
    const w = data.size.width
    const h = data.size.height
    const cw = data.contentWidth !== '100%' ? `${data.contentWidth}px` : '100%'

    for (let i = 0; i <= data.cuts.length; i++) {
      const slice = data.cuts[i]
      const index = i + 1
      const name = index < 10 ? '0' + index : index
      const sw = data.mobile ? `${data.size.width}px`  : '100%'
      placeholder += `section.sec${index} {\n  `
      placeholder += `position: relative;\n  `
      placeholder += `width: ${sw};\n  `
      if (!data.mobile) placeholder += `min-width: ${cw};\n  `
      placeholder += `height: ${slices[i].height}px;\n  `
      placeholder += `background-image: url(../img/${name}.jpg);\n`
      placeholder += `}\n\n`
    }

    placeholder += `section .content {\n  `
    placeholder += `position: relative;\n  `
    placeholder += `width: ${cw};\n  `
    placeholder += `height: 100%;\n  `
    placeholder += `margin-left: auto;\n  `
    placeholder += `margin-right: auto;\n`
    placeholder += `}\n\n`

    res = res.replace('[placeholder]', placeholder)
 
    await fs.writeFile(path.join(des, './css/style.css'), res)
  },

  async buildHtml() {
    const file = path.join(src, './index.html')
    let res = fs.readFileSync(file, 'utf8')
    res = res.replace('[viewport]', data.mobile ? data.size.width : 'device-width')
    res = res.replace('[title]', data.title)
    const cx = data.contentWidth === '100%' ? 0 : (data.size.width - parseInt(data.contentWidth)) / 2
    let placeholder = ''
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i], index = i + 1
      let content = `<div class="content">\n`
      for (let j = 0; j < data.links.length; j++) {
        const link = data.links[j]
        const top = link.y - slice.top
        const left = `${link.x - cx}px`
        if (link.y > slice.top && link.y < slice.top + slice.height) {
          content += `<a href="${link.href}" target="${link.target}" data-tracking="${link.tracking}" class="button" style="position:absolute;width:${link.w}px;height:${link.h}px;left:${left};top:${top}px;"></a>\n`
        }
      }
      content += `</div>`
      placeholder += `<section class="sec${index}">${content}\n</section>`
    }
    res = res.replace('[placeholder]', placeholder)
    await fs.outputFile(path.join(des, './index.html'), pretty(res))
  },

  async buildSlices() {
    const w = data.size.width
    const h = data.size.height
    const sharpObj = sharp(global.filePath)
    let top = 0, height, output
    let cuts = data.cuts, slice
    slices = []
    if (cuts.length > 0) {
      for (let i = 0; i <= cuts.length; i++) {
        const index = i + 1
        slice = i === cuts.length ? 1 : data.cuts[i]
        if (i > 0) {
          top = Math.ceil(cuts[i - 1] * h) + 2
        } else {
          top = 0
        }
        height = Math.ceil(slice * h) - top
        height = i === cuts.length ? height : height + 2
        let name = index < 10 ? '0' + index : index
        output = path.join(des, `./img/${name}.jpg`)
       
        await sharpObj.extract({
          top: top,
          left: 0,
          width: w,
          height: height
        }).jpeg({
          quality: 95
        }).toFile(output)
      
        slices.push({
          top,
          height
        })
      }
    } else {
      slices.push({
        top: 0,
        height: h
      })
    }
  }

}

module.exports = builder