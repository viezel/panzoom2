import Translate3d from './mixins/Translate3d'
import Observer from './mixins/Observer'

import Point from './models/Point'
import eventTypes from './models/EventTypes'

import { compose } from './utils'

import Pinch from './gestures/Pinch'
import Pan from './gestures/Pan'
import Wheel from './gestures/Wheel'

import Zoom from './referents/Zoom'
// import Move from './referents/Move'

function panzoom (el, options) {
  if (!el) throw new TypeError('the first argument to panzoom must be an Element')

  const zoom = initReferent(Zoom, el, options)

  zoom.listen()

  return zoom
}

function initReferent (referent, el, options) {
  if (!referent.gestures) {
    throw new Error('Referent must have gestures')
  }

  const observer = Observer()
  const eventNotifier = compose(event => {
    observer.fire(event.type, event)
  }, normalizeEvent)

  const ref = Object.assign(
    {
      $el: observer,
      $gestures: initGestures(referent.gestures, observer),
      listen () {
        proxy('listen', this.$gestures)
        referent.listen.call(this)
        this.$el.currentListenerTypes.forEach(type => {
          if (eventTypes.indexOf(type) > -1) {
            addEvent(el, type, eventNotifier)
          }
        })
      },
      unlisten () {
        proxy('unlisten', referent, this.$gestures)
        referent.unlisten.call(this)
      },
      destroy () {
        proxy('destroy', referent, this.$gestures)
        referent.destroy.call(this)
      }
    },
    referent.methods
  )

  return Object.seal(ref)
}

function initGestures (gestures, observer) {
  Object.values(gestures).forEach(gesture => {
    // Explicitly bind gesture functions
    // to gesture even object, even
    // if they are called from the observer.
    for (let key in gesture) {
      if (gesture[key] instanceof Function) {
        gesture[key] = gesture[key].bind(gesture)
      }
    }
    gesture.$el = observer
    // // FIXME: architecture
    // // add wrapper to on to fix `this` context in gestures
    // const listeners = new Map()
    // gesture.$el.on = (eventName, f, reject) => {
    //   debugger
    //   const bindedHandler = f.bind(gesture)
    //   const bindedErrorHandler = reject && reject.bind(gesture)
    //   listeners.set(f, bindedHandler)
    //   observer.on(eventName, bindedHandler, bindedErrorHandler)
    // }
    // gesture.$el.off = (eventName, f) => {
    //   const bindedHandler = listeners.get(f)
    //   observer.off(eventName, bindedHandler)
    //   listeners.delete(f)
    // }
    // // end wrapper
  })
  return gestures
}

function proxy (methodName, dependents) {
  Object.values(dependents).forEach(gesture => {
    gesture[methodName]()
  })
}

function addEvent (el, type, listener) {
  el.addEventListener(type, listener, true)
}

function removeEvent (el, type, listener) {}

function normalizeEvent (nativeEvent) {
  const event = {
    touches: nativeEvent.touches
      ? Array.prototype.map.call(
          nativeEvent.touches,
          t => new Point({ x: t.pageX, y: t.pageY }))
      : [new Point({ x: nativeEvent.pageX, y: nativeEvent.pageY })]
    ,
    type: nativeEvent.type
  }

  return event
}

panzoom.Translate3d = Translate3d
panzoom.Observer = Observer
panzoom.gestures = {}
panzoom.gestures.Pinch = Pinch
panzoom.gestures.Pan = Pan
panzoom.gestures.Wheel = Wheel

export default panzoom
