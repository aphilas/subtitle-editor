import { expMap, setCursor } from '../utils.js'
import VideoPlayer from '../video-player/video-player.js'
import CaptionElement from '../caption/caption.js'

/* custom elements */

customElements.define('video-player', VideoPlayer)
customElements.define('caption-element', CaptionElement)

/** video upload  */

const videoInput = document.querySelector('.video-input')
const videoComponent = document.querySelector('video-player')

const getVideoEl = _ => videoComponent.shadowRoot?.querySelector('.video') || { currentTime: 0 } // fix

videoInput.addEventListener('change', event => {
  const file = videoInput.files[0]
  const objectURL = window.URL.createObjectURL(file)
  videoComponent.setAttribute('src', objectURL)
  videoComponent.setAttribute('type', file.type)
}, false)

/** captions */

// add line break on Enter when editing caption using contenteditable
document.execCommand('defaultParagraphSeparator', false, 'br')

const state = { currentId: 0, captions: {} }
const captionsContainerEl = document.querySelector('.captions-container')

/** initial caption */

const firstCaptionEl = document.createElement('caption-element')
firstCaptionEl.dataset.id = state.currentId++;
captionsContainerEl.appendChild(firstCaptionEl)

state.captions[firstCaptionEl.dataset.id] = { start: 0, el: firstCaptionEl }

/** create new caption */

const captionDuration = n => expMap([1 ,60], [1, 5], n)

const captionAttached = event => {
  event.stopPropagation()
  event.target.shadowRoot.querySelector('.caption-text').focus()
  event.target.removeEventListener('caption-attached', captionAttached)
}

document.addEventListener('caption-enter', ({ detail: { text, el }}) => {
  const previous = state.captions[el.dataset.id]
  previous.text = text
  previous.stop = previous.start + captionDuration(text.length)

  const captionEl = document.createElement('caption-element')
  captionEl.dataset.id = state.currentId++
  captionsContainerEl.appendChild(captionEl)
  state.captions[captionEl.dataset.id] = { start: getVideoEl().currentTime, el: captionEl, prev: previous.el }
  captionEl.addEventListener('caption-attached', captionAttached)
})

document.addEventListener('caption-delete', ({ detail: { el } }) => {
  // do not delete first caption
  if (Object.keys(state.captions).length <= 1) return

  const prev = state.captions[el.dataset.id].prev
  delete state.captions[el.dataset.id]
  el.remove()

  if (prev) {
    const len = state.captions[prev.dataset.id].text.length
    const previousCaptionTextEl = prev.shadowRoot.querySelector('.caption-text')

    if (len >= 0) setCursor(previousCaptionTextEl, len)
    previousCaptionTextEl.focus()
  }
})

/**
 * - Fix focus on Enter bug
 * - Fix setCursor bug
 * - Show start time and end time
 * - Add edit timestamp controls
 * - Merge captions
 * - Refactor video component
 * 
 */