import Observer from './traits/Observer'

import Options from './models/Options'
import Swipe from './models/Swipe'

class PanZoom {
  constructor (options) {
    this.options = options
    this.el = null
    this.swipe = null
  }

  listen () {
    console.log('PanZoom::listen')

    this.swipe = new Swipe()
    this.swipe.setElement(this.el)
    this.swipe.listen(this.fire)
  }

  unlisten () {
    console.log('PanZoom::unlisten')

    this.swipe.unlisten()
    this.swipe = null
  }

  setElement (el) {
    this.el = el
  }
}

function createPanzoom (el, options = {}) {
  if (!el) throw new TypeError('the first argument to createPanzoom must be an Element')

  const panzoom = new PanZoom(new Options(options))
  Object.assign(panzoom, Observer())
  panzoom.setElement(el)
  panzoom.listen()

  return panzoom
}

export {
  PanZoom,
  createPanzoom
}