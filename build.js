const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const pretty = require('pretty')

let des, data
let slices = []

const builder = {

  async build(_des) {
    des = _des
    data = global.data
    const src = path.join(__dirname, './src')
    await fs.copy(src, _des)
    await this.buildSlices()
    await this.buildHtml()
    await this.buildCss()
  },

  async buildCss() {
    const file = path.join(des, './css/style.css')
    let res = fs.readFileSync(file, 'utf8')
    let placeholder = ''
    const w = data.size.width
    const h = data.size.height
    for (let i = 0; i <= data.cuts.length; i++) {
      const slice = data.cuts[i]
      const index = i + 1
      const name = index < 10 ? '0' + index : index
      placeholder += `section.sec${index} {\n  `
      placeholder += `position: relative;\n  `
      placeholder += `width: ${data.size.width}px;\n  `
      placeholder += `height: ${slices[i].height}px;\n  `
      placeholder += `background-image: url(../img/${name}.jpg);\n`
      placeholder += `}\n\n`
    }

    const cw = data.contentWidth !== '100%' ? `${data.contentWidth}px` : '100%'

    placeholder += `section .content {\n  `
    placeholder += `position: relative;\n  `
    placeholder += `width: ${cw};\n  `
    placeholder += `margin-left: auto;\n  `
    placeholder += `margin-right: auto;\n`
    placeholder += `}\n\n`

    res = res.replace('[placeholder]', placeholder)

    await fs.writeFile(file, res)
    return true
  },

  async buildHtml() {
    const file = path.join(des, './index.html')
    let res = fs.readFileSync(file, 'utf8')
    res = res.replace('[viewport]', data.mobile ? data.size.width : 'device-width')
    res = res.replace('[title]', data.title)
    let placeholder = ''
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i], index = i + 1
      let content = `<div class="content">\n`
      for (let j = 0; j < data.links.length; j++) {
        const link = data.links[j]
        const top = link.y - slice.top
        if (link.y > slice.top && link.y < slice.top + slice.height) {
          content += `<a href="${link.href}" target="${link.target}" data-tracking="${link.tracking}" class="button" style="position:absolute;width:${link.w}px;height:${link.h}px;top:${top}px;"></a>\n`
        }
      }
      content += `</div>`
      placeholder += `<section class="sec${index}">${content}\n</section>`
    }
    res = res.replace('[placeholder]', placeholder)
    await fs.writeFile(file, pretty(res))
    return true
  },

  async buildSlices() {
    const w = data.size.width
    const h = data.size.height
    console.log('buildSlices')
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
          quality: 80
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
    return true
  }

}

module.exports = builder