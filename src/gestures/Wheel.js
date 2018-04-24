import Point from '../models/Point'

export default {
  // life cycle handlers
  listen () {
    this.on('wheel', this.moveHandler)
    console.log('wheel2::listen')
  },
  unlisten () {
    console.log('wheel2::unlisten')
    this.off('wheel', this.moveHandler)
  },

  moveHandler (event) {
    // touchpads can give event.deltaY == 0, which is something we never want to handle
    if (event.deltaY === 0) return

    event.point = event.touches[0]
    this.fire('wheelEvent', event)
  }

}
