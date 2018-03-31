'use strict'

const listenButton = document.getElementById('listenButton')
const domMessages = document.querySelectorAll('.messages__message')
const scene = panzoom.createPanzoom(document.querySelector('.scene'))

const messages = setupMessages()
listen(messages)

function setupMessages () {
  return Array.prototype.map.call(domMessages, function (messageEl) {
    const gesture = messageEl.dataset.gesture
    const method = messageEl.dataset.method

    let unpack = identity
    if (messageEl.dataset.method === 'event') unpack = function (event) { return event.detail }
    return messagesFactory(gesture, method, messageEl.textContent, messageEl, unpack)
  })
}

function identity (x) {
  return x
}

function messagesFactory (gesture, method, title, messageEl, unpack) {
  const message = {
    gesture: gesture,
    method: method,
    counter: 0,
    messageEl: messageEl,
    handler: function (payload) {
      console.log(payload)
      message.messageEl.textContent = title + ' ' + ++message.counter + ' - ' + unpack(payload)
    }
  }

  return message
}

function listen (messages) {

  const promise = messages.filter(function (m) { return m.method === 'promise' })
  const event = messages.filter(function (m) { return m.method === 'event' })
  const on = messages.filter(function (m) { return m.method === 'on' })
  const once = messages.filter(function (m) { return m.method === 'once' })

  // use promise
  promise.forEach(function (m) {
    scene.promise(m.gesture).then(m.handler)
  })

  // listen to event
  event.forEach(function (m) {
    document.body.addEventListener(m.gesture, m.handler, true)
  })

  // subscribe
  on.forEach(function (m) {
    scene.on(m.gesture, m.handler)
  })

  // subscribe once
  once.forEach(function (m) {
    scene.once(m.gesture, m.handler)
  })

  // If you have unlisten then you have to enable listen again
  // , but it's irrelevant when you start to listen again.
  // .listen() is idempotent
  scene.listen()

  listenButton.textContent = getButtonText(scene)

  listenButton.onclick = function () {


    // .unlisten() will remove all event listeners and nullify the gesture recognizers.
    scene.unlisten()
    // If a gesture name is defined then only that gesture is removed.
    // E.g:
    // on.forEach(function (m) {
    //   scene.unlisten(m.gesture)
    // })

    event.forEach(function (m) {
      document.body.removeEventListener(m.gesture, m.handler, true)
    })

    listenButton.textContent = getButtonText(scene)
    listenButton.onclick = listen.bind(null, messages)
  }
}

function getButtonText (scene) {
  return scene.isListening ? 'Unlisten' : 'Listen'
}